"use client";

import { useEffect, useRef, useState } from "react";
import { AudioWaveform, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/formats/curriculum";
import {
  appendedAt,
  DUMP,
  END_LINE,
  hex2,
  HIDDEN_KIND,
  KINDS,
  printable,
  SPEC_H,
  SPEC_W,
  spectrogram,
  waveform,
  wordRight,
  type Kind,
} from "@/lib/formats/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "../lsb/lsb.css";
import "./formats.css";

// Academy Intermediate · Audio and file formats: a ZIP after a JPEG's end
// marker and a word in a spectrogram.
export function Formats() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("STEGANOGRAPHY · MODULE 4")}
      title={t("Audio and file formats.")}
      subtitle={t("What a viewer ignores, a hex dump shows.")}
      description={t(
        "Read binwalk output, find where a JPEG ends and the ZIP glued after it begins, see why polyglot files slip past filters, find a word drawn into a sound’s spectrogram, and pick the right tool for each search.",
      )}
      badge={t("HEX / LAB")}
      icon={<AudioWaveform size={22} />}
      checkpoints={["formats-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "appended":
            return <AppendedWidget {...props} />;
          case "spectrogram":
            return <SpectrogramWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** A hex dump of cat.jpg; mark where the picture ends and what follows. */
function AppendedWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [line, setLine] = useState<number | null>(null);
  const [kind, setKind] = useState<Kind | null>(null);
  const check = (l: number | null, k: Kind | null) =>
    onSolved(l === END_LINE && k === HIDDEN_KIND);
  const label: Record<Kind, string> = { zip: "ZIP", pdf: "PDF", exe: "EXE" };
  return (
    <div className="nl-card cb-card">
      <fieldset className="fm-dump">
        <legend>
          <code>$ xxd cat.jpg</code> {t("(the interesting lines)")}
        </legend>
        {DUMP.map((l, i) => (
          <label key={l.offset} className={`fm-line${line === i ? " on" : ""}`}>
            <input
              type="radio"
              name="fm-line"
              checked={line === i}
              aria-label={t("The picture ends on line {offset}", {
                offset: l.offset.toString(16).padStart(8, "0"),
              })}
              onChange={() => {
                setLine(i);
                check(i, kind);
              }}
            />
            <code className="fm-off">
              {l.offset.toString(16).padStart(8, "0")}
            </code>
            <code className="fm-hex">{l.bytes.map(hex2).join(" ")}</code>
            <code className="fm-ascii">{l.bytes.map(printable).join("")}</code>
          </label>
        ))}
      </fieldset>
      <fieldset className="br-modes">
        <legend>{t("What is hidden after the picture?")}</legend>
        {KINDS.map((k) => (
          <label key={k} className={`br-mode${kind === k ? " on" : ""}`}>
            <input
              type="radio"
              name="fm-kind"
              checked={kind === k}
              onChange={() => {
                setKind(k);
                check(line, k);
              }}
            />
            {label[k]}
          </label>
        ))}
      </fieldset>
      {line !== null && kind !== null && (
        <p
          className={
            line === END_LINE && kind === HIDDEN_KIND ? "nl-pass" : "nl-fail"
          }
          aria-live="polite"
        >
          {line === END_LINE && kind === HIDDEN_KIND ? (
            <>
              <ShieldCheck size={15} aria-hidden="true" />{" "}
              {t(
                "FF D9 ends the picture; from byte {at} a ZIP holding plan.txt begins. unzip cat.jpg opens it.",
                { at: appendedAt() },
              )}
            </>
          ) : (
            t("Look for FF D9, then for the signature right after it.")
          )}
        </p>
      )}
    </div>
  );
}

const SPEC = spectrogram();
const WAVE = waveform();

/** Paint the waveform or the spectrogram. */
function SoundCanvas({
  view,
  label,
}: {
  view: "wave" | "spec";
  label: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(SPEC_W, SPEC_H);
    for (let y = 0; y < SPEC_H; y++)
      for (let x = 0; x < SPEC_W; x++) {
        let rgb: [number, number, number];
        if (view === "spec") {
          const e = SPEC[y][x];
          // Dark blue to yellow, like audio tools.
          rgb = [
            Math.round(255 * e),
            Math.round(220 * e ** 0.8),
            Math.round(90 + 60 * (1 - e)),
          ];
        } else {
          const half = (WAVE[x] * SPEC_H) / 2;
          const on = Math.abs(y - SPEC_H / 2) <= half;
          rgb = on ? [128, 82, 255] : [11, 11, 14];
        }
        img.data.set([...rgb, 255], (y * SPEC_W + x) * 4);
      }
    ctx.putImageData(img, 0, 0);
  }, [view]);
  return (
    <canvas
      ref={ref}
      width={SPEC_W}
      height={SPEC_H}
      className="ls-canvas"
      role="img"
      aria-label={label}
    />
  );
}

/** Switch between the waveform and the spectrogram; type the word. */
function SpectrogramWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [view, setView] = useState<"wave" | "spec">("wave");
  const [guess, setGuess] = useState("");
  const label = { wave: t("Waveform"), spec: t("Spectrogram") } as const;
  return (
    <div className="nl-card cb-card">
      <fieldset className="br-modes">
        <legend>
          <code>signal.wav</code> — {t("view")}
        </legend>
        {(["wave", "spec"] as const).map((v) => (
          <label key={v} className={`br-mode${view === v ? " on" : ""}`}>
            <input
              type="radio"
              name="fm-view"
              checked={view === v}
              onChange={() => setView(v)}
            />
            {label[v]}
          </label>
        ))}
      </fieldset>
      <SoundCanvas view={view} label={label[view]} />
      <p className="cb-label">
        {view === "spec"
          ? t("Time runs left to right; high frequencies are at the top.")
          : t("Loudness over time: it just sounds like noise.")}
      </p>
      <label className="cb-field">
        {t("The hidden word")}
        <input
          value={guess}
          maxLength={20}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => {
            setGuess(e.target.value);
            onSolved(wordRight(e.target.value));
          }}
        />
      </label>
      {wordRight(guess) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t("SOS, written in frequencies too high to notice by ear.")}
        </p>
      )}
    </div>
  );
}
