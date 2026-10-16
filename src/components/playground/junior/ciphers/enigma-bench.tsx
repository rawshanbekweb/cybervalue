"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useT } from "../../network-lab/use-t";
import {
  parsePositions,
  press,
  showPositions,
  type Positions,
  type Trace,
} from "@/lib/junior/enigma";

const ROWS = ["QWERTZUIO", "ASDFGHJK", "PYXCVBNML"];
const STAGES = ["III", "II", "I", "B", "I", "II", "III"];

export function EnigmaBench() {
  const { t } = useT();
  const [start, setStart] = useState<Positions>(parsePositions("AAA"));
  const [positions, setPositions] = useState<Positions>(start);
  const [last, setLast] = useState<Trace | null>(null);
  const [tape, setTape] = useState<{ input: string; output: string }>({
    input: "",
    output: "",
  });

  const reset = (next = start) => {
    setStart(next);
    setPositions(next);
    setLast(null);
    setTape({ input: "", output: "" });
  };
  const key = (letter: string) => {
    const trace = press(letter, positions);
    setPositions(trace.positions);
    setLast(trace);
    setTape({
      input: (tape.input + letter).slice(-60),
      output: (tape.output + trace.output).slice(-60),
    });
  };
  const turn = (index: number, by: number) => {
    const next = [...start] as Positions;
    next[index] = (next[index] + by + 26) % 26;
    reset(next);
  };

  return (
    <div
      className="cr-bench cr-enigma"
      onKeyDown={(event) => {
        const letter = event.key.toUpperCase();
        if (
          /^[A-Z]$/.test(letter) &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey &&
          (event.target as HTMLElement).tagName !== "INPUT"
        ) {
          event.preventDefault();
          key(letter);
        }
      }}
    >
      <div
        className="cr-rotors"
        role="group"
        aria-label={t("Rotorlar", "Rotors")}
      >
        {(["I", "II", "III"] as const).map((name, i) => (
          <div key={name} className="cr-rotor">
            <button
              type="button"
              aria-label={t(`${name} rotorni oldinga`, `Rotor ${name} forward`)}
              onClick={() => turn(i, 1)}
            >
              <ChevronUp size={16} aria-hidden="true" />
            </button>
            <span className="cr-rotor-window" aria-live="polite">
              {showPositions(positions)[i]}
            </span>
            <button
              type="button"
              aria-label={t(`${name} rotorni orqaga`, `Rotor ${name} back`)}
              onClick={() => turn(i, -1)}
            >
              <ChevronDown size={16} aria-hidden="true" />
            </button>
            <small>{name}</small>
          </div>
        ))}
        <div className="cr-rotor-info">
          <span>
            {t("Boshlanish:", "Start:")} <b>{showPositions(start)}</b>
          </span>
          <button type="button" className="jr-linkbtn" onClick={() => reset()}>
            <RotateCcw size={13} aria-hidden="true" />{" "}
            {t("Boshiga qaytarish", "Reset")}
          </button>
        </div>
      </div>

      <div className="cr-lamps" aria-hidden="true">
        {ROWS.map((row) => (
          <div key={row}>
            {row.split("").map((letter) => (
              <span
                key={letter}
                className={last?.output === letter ? "on" : undefined}
              >
                {letter}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div
        className="cr-keys"
        role="group"
        aria-label={t("Klaviatura", "Keyboard")}
      >
        {ROWS.map((row) => (
          <div key={row}>
            {row.split("").map((letter) => (
              <button key={letter} type="button" onClick={() => key(letter)}>
                {letter}
              </button>
            ))}
          </div>
        ))}
      </div>

      {last && (
        <p className="cr-path" aria-live="polite">
          <b>{last.input}</b>
          {last.path.map((step, i) => (
            <span key={i}>
              {" → "}
              <small>{STAGES[i]}</small>
              {step}
            </span>
          ))}
          {" → "}
          <b className="cr-path-lamp">💡 {last.output}</b>
        </p>
      )}
      <div className="cr-two">
        <div className="cr-field">
          <p className="jr-label">{t("Bosilgan harflar", "Keys pressed")}</p>
          <code className="jr-code cr-out">{tape.input || "—"}</code>
        </div>
        <div className="cr-field">
          <p className="jr-label">{t("Yongan chiroqlar", "Lamps lit")}</p>
          <code className="jr-code jr-live cr-out">{tape.output || "—"}</code>
        </div>
      </div>
      <p className="jr-note">
        {t(
          "Kompyuter klaviaturasida ham harflarni bosishingiz mumkin. «AAAAA» ni AAA holatidan tering — har safar boshqa chiroq yonadi.",
          "You can type on your own keyboard too. Type “AAAAA” from AAA — a different lamp lights every time.",
        )}
      </p>
    </div>
  );
}
