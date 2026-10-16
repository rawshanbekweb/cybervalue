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
import { EnigmaBench } from "./enigma-bench";
import { useJuniorState } from "../state";

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
    <div className="cr-mode" role="group" aria-label={t("Mode")}>
      <button
        type="button"
        aria-pressed={!decrypt}
        onClick={() => onChange(false)}
      >
        {t("Encrypt")}
      </button>
      <button
        type="button"
        aria-pressed={decrypt}
        onClick={() => onChange(true)}
      >
        {t("Decrypt")}
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
      <div className="cr-mirror" role="group" aria-label={t("Atbash table")}>
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
      <TextField label={t("Message")} value={text} onChange={setText} />
      <Output label={t("Atbash result")} value={atbash(text)} />
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
        label={decrypt ? t("Letters on the strip") : t("Message")}
        value={text}
        onChange={setText}
      />
      <Slider
        label={t("Lines around the rod (its thickness):")}
        value={rows}
        min={2}
        max={6}
        onChange={setRows}
      />
      <p className="jr-label">{t("The rod (written line by line)")}</p>
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
        {t("The unwound strip (read column by column)")}
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
        label={decrypt ? t("Decrypted message") : t("Ciphertext (the strip)")}
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
        <caption className="visually-hidden">{t("Polybius square")}</caption>
        <thead>
          <tr>
            <th scope="col" aria-label={t("Row / column")} />
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
        label={decrypt ? t("Digits") : t("Message")}
        value={text}
        onChange={(value) => {
          setText(value);
          setStep(-1);
        }}
      />
      <Output
        label={decrypt ? t("Decrypted message") : t("Digits")}
        value={decrypt ? plain : polybiusEncrypt(text)}
      />
      <div className="jr-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={show}
          disabled={!plain}
        >
          <Play size={15} aria-hidden="true" /> {t("Show me")}
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={knock}
          disabled={!plain}
        >
          <Volume2 size={15} aria-hidden="true" /> {t("Knock")}
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
        aria-label={t("Caesar wheel: A becomes {caesar}", {
          caesar: caesar("A", shift),
        })}
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
          {t("key")}
        </text>
      </svg>
      <Slider
        label={t("Shift (key):")}
        value={shift}
        min={0}
        max={25}
        onChange={setShift}
      />
      <TextField
        label={decrypt ? t("Ciphertext") : t("Message")}
        value={text}
        onChange={setText}
      />
      <Output
        label={decrypt ? t("Decrypted message") : t("Ciphertext")}
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
          {t("Ciphertext")}
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
      <div className="cr-mode" role="group" aria-label={t("Language")}>
        <button
          type="button"
          aria-pressed={language === "uz"}
          onClick={() => setLanguage("uz")}
        >
          {t("Uzbek")}
        </button>
        <button
          type="button"
          aria-pressed={language === "en"}
          onClick={() => setLanguage("en")}
        >
          {t("English")}
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
          <span className="cr-key-seen" /> {t("Letters in the ciphertext")}{" "}
          <span className="cr-key-want" />{" "}
          {t("Usual frequency in the language (shifted by {shift})", { shift })}
        </figcaption>
      </figure>
      <Slider
        label={t("Try a shift:")}
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
        <Wand2 size={15} aria-hidden="true" /> {t("Crack it")}
      </button>
      <Output label={t("Decrypted text")} value={caesar(text, -shift)} />
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
    <div className="cr-pkeys" role="group" aria-label={t("Pigpen key")}>
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
      <TextField label={t("Message")} value={text} onChange={setText} />
      <div className="cr-field">
        <p className="jr-label">{t("In symbols")}</p>
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
          label={decrypt ? t("Ciphertext") : t("Message")}
          value={text}
          onChange={setText}
        />
        <TextField label={t("Key word")} value={key} onChange={setKey} />
      </div>
      {keyLetters && letters.length > 0 && (
        <div
          className="cr-vtable"
          role="table"
          aria-label={t("Letter-by-letter working")}
        >
          <div role="row">
            <span role="rowheader">{decrypt ? t("Cipher") : t("Message")}</span>
            {letters.map((letter, i) => (
              <span role="cell" key={i}>
                {letter}
                <small>{letter.charCodeAt(0) - 65}</small>
              </span>
            ))}
          </div>
          <div role="row" className="cr-vkey">
            <span role="rowheader">
              {decrypt ? "−" : "+"} {t("Key")}
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
          "If a number goes past 25, subtract 26 (the alphabet wraps around): after Z comes A again.",
        )}
      </p>
      <Output
        label={decrypt ? t("Decrypted message") : t("Ciphertext")}
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
  // Tapping SOS on the key earns the "Fast fingers" badge.
  const { events, addEvent } = useJuniorState();
  const sentSos = morseDecode(code).replace(/\s/g, "").includes("SOS");
  useEffect(() => {
    if (sentSos && !events.sos) addEvent({ sos: true });
  }, [sentSos, events, addEvent]);

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
          <TextField label={t("Message")} value={text} onChange={setText} />
        </div>
      </div>
      <Output label={t("Morse code")} value={encoded} />
      <div className="jr-actions">
        {playing ? (
          <button
            type="button"
            className="button button-secondary"
            onClick={stop}
          >
            <Pause size={15} aria-hidden="true" /> {t("Stop")}
          </button>
        ) : (
          <button
            type="button"
            className="button button-secondary"
            onClick={play}
            disabled={!encoded}
          >
            <Volume2 size={15} aria-hidden="true" /> {t("Listen")}
          </button>
        )}
      </div>
      <p className="jr-sub">{t("Telegraph key")}</p>
      <p className="jr-note">
        {t(
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
          {t("Press")}
        </button>
        <button
          type="button"
          className="jr-linkbtn"
          onClick={() => {
            setCode("");
            lastRelease.current = 0;
          }}
        >
          {t("Clear")}
        </button>
      </div>
      <Output
        label={t("Your code")}
        value={code ? `${code}  →  ${morseDecode(code)}` : ""}
      />
      <TextField
        label={t("Decode Morse (e.g. ... --- ...)")}
        value={decodeInput}
        onChange={setDecodeInput}
      />
      <Output label={t("Text")} value={morseDecode(decodeInput)} />
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
      aria-label={t("{who}’s secret colour", { who })}
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
          <Swatch rgb={a} label={t("1. Secret colour")} />
          <Swatch rgb={aliMix} label={t("2. Public + secret → sends")} />
          <Swatch rgb={shared} label={t("4. Vali’s mix + own secret")} />
        </div>
        <div className="cr-dh-col cr-dh-mid">
          <p className="jr-sub">{t("Public channel (Eve sees)")}</p>
          <Swatch rgb={PUBLIC} label={t("Public colour")} />
          <Swatch rgb={aliMix} label={t("From Ali →")} />
          <Swatch rgb={valiMix} label={t("← From Vali")} />
          <Swatch rgb={eve} label={t("Eve’s attempt — no match")} />
        </div>
        <div className="cr-dh-col">
          <p className="jr-sub">Vali</p>
          {picker("Vali", vali, setVali)}
          <Swatch rgb={b} label={t("1. Secret colour")} />
          <Swatch rgb={valiMix} label={t("2. Public + secret → sends")} />
          <Swatch rgb={shared} label={t("4. Ali’s mix + own secret")} />
        </div>
      </div>
      <p className="jr-verdict jr-ok">
        {t(
          "Ali and Vali end up with the same colour — their shared key. Even mixing both mixtures, Eve gets a different one.",
        )}
      </p>
      <p className="jr-note">
        {t(
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
  enigma: EnigmaBench,
  publickey: PaintBench,
};
