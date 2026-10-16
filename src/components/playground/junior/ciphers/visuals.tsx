"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Pause, Play, Volume2, Wand2 } from "lucide-react";
import { useT } from "../../network-lab/use-t";
import {
  atbash,
  caesar,
  crackCaesar,
  FREQUENCIES,
  letterCounts,
  mix,
  morseDecode,
  morseEncode,
  pigpen,
  POLYBIUS,
  polybiusCell,
  polybiusDecrypt,
  polybiusEncrypt,
  scytaleDecrypt,
  scytaleGrid,
  toCss,
  vigenere,
  lettersOnly,
  type Rgb,
} from "@/lib/junior/ciphers";
import type { CipherId } from "@/lib/junior/cipher-content";

const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Shared bits ------------------------------------------------------------------

function TextField({
  label,
  value,
  onChange,
  mono = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mono?: boolean;
}) {
  const id = useId();
  return (
    <div className="cr-field">
      <label htmlFor={id} className="jr-label">
        {label}
      </label>
      <input
        id={id}
        className={mono ? "jr-input" : "jr-input cr-plain"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}

function Output({ label, value }: { label: string; value: string }) {
  return (
    <div className="cr-field">
      <p className="jr-label">{label}</p>
      <code className="jr-code jr-live cr-out" aria-live="polite">
        {value || "—"}
      </code>
    </div>
  );
}

function Mode({
  decrypt,
  onChange,
}: {
  decrypt: boolean;
  onChange: (decrypt: boolean) => void;
}) {
  const { t } = useT();
  return (
    <div className="cr-mode" role="group" aria-label={t("Rejim", "Mode")}>
      <button
        type="button"
        aria-pressed={!decrypt}
        onClick={() => onChange(false)}
      >
        {t("Shifrlash", "Encrypt")}
      </button>
      <button
        type="button"
        aria-pressed={decrypt}
        onClick={() => onChange(true)}
      >
        {t("Ochish", "Decrypt")}
      </button>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="cr-field">
      <label htmlFor={id} className="jr-label">
        {label} <strong>{value}</strong>
      </label>
      <input
        id={id}
        className="jr-range"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

// Short beeps for the Polybius taps and Morse. One context per page.
let audio: AudioContext | null = null;
function tone(at: number, length: number, frequency: number) {
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = frequency;
  osc.type = "sine";
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(0.25, at + 0.01);
  gain.gain.setValueAtTime(0.25, at + length - 0.01);
  gain.gain.linearRampToValueAtTime(0, at + length);
  osc.connect(gain).connect(audio.destination);
  osc.start(at);
  osc.stop(at + length + 0.02);
}
function audioNow() {
  try {
    audio ??= new AudioContext();
    void audio.resume();
    return audio.currentTime + 0.05;
  } catch {
    return null;
  }
}

// 1 · Atbash -------------------------------------------------------------------

function AtbashBench() {
  const { t } = useT();
  const [text, setText] = useState("SIRLI XAT");
  const [focus, setFocus] = useState<number | null>(null);
  const used = new Set(lettersOnly(text));
  return (
    <div className="cr-bench">
      <div
        className="cr-mirror"
        role="group"
        aria-label={t("Atbash jadvali", "Atbash table")}
      >
        {ABC.map((letter, i) => {
          const pair = ABC[25 - i];
          const on = focus === i || used.has(letter);
          return (
            <button
              key={letter}
              type="button"
              className={on ? "cr-pair on" : "cr-pair"}
              onClick={() => setFocus(focus === i ? null : i)}
              aria-label={`${letter} → ${pair}`}
            >
              <span>{letter}</span>
              <i aria-hidden="true">↕</i>
              <span>{pair}</span>
            </button>
          );
        })}
      </div>
      <TextField
        label={t("Xabar", "Message")}
        value={text}
        onChange={setText}
      />
      <Output
        label={t("Atbash natijasi", "Atbash result")}
        value={atbash(text)}
      />
    </div>
  );
}

// 2 · Scytale ------------------------------------------------------------------

function ScytaleBench() {
  const { t } = useT();
  const [decrypt, setDecrypt] = useState(false);
  const [text, setText] = useState("DUSHMAN YAQIN");
  const [rows, setRows] = useState(3);
  const plain = decrypt ? scytaleDecrypt(text, rows) : text;
  const grid = scytaleGrid(plain, rows);
  const cols = grid[0]?.length ?? 0;
  const strip = Array.from({ length: cols }, (_, col) =>
    grid.map((line) => ({ letter: line[col], col })),
  ).flat();
  return (
    <div className="cr-bench">
      <Mode decrypt={decrypt} onChange={setDecrypt} />
      <TextField
        label={
          decrypt
            ? t("Tasmadagi harflar", "Letters on the strip")
            : t("Xabar", "Message")
        }
        value={text}
        onChange={setText}
      />
      <Slider
        label={t(
          "Qatorlar soni (tayoqcha yo‘g‘onligi):",
          "Lines around the rod (its thickness):",
        )}
        value={rows}
        min={2}
        max={6}
        onChange={setRows}
      />
      <p className="jr-label">
        {t(
          "Tayoqcha (qatorma-qator yoziladi)",
          "The rod (written line by line)",
        )}
      </p>
      <div className="cr-rod" aria-hidden="true">
        {grid.map((line, row) => (
          <div key={row} className="cr-rod-line">
            {line.map((letter, col) => (
              <span
                key={col}
                style={
                  { "--hue": `${(col * 47) % 360}` } as React.CSSProperties
                }
              >
                {letter}
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="jr-label">
        {t(
          "Yechilgan tasma (ustunma-ustun o‘qiladi)",
          "The unwound strip (read column by column)",
        )}
      </p>
      <div className="cr-strip" aria-hidden="true">
        {strip.map((cell, i) => (
          <span
            key={i}
            style={
              { "--hue": `${(cell.col * 47) % 360}` } as React.CSSProperties
            }
          >
            {cell.letter}
          </span>
        ))}
      </div>
      <Output
        label={
          decrypt
            ? t("Ochilgan xabar", "Decrypted message")
            : t("Shifr (tasma)", "Ciphertext (the strip)")
        }
        value={decrypt ? plain : strip.map((cell) => cell.letter).join("")}
      />
    </div>
  );
}

// 3 · Polybius -----------------------------------------------------------------

function PolybiusBench() {
  const { t } = useT();
  const [decrypt, setDecrypt] = useState(false);
  const [text, setText] = useState("KOD");
  const [step, setStep] = useState(-1);
  const plain = decrypt ? polybiusDecrypt(text) : lettersOnly(text);
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearInterval(timer.current), []);
  const current = step >= 0 ? polybiusCell(plain[step] ?? "") : null;
  const show = () => {
    window.clearInterval(timer.current);
    let i = 0;
    setStep(0);
    timer.current = window.setInterval(() => {
      i++;
      if (i >= plain.length) {
        window.clearInterval(timer.current);
        setStep(-1);
      } else setStep(i);
    }, 900);
  };
  const knock = () => {
    let at = audioNow();
    if (at === null) return;
    for (const letter of plain.slice(0, 12)) {
      const cell = polybiusCell(letter);
      if (!cell) continue;
      for (const count of cell) {
        for (let k = 0; k < count; k++) {
          tone(at, 0.06, 220);
          at += 0.22;
        }
        at += 0.35;
      }
      at += 0.5;
    }
    show();
  };
  return (
    <div className="cr-bench">
      <Mode
        decrypt={decrypt}
        onChange={(d) => {
          setDecrypt(d);
          setText(d ? polybiusEncrypt(plain) : plain);
          setStep(-1);
        }}
      />
      <table className="cr-square">
        <caption className="sr-only">
          {t("Polibiy kvadrati", "Polybius square")}
        </caption>
        <thead>
          <tr>
            <th scope="col" aria-label={t("Qator / ustun", "Row / column")} />
            {[1, 2, 3, 4, 5].map((n) => (
              <th
                key={n}
                scope="col"
                className={current?.[1] === n ? "on" : undefined}
              >
                {n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {POLYBIUS.map((line, row) => (
            <tr key={line}>
              <th
                scope="row"
                className={current?.[0] === row + 1 ? "on" : undefined}
              >
                {row + 1}
              </th>
              {line.split("").map((letter, col) => (
                <td
                  key={letter}
                  className={
                    current && current[0] === row + 1 && current[1] === col + 1
                      ? "hit"
                      : undefined
                  }
                >
                  {letter === "I" ? "I/J" : letter}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <TextField
        label={decrypt ? t("Raqamlar", "Digits") : t("Xabar", "Message")}
        value={text}
        onChange={(value) => {
          setText(value);
          setStep(-1);
        }}
      />
      <Output
        label={
          decrypt
            ? t("Ochilgan xabar", "Decrypted message")
            : t("Raqamlar", "Digits")
        }
        value={decrypt ? plain : polybiusEncrypt(text)}
      />
      <div className="jr-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={show}
          disabled={!plain}
        >
          <Play size={15} aria-hidden="true" /> {t("Ko‘rsatish", "Show me")}
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={knock}
          disabled={!plain}
        >
          <Volume2 size={15} aria-hidden="true" /> {t("Taqillatish", "Knock")}
        </button>
      </div>
    </div>
  );
}

// 4 · Caesar wheel -------------------------------------------------------------

function CaesarBench() {
  const { t } = useT();
  const [decrypt, setDecrypt] = useState(false);
  const [text, setText] = useState("ROMA");
  const [shift, setShift] = useState(3);
  const step = 360 / 26;
  const ring = (radius: number, size: number) =>
    ABC.map((letter, i) => {
      const angle = ((i * step - 90) * Math.PI) / 180;
      return (
        <text
          key={letter}
          x={150 + radius * Math.cos(angle)}
          y={150 + radius * Math.sin(angle)}
          fontSize={size}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(${i * step} ${150 + radius * Math.cos(angle)} ${150 + radius * Math.sin(angle)})`}
        >
          {letter}
        </text>
      );
    });
  return (
    <div className="cr-bench">
      <Mode decrypt={decrypt} onChange={setDecrypt} />
      <svg
        className="cr-wheel"
        viewBox="0 0 300 300"
        role="img"
        aria-label={t(
          `Sezar g‘ildiragi: A harfi ${caesar("A", shift)} ga aylanadi`,
          `Caesar wheel: A becomes ${caesar("A", shift)}`,
        )}
      >
        <circle cx="150" cy="150" r="142" className="cr-wheel-outer" />
        <circle cx="150" cy="150" r="106" className="cr-wheel-inner" />
        <circle cx="150" cy="150" r="70" className="cr-wheel-hub" />
        <g className="cr-wheel-plain">{ring(124, 15)}</g>
        <g
          className="cr-wheel-cipher"
          style={{ transform: `rotate(${-shift * step}deg)` }}
        >
          {ring(88, 14)}
        </g>
        <path d="M150 4 l-7 -0 l7 14 l7 -14 z" className="cr-wheel-mark" />
        <text x="150" y="146" textAnchor="middle" className="cr-wheel-key">
          {shift}
        </text>
        <text x="150" y="168" textAnchor="middle" className="cr-wheel-label">
          {t("kalit", "key")}
        </text>
      </svg>
      <Slider
        label={t("Siljish (kalit):", "Shift (key):")}
        value={shift}
        min={0}
        max={25}
        onChange={setShift}
      />
      <TextField
        label={decrypt ? t("Shifr", "Ciphertext") : t("Xabar", "Message")}
        value={text}
        onChange={setText}
      />
      <Output
        label={
          decrypt
            ? t("Ochilgan xabar", "Decrypted message")
            : t("Shifr", "Ciphertext")
        }
        value={caesar(text, decrypt ? -shift : shift)}
      />
    </div>
  );
}

// 5 · Frequency analysis -------------------------------------------------------

const SAMPLE: Record<"uz" | "en", string> = {
  uz: caesar(
    "Ilm olish har bir inson uchun muhim. Kitob o‘qigan bola dunyoni tanib boradi va har kuni yangi narsalarni kashf qiladi.",
    9,
  ),
  en: caesar(
    "The quick brown fox jumps over the lazy dog while the clever agent reads the secret letter by the light of the evening sun.",
    9,
  ),
};

function FrequencyBench() {
  const { t, locale } = useT();
  const [language, setLanguage] = useState<"uz" | "en">(locale);
  const [text, setText] = useState(SAMPLE[locale]);
  const [shift, setShift] = useState(0);
  const counts = letterCounts(text);
  const total = counts.reduce((sum, n) => sum + n, 0) || 1;
  const expected = FREQUENCIES[language];
  const max = Math.max(
    ...counts.map((n) => (n / total) * 1000),
    ...expected,
    1,
  );
  const textId = useId();
  return (
    <div className="cr-bench">
      <div className="cr-field">
        <label htmlFor={textId} className="jr-label">
          {t("Shifrlangan matn", "Ciphertext")}
        </label>
        <textarea
          id={textId}
          className="jr-input cr-area"
          rows={3}
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
        />
      </div>
      <div className="cr-mode" role="group" aria-label={t("Til", "Language")}>
        <button
          type="button"
          aria-pressed={language === "uz"}
          onClick={() => setLanguage("uz")}
        >
          {t("O‘zbek tili", "Uzbek")}
        </button>
        <button
          type="button"
          aria-pressed={language === "en"}
          onClick={() => setLanguage("en")}
        >
          {t("Ingliz tili", "English")}
        </button>
      </div>
      <figure className="cr-chart">
        <div className="cr-bars" aria-hidden="true">
          {ABC.map((letter, i) => {
            const seen = (counts[i] / total) * 1000;
            const want = expected[(i - shift + 26) % 26];
            return (
              <div key={letter} className="cr-bar">
                <span
                  className="cr-bar-want"
                  style={{ height: `${(want / max) * 100}%` }}
                />
                <span
                  className="cr-bar-seen"
                  style={{ height: `${(seen / max) * 100}%` }}
                />
                <b>{letter}</b>
              </div>
            );
          })}
        </div>
        <figcaption>
          <span className="cr-key-seen" />{" "}
          {t("Shifrdagi harflar", "Letters in the ciphertext")}{" "}
          <span className="cr-key-want" />{" "}
          {t(
            `Tildagi odatiy chastota (${shift} ga surilgan)`,
            `Usual frequency in the language (shifted by ${shift})`,
          )}
        </figcaption>
      </figure>
      <Slider
        label={t("Siljishni sinang:", "Try a shift:")}
        value={shift}
        min={0}
        max={25}
        onChange={setShift}
      />
      <button
        type="button"
        className="button button-secondary"
        onClick={() => setShift(crackCaesar(text, language))}
      >
        <Wand2 size={15} aria-hidden="true" />{" "}
        {t("Avtomatik buzish", "Crack it")}
      </button>
      <Output
        label={t("Ochilgan matn", "Decrypted text")}
        value={caesar(text, -shift)}
      />
    </div>
  );
}

// 6 · Pigpen -------------------------------------------------------------------

export function PigpenGlyph({
  letter,
  size = 34,
}: {
  letter: string;
  size?: number;
}) {
  const glyph = pigpen(letter);
  if (!glyph)
    return <span className="cr-glyph-gap" style={{ width: size / 2 }} />;
  const p = 6;
  const s = 40;
  const m = s / 2;
  let lines = "";
  let dot: [number, number] = [m, m];
  if (glyph.kind === "grid") {
    const [top, right, bottom, left] = glyph.walls;
    if (top) lines += `M${p} ${p}H${s - p}`;
    if (right) lines += `M${s - p} ${p}V${s - p}`;
    if (bottom) lines += `M${p} ${s - p}H${s - p}`;
    if (left) lines += `M${p} ${p}V${s - p}`;
  } else {
    const shapes = {
      up: [`M${p} ${p}L${m} ${s - p}L${s - p} ${p}`, [m, s * 0.36]],
      down: [`M${p} ${s - p}L${m} ${p}L${s - p} ${s - p}`, [m, s * 0.64]],
      left: [`M${p} ${p}L${s - p} ${m}L${p} ${s - p}`, [s * 0.36, m]],
      right: [`M${s - p} ${p}L${p} ${m}L${s - p} ${s - p}`, [s * 0.64, m]],
    } as const;
    lines = shapes[glyph.opens][0];
    dot = [...shapes[glyph.opens][1]] as [number, number];
  }
  return (
    <svg
      className="cr-glyph"
      width={size}
      height={size}
      viewBox={`0 0 ${s} ${s}`}
      aria-hidden="true"
    >
      <path d={lines} />
      {glyph.dot && <circle cx={dot[0]} cy={dot[1]} r="3.2" />}
    </svg>
  );
}

export function PigpenText({ text, size }: { text: string; size?: number }) {
  return (
    <span className="cr-glyphs" role="img" aria-label="pigpen">
      {text.split("").map((char, i) => (
        <PigpenGlyph key={i} letter={char} size={size} />
      ))}
    </span>
  );
}

function PigpenKey() {
  const { t } = useT();
  const grid = (letters: string, dotted: boolean) => (
    <div
      className={
        dotted ? "cr-pkey cr-pkey-grid dotted" : "cr-pkey cr-pkey-grid"
      }
    >
      {letters.split("").map((letter) => (
        <span key={letter}>{letter}</span>
      ))}
    </div>
  );
  const cross = (letters: string, dotted: boolean) => (
    <div className={dotted ? "cr-pkey cr-pkey-x dotted" : "cr-pkey cr-pkey-x"}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <path d="M8 8L92 92M92 8L8 92" />
      </svg>
      {letters.split("").map((letter, i) => (
        <span key={letter} className={`x${i}`}>
          {letter}
        </span>
      ))}
    </div>
  );
  return (
    <div
      className="cr-pkeys"
      role="group"
      aria-label={t("Masonlar shifri kaliti", "Pigpen key")}
    >
      {grid("ABCDEFGHI", false)}
      {grid("JKLMNOPQR", true)}
      {cross("STUV", false)}
      {cross("WXYZ", true)}
    </div>
  );
}

function PigpenBench() {
  const { t } = useT();
  const [text, setText] = useState("XAKER");
  return (
    <div className="cr-bench">
      <PigpenKey />
      <TextField
        label={t("Xabar", "Message")}
        value={text}
        onChange={setText}
      />
      <div className="cr-field">
        <p className="jr-label">{t("Belgilarda", "In symbols")}</p>
        <div className="jr-code cr-glyph-out">
          <PigpenText text={text.toUpperCase().slice(0, 40)} />
        </div>
      </div>
    </div>
  );
}

// 7 · Vigenère -----------------------------------------------------------------

function VigenereBench() {
  const { t } = useT();
  const [decrypt, setDecrypt] = useState(false);
  const [text, setText] = useState("BAYROQ");
  const [key, setKey] = useState("OY");
  const keyLetters = lettersOnly(key);
  const letters = lettersOnly(text).slice(0, 14).split("");
  return (
    <div className="cr-bench">
      <Mode decrypt={decrypt} onChange={setDecrypt} />
      <div className="cr-two">
        <TextField
          label={decrypt ? t("Shifr", "Ciphertext") : t("Xabar", "Message")}
          value={text}
          onChange={setText}
        />
        <TextField
          label={t("Kalit so‘z", "Key word")}
          value={key}
          onChange={setKey}
        />
      </div>
      {keyLetters && letters.length > 0 && (
        <div
          className="cr-vtable"
          role="table"
          aria-label={t("Harfma-harf hisob", "Letter-by-letter working")}
        >
          <div role="row">
            <span role="rowheader">
              {decrypt ? t("Shifr", "Cipher") : t("Xabar", "Message")}
            </span>
            {letters.map((letter, i) => (
              <span role="cell" key={i}>
                {letter}
                <small>{letter.charCodeAt(0) - 65}</small>
              </span>
            ))}
          </div>
          <div role="row" className="cr-vkey">
            <span role="rowheader">
              {decrypt ? "−" : "+"} {t("Kalit", "Key")}
            </span>
            {letters.map((_, i) => {
              const k = keyLetters[i % keyLetters.length];
              return (
                <span role="cell" key={i}>
                  {k}
                  <small>{k.charCodeAt(0) - 65}</small>
                </span>
              );
            })}
          </div>
          <div role="row" className="cr-vout">
            <span role="rowheader">=</span>
            {letters.map((letter, i) => {
              const out = vigenere(
                letter,
                keyLetters[i % keyLetters.length],
                decrypt,
              );
              return (
                <span role="cell" key={i}>
                  {out}
                  <small>{out.charCodeAt(0) - 65}</small>
                </span>
              );
            })}
          </div>
        </div>
      )}
      <p className="jr-note">
        {t(
          "Raqamlar 25 dan oshsa, 26 ni ayiring (alifbo aylanaga o‘xshaydi): Z dan keyin yana A keladi.",
          "If a number goes past 25, subtract 26 (the alphabet wraps around): after Z comes A again.",
        )}
      </p>
      <Output
        label={
          decrypt
            ? t("Ochilgan xabar", "Decrypted message")
            : t("Shifr", "Ciphertext")
        }
        value={vigenere(text, key, decrypt)}
      />
    </div>
  );
}

// 8 · Morse --------------------------------------------------------------------

const UNIT = 0.09; // seconds per dot

function MorseBench() {
  const { t } = useT();
  const [text, setText] = useState("AGENT");
  const [lamp, setLamp] = useState(false);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<number[]>([]);
  const [code, setCode] = useState("");
  const [decodeInput, setDecodeInput] = useState("-.-. -.-- -... . .-.");
  const press = useRef(0);
  const lastRelease = useRef(0);
  const holdOsc = useRef<OscillatorNode | null>(null);
  const encoded = morseEncode(text);

  const stop = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setLamp(false);
    setPlaying(false);
  };
  useEffect(
    () => () => timers.current.forEach((id) => window.clearTimeout(id)),
    [],
  );

  const play = () => {
    stop();
    const start = audioNow();
    let at = 0;
    const plan: [number, number][] = [];
    for (const symbol of encoded) {
      if (symbol === "." || symbol === "-") {
        const length = (symbol === "." ? 1 : 3) * UNIT;
        plan.push([at, length]);
        at += length + UNIT;
      } else if (symbol === " ") at += 2 * UNIT;
      else if (symbol === "/") at += 2 * UNIT;
    }
    for (const [begin, length] of plan) {
      if (start !== null) tone(start + begin, length, 620);
      timers.current.push(
        window.setTimeout(() => setLamp(true), begin * 1000),
        window.setTimeout(() => setLamp(false), (begin + length) * 1000),
      );
    }
    setPlaying(true);
    timers.current.push(window.setTimeout(() => setPlaying(false), at * 1000));
  };

  // The telegraph key: hold it for a dash, tap it for a dot.
  const down = () => {
    const now = performance.now();
    if (lastRelease.current && now - lastRelease.current > 7 * UNIT * 1000)
      setCode((c) => (c ? `${c} / ` : c));
    else if (lastRelease.current && now - lastRelease.current > 3 * UNIT * 1000)
      setCode((c) => (c ? `${c} ` : c));
    press.current = now;
    setLamp(true);
    const at = audioNow();
    if (at !== null && audio) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.frequency.value = 620;
      gain.gain.value = 0.22;
      osc.connect(gain).connect(audio.destination);
      osc.start();
      holdOsc.current = osc;
    }
  };
  const up = () => {
    if (!press.current) return;
    const held = performance.now() - press.current;
    press.current = 0;
    lastRelease.current = performance.now();
    setLamp(false);
    holdOsc.current?.stop();
    holdOsc.current = null;
    setCode((c) => c + (held < 2 * UNIT * 1000 * 1.2 ? "." : "-"));
  };

  return (
    <div className="cr-bench">
      <div className="cr-morse-top">
        <span className={lamp ? "cr-lamp on" : "cr-lamp"} aria-hidden="true" />
        <div className="cr-grow">
          <TextField
            label={t("Xabar", "Message")}
            value={text}
            onChange={setText}
          />
        </div>
      </div>
      <Output label={t("Morze kodi", "Morse code")} value={encoded} />
      <div className="jr-actions">
        {playing ? (
          <button
            type="button"
            className="button button-secondary"
            onClick={stop}
          >
            <Pause size={15} aria-hidden="true" /> {t("To‘xtatish", "Stop")}
          </button>
        ) : (
          <button
            type="button"
            className="button button-secondary"
            onClick={play}
            disabled={!encoded}
          >
            <Volume2 size={15} aria-hidden="true" /> {t("Eshitish", "Listen")}
          </button>
        )}
      </div>
      <p className="jr-sub">{t("Telegraf kaliti", "Telegraph key")}</p>
      <p className="jr-note">
        {t(
          "Tugmani qisqa bosing — nuqta, uzoqroq bosib turing — tire. Harflar orasida biroz kuting.",
          "Tap the key for a dot, hold it a little longer for a dash. Pause between letters.",
        )}
      </p>
      <div className="jr-actions">
        <button
          type="button"
          className="cr-telegraph"
          onPointerDown={down}
          onPointerUp={up}
          onPointerLeave={up}
          onKeyDown={(event) => {
            if ((event.key === " " || event.key === "Enter") && !event.repeat) {
              event.preventDefault();
              down();
            }
          }}
          onKeyUp={(event) => {
            if (event.key === " " || event.key === "Enter") up();
          }}
        >
          {t("Bosing", "Press")}
        </button>
        <button
          type="button"
          className="jr-linkbtn"
          onClick={() => {
            setCode("");
            lastRelease.current = 0;
          }}
        >
          {t("Tozalash", "Clear")}
        </button>
      </div>
      <Output
        label={t("Siz yuborgan kod", "Your code")}
        value={code ? `${code}  →  ${morseDecode(code)}` : ""}
      />
      <TextField
        label={t(
          "Kodni oching (masalan: ... --- ...)",
          "Decode Morse (e.g. ... --- ...)",
        )}
        value={decodeInput}
        onChange={setDecodeInput}
      />
      <Output label={t("Matn", "Text")} value={morseDecode(decodeInput)} />
    </div>
  );
}

// 9 · Paint mixing (Diffie–Hellman) -------------------------------------------

const PUBLIC: Rgb = [250, 214, 60];
const SECRETS: { rgb: Rgb; uz: string; en: string }[] = [
  { rgb: [226, 59, 59], uz: "qizil", en: "red" },
  { rgb: [53, 110, 230], uz: "ko‘k", en: "blue" },
  { rgb: [40, 170, 110], uz: "yashil", en: "green" },
  { rgb: [200, 70, 200], uz: "binafsha", en: "purple" },
];

function Swatch({ rgb, label }: { rgb: Rgb; label: string }) {
  return (
    <div className="cr-swatch">
      <span style={{ background: toCss(rgb) }} aria-hidden="true" />
      <small>{label}</small>
    </div>
  );
}

function PaintBench() {
  const { t, locale } = useT();
  const [ali, setAli] = useState(0);
  const [vali, setVali] = useState(1);
  const a = SECRETS[ali].rgb;
  const b = SECRETS[vali].rgb;
  const aliMix = mix(PUBLIC, a);
  const valiMix = mix(PUBLIC, b);
  const shared = mix(PUBLIC, a, b);
  const eve = mix(PUBLIC, a, PUBLIC, b);
  const picker = (who: string, value: number, set: (n: number) => void) => (
    <div
      className="cr-picker"
      role="radiogroup"
      aria-label={t(`${who}ning maxfiy rangi`, `${who}’s secret colour`)}
    >
      {SECRETS.map((secret, i) => (
        <button
          key={secret.en}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={secret[locale]}
          style={{ background: toCss(secret.rgb) }}
          onClick={() => set(i)}
        />
      ))}
    </div>
  );
  return (
    <div className="cr-bench">
      <div className="cr-dh">
        <div className="cr-dh-col">
          <p className="jr-sub">Ali</p>
          {picker("Ali", ali, setAli)}
          <Swatch rgb={a} label={t("1. Maxfiy rang", "1. Secret colour")} />
          <Swatch
            rgb={aliMix}
            label={t("2. Ochiq + sir → yuboradi", "2. Public + secret → sends")}
          />
          <Swatch
            rgb={shared}
            label={t(
              "4. Valining aralashmasi + o‘z siri",
              "4. Vali’s mix + own secret",
            )}
          />
        </div>
        <div className="cr-dh-col cr-dh-mid">
          <p className="jr-sub">
            {t("Ochiq kanal (Eva ko‘radi)", "Public channel (Eve sees)")}
          </p>
          <Swatch rgb={PUBLIC} label={t("Ochiq rang", "Public colour")} />
          <Swatch rgb={aliMix} label={t("Alidan →", "From Ali →")} />
          <Swatch rgb={valiMix} label={t("← Validan", "← From Vali")} />
          <Swatch
            rgb={eve}
            label={t("Evaning urinishi ✗", "Eve’s attempt ✗")}
          />
        </div>
        <div className="cr-dh-col">
          <p className="jr-sub">Vali</p>
          {picker("Vali", vali, setVali)}
          <Swatch rgb={b} label={t("1. Maxfiy rang", "1. Secret colour")} />
          <Swatch
            rgb={valiMix}
            label={t("2. Ochiq + sir → yuboradi", "2. Public + secret → sends")}
          />
          <Swatch
            rgb={shared}
            label={t(
              "4. Alining aralashmasi + o‘z siri",
              "4. Ali’s mix + own secret",
            )}
          />
        </div>
      </div>
      <p className="jr-verdict jr-ok">
        {t(
          "Ali va Valida bir xil rang chiqdi — bu ularning umumiy kaliti. Eva ikkala aralashmani qo‘shsa ham, boshqa rang oladi.",
          "Ali and Vali end up with the same colour — their shared key. Even mixing both mixtures, Eve gets a different one.",
        )}
      </p>
      <p className="jr-note">
        {t(
          "Haqiqiy kompyuterlarda bo‘yoq o‘rniga juda katta sonlar bilan matematika ishlatiladi: uni bir tomonga hisoblash oson, teskarisiga — deyarli imkonsiz.",
          "Real computers use maths with huge numbers instead of paint: easy to compute one way, practically impossible to undo.",
        )}
      </p>
    </div>
  );
}

export const BENCHES: Record<CipherId, () => React.ReactNode> = {
  atbash: AtbashBench,
  scytale: ScytaleBench,
  polybius: PolybiusBench,
  caesar: CaesarBench,
  frequency: FrequencyBench,
  pigpen: PigpenBench,
  vigenere: VigenereBench,
  morse: MorseBench,
  publickey: PaintBench,
};
