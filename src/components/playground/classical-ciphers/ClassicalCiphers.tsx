"use client";

import { useState } from "react";
import { KeySquare, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import {
  LESSONS,
  PROGRESS_KEY,
  type Widget,
} from "@/lib/classical-ciphers/curriculum";
import {
  CAESAR_CIPHER,
  CAESAR_SHIFT,
  caesar,
  FREQ_CIPHER,
  FREQ_SHIFT,
  keyUnderCrib,
  letterCounts,
  LETTERS,
  period,
  shiftBetween,
  VIG_CIPHER,
  VIG_PLAIN,
  vigenere,
} from "@/lib/classical-ciphers/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "./classical-ciphers.css";

// Academy Intermediate · Classical ciphers: break Caesar by trying every key
// and by counting letters, and read Vigenère from a known first word.
export function ClassicalCiphers() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("CRYPTOGRAPHY · MODULE 1")}
      title={t("Classical ciphers.")}
      subtitle={t("Break them, and learn why.")}
      description={t(
        "Break a Caesar message by trying every key and then by counting letters, read a Vigenère message from its first word, and see what makes the one-time pad perfect and what breaks it.",
      )}
      badge={t("CIPHERS / LAB")}
      icon={<KeySquare size={22} />}
      checkpoints={["classic-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "caesar":
            return <CaesarWidget {...props} />;
          case "freq":
            return <FreqWidget {...props} />;
          case "vigenere":
            return <VigenereWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Turn the shift until the intercepted message reads. */
function CaesarWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [shift, setShift] = useState(0);
  const [all, setAll] = useState(false);
  const change = (value: number) => {
    setShift(value);
    onSolved(value === CAESAR_SHIFT);
  };
  return (
    <div className="nl-card cb-card">
      <div>
        <span className="cb-label">{t("Intercepted message")}</span>
        <p className="cc-text">{CAESAR_CIPHER}</p>
      </div>
      <label className="cb-field">
        {t("Shift back by {n}", { n: shift })}
        <input
          type="range"
          min={0}
          max={25}
          value={shift}
          onChange={(e) => change(Number(e.target.value))}
        />
      </label>
      <div aria-live="polite">
        <span className="cb-label">{t("Decrypted")}</span>
        <p className={`cc-text${shift === CAESAR_SHIFT ? " ok" : ""}`}>
          {caesar(CAESAR_CIPHER, -shift)}
        </p>
        {shift === CAESAR_SHIFT && (
          <p className="nl-pass">
            <ShieldCheck size={15} aria-hidden="true" />{" "}
            {t("The key is {n}. Trying all 25 takes seconds.", { n: shift })}
          </p>
        )}
      </div>
      <button
        type="button"
        className="nl-ghost"
        aria-expanded={all}
        onClick={() => setAll(!all)}
      >
        {all ? t("Hide every shift") : t("Show every shift")}
      </button>
      {all && (
        <ol className="cc-all" start={0}>
          {Array.from({ length: 26 }, (_, n) => (
            <li key={n}>
              <button type="button" onClick={() => change(n)}>
                <span>{n}</span> {caesar(CAESAR_CIPHER, -n)}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Letter counts of a long Caesar text; mark the cipher letter for “a”. */
function FreqWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [pick, setPick] = useState("");
  const counts = letterCounts(FREQ_CIPHER);
  const max = Math.max(...counts);
  const shift = pick ? shiftBetween("a", pick) : null;
  return (
    <div className="nl-card cb-card">
      <div>
        <span className="cb-label">{t("Ciphertext")}</span>
        <p className="cc-text cc-long">{FREQ_CIPHER}</p>
      </div>
      <figure className="cc-chart">
        <figcaption className="cb-label">
          {t("How often each letter appears in the ciphertext")}
        </figcaption>
        <ol className="cc-bars">
          {LETTERS.map((letter, i) => (
            <li key={letter} className={pick === letter ? "on" : ""}>
              <span
                className="cc-bar"
                style={{ height: `${(counts[i] / max) * 100}%` }}
              />
              <span className="cc-letter">{letter}</span>
              <span className="visually-hidden">
                {t("{count} times in the text", { count: counts[i] })}
              </span>
            </li>
          ))}
        </ol>
      </figure>
      <label className="cb-field">
        {t("The cipher letter that stands for “a”")}
        <select
          value={pick}
          onChange={(e) => {
            setPick(e.target.value);
            onSolved(
              e.target.value !== "" &&
                shiftBetween("a", e.target.value) === FREQ_SHIFT,
            );
          }}
        >
          <option value="">—</option>
          {LETTERS.map((letter) => (
            <option key={letter} value={letter}>
              {letter}
            </option>
          ))}
        </select>
      </label>
      {shift !== null && (
        <div aria-live="polite">
          <span className="cb-label">
            {t("Decrypted with shift {n}", { n: shift })}
          </span>
          <p className={`cc-text cc-long${shift === FREQ_SHIFT ? " ok" : ""}`}>
            {caesar(FREQ_CIPHER, -shift)}
          </p>
        </div>
      )}
    </div>
  );
}

/** A known first word shows the key; the key opens the message. */
function VigenereWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [crib, setCrib] = useState("");
  const [key, setKey] = useState("");
  const under = keyUnderCrib(VIG_CIPHER, crib);
  const opened = key ? vigenere(VIG_CIPHER, key, true) : "";
  return (
    <div className="nl-card cb-card">
      <div>
        <span className="cb-label">{t("Intercepted message")}</span>
        <p className="cc-text">{VIG_CIPHER}</p>
      </div>
      <div className="cb-grid">
        <label className="cb-field">
          {t("The word you think it starts with")}
          <input
            value={crib}
            maxLength={20}
            spellCheck={false}
            autoCapitalize="off"
            onChange={(e) => setCrib(e.target.value)}
          />
        </label>
        <label className="cb-field">
          {t("Key")}
          <input
            value={key}
            maxLength={20}
            spellCheck={false}
            autoCapitalize="off"
            onChange={(e) => {
              setKey(e.target.value);
              onSolved(
                vigenere(VIG_CIPHER, e.target.value, true) === VIG_PLAIN,
              );
            }}
          />
        </label>
      </div>
      <div aria-live="polite">
        {under && (
          <p className="cb-out">
            {t("Key letters under your word")}: <code>{under}</code>
            {under.length > period(under).length && (
              <>
                {" "}
                ·{" "}
                {t("it repeats every {n} letters", {
                  n: period(under).length,
                })}
              </>
            )}
          </p>
        )}
        {opened && (
          <>
            <span className="cb-label">{t("Decrypted")}</span>
            <p className={`cc-text${opened === VIG_PLAIN ? " ok" : ""}`}>
              {opened}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
