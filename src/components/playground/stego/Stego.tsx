"use client";

import { useState } from "react";
import { EyeOff, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/stego/curriculum";
import {
  acrosticRight,
  bitsOf,
  COVER,
  decodeBits,
  message,
  ONE,
  POEMS,
  SECRET,
  ZERO,
} from "@/lib/stego/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./stego.css";

// Academy Intermediate · Steganography, the idea: an acrostic and a chat
// message carrying zero-width bits.
export function Stego() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("STEGANOGRAPHY · MODULE 1")}
      title={t("Hiding in plain sight.")}
      subtitle={t(
        "Encryption hides what a message says; steganography hides that it exists.",
      )}
      description={t(
        "Tell hiding from encrypting, read a word out of a poem’s first letters, find a secret tucked into a chat message as invisible characters, read a steghide command, and see where hiding is used for good and for harm.",
      )}
      badge={t("STEGO / LAB")}
      icon={<EyeOff size={22} />}
      checkpoints={["stego-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "acrostic":
            return <AcrosticWidget {...props} />;
          case "zerowidth":
            return <ZeroWidthWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** A poem in the reader's language; type the hidden word. */
function AcrosticWidget({ onSolved }: WidgetProps) {
  const { t, locale } = useT();
  const [guess, setGuess] = useState("");
  const poem = POEMS[locale];
  const right = acrosticRight(locale, guess);
  return (
    <div className="nl-card cb-card">
      <blockquote className={`sg-poem${right ? " solved" : ""}`}>
        {poem.lines.map((line, i) => (
          <p key={i}>
            <span className="sg-first">{line[0]}</span>
            {line.slice(1)}
          </p>
        ))}
      </blockquote>
      <label className="cb-field">
        {t("The hidden word")}
        <input
          value={guess}
          maxLength={20}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => {
            setGuess(e.target.value);
            onSolved(acrosticRight(locale, e.target.value));
          }}
        />
      </label>
      {right && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t("Found it: the first letters spell {word}.", {
            word: poem.answer,
          })}
        </p>
      )}
    </div>
  );
}

/** A chat message with invisible bits after its first word. */
function ZeroWidthWidget({ onSolved }: WidgetProps) {
  const { t, locale } = useT();
  const [reveal, setReveal] = useState(false);
  const [decoded, setDecoded] = useState(false);
  const [answer, setAnswer] = useState("");
  const text = message(locale);
  const bits = bitsOf(text);
  return (
    <div className="nl-card cb-card">
      <div className="sg-chat">
        <span className="sg-from">Aziza</span>
        <p className="sg-bubble">
          {reveal
            ? [...text].map((c, i) =>
                c === ZERO || c === ONE ? (
                  <span key={i} className={`sg-bit${c === ONE ? " one" : ""}`}>
                    {c === ONE ? "1" : "0"}
                  </span>
                ) : (
                  <span key={i}>{c}</span>
                ),
              )
            : text}
        </p>
      </div>
      <p className="cb-label">
        {t("Visible characters: {visible} · actual length: {actual}", {
          visible: COVER[locale].length,
          actual: [...text].length,
        })}
      </p>
      <div className="sg-actions">
        <button
          type="button"
          className="nl-primary"
          onClick={() => setReveal(true)}
        >
          {t("Show invisible characters")}
        </button>
        <button
          type="button"
          className="nl-primary"
          disabled={!reveal}
          onClick={() => setDecoded(true)}
        >
          {t("Decode the bits (8 per character)")}
        </button>
      </div>
      {decoded && (
        <pre className="al-code sg-bits" tabIndex={0}>
          {bits
            .match(/.{8}/g)!
            .map((byte) => `${byte} → ${decodeBits(byte)}`)
            .join("\n")}
        </pre>
      )}
      <label className="cb-field">
        {t("The hidden text")}
        <input
          value={answer}
          maxLength={20}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => {
            setAnswer(e.target.value);
            onSolved(e.target.value.trim() === SECRET);
          }}
        />
      </label>
      {answer.trim() === SECRET && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t("“13:00” — a meeting time nobody else in the chat could see.")}
        </p>
      )}
    </div>
  );
}
