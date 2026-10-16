"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Square, Volume2 } from "lucide-react";
import { useT } from "../network-lab/use-t";

const never = () => () => {};
const supported = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

// Reads a passage aloud with the browser's own speech engine, for students
// who read slowly or prefer to listen. Nothing is sent anywhere. Devices
// without an Uzbek voice read with another one, and the button says so.
export function Narrator({ text }: { text: string }) {
  const { t, locale } = useT();
  const available = useSyncExternalStore(never, supported, () => false);
  const [speaking, setSpeaking] = useState(false);
  const [missingVoice, setMissingVoice] = useState(false);

  // Stop talking when the passage changes or the panel goes away.
  useEffect(
    () => () => {
      if (supported()) window.speechSynthesis.cancel();
    },
    [text],
  );

  if (!available) return null;

  const speak = () => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const lang = locale === "uz" ? "uz-UZ" : "en-US";
    utterance.lang = lang;
    const voice = synth
      .getVoices()
      .find((v) => v.lang.toLowerCase().startsWith(locale));
    if (voice) utterance.voice = voice;
    setMissingVoice(locale === "uz" && !voice);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  };

  return (
    <span className="jr-narrator">
      <button
        type="button"
        className="jr-linkbtn"
        onClick={speak}
        aria-pressed={speaking}
      >
        {speaking ? (
          <Square size={13} aria-hidden="true" />
        ) : (
          <Volume2 size={14} aria-hidden="true" />
        )}{" "}
        {speaking ? t("Stop") : t("Listen")}
      </button>
      {missingVoice && (
        <small>
          {t("No Uzbek voice on this device; reading with another voice.")}
        </small>
      )}
    </span>
  );
}
