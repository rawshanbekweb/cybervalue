// The animated pictures of the video lessons. Every scene is drawn from its
// progress p (0…1) alone — no timers or CSS animations — so seeking, pausing
// and frame-by-frame MP4 rendering all show the same picture.
import {
  BookOpen,
  Boxes,
  ChefHat,
  CircleCheck,
  CircleX,
  CookingPot,
  DoorClosed,
  FingerprintPattern,
  GraduationCap,
  KeyRound,
  Languages,
  Lock,
  ShieldCheck,
  Stamp,
  Terminal,
  ToggleRight,
  TriangleAlert,
  Beef,
  FileCheck,
} from "lucide-react";
import type { Icon, TermLine, Visual } from "@/lib/video-lessons/types";
import {
  binary,
  bytesOf,
  charBytes,
  hex,
  sha256,
  toBase64,
  xorByte,
} from "@/lib/crypto-basics/tools";

const ICONS: Record<Icon, typeof Lock> = {
  lock: Lock,
  key: KeyRound,
  terminal: Terminal,
  book: BookOpen,
  chef: ChefHat,
  boxes: Boxes,
  seal: FileCheck,
  grinder: Beef,
  doors: DoorClosed,
  stamp: Stamp,
  switch: ToggleRight,
  guard: ShieldCheck,
  teacher: GraduationCap,
  kettle: CookingPot,
  warning: TriangleAlert,
  check: CircleCheck,
};

const clamp = (x: number) => Math.min(1, Math.max(0, x));
/** Progress through the part of the scene between a and b. */
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (x: number) => 1 - (1 - x) ** 3;
/** Fade and rise in as x goes from 0 to 1. */
const rise = (x: number): React.CSSProperties => ({
  opacity: ease(x),
  transform: `translateY(${(1 - ease(x)) * 2}cqw)`,
});

export function SceneView({ visual, p }: { visual: Visual; p: number }) {
  switch (visual.kind) {
    case "title":
      return <TitleScene {...visual} p={p} />;
    case "points":
      return <PointsScene {...visual} p={p} />;
    case "analogy":
      return <AnalogyScene {...visual} p={p} />;
    case "bytes":
      return <BytesScene text={visual.text} p={p} />;
    case "base64":
      return <Base64Scene plain={visual.plain} p={p} />;
    case "three":
      return <ThreeScene p={p} />;
    case "hash":
      return <HashScene a={visual.a} b={visual.b} p={p} />;
    case "mirrors":
      return <MirrorsScene p={p} />;
    case "salt":
      return <SaltScene p={p} />;
    case "dictionary":
      return <DictionaryScene p={p} />;
    case "xor":
      return <XorScene plain={visual.plain} keyByte={visual.key} p={p} />;
    case "keylen":
      return <KeyLengthScene p={p} />;
    case "signature":
      return <SignatureScene p={p} />;
    case "terminal":
      return <TerminalScene lines={visual.lines} p={p} />;
    case "code":
      return <CodeScene {...visual} p={p} />;
    case "boxes":
      return <BoxesScene vars={visual.vars} p={p} />;
    case "loop":
      return (
        <LoopScene items={visual.items} variable={visual.variable} p={p} />
      );
    case "countdown":
      return <CountdownScene p={p} />;
    case "logscan":
      return <LogScanScene p={p} />;
  }
}

function TitleScene({
  title,
  subtitle,
  icon,
  p,
}: {
  title: string;
  subtitle: string;
  icon: Icon;
  p: number;
}) {
  const Glyph = ICONS[icon];
  const pulse = 1 + Math.sin(p * Math.PI * 4) * 0.03;
  return (
    <div className="vl-center">
      <div
        className="vl-hero-icon"
        style={{ ...rise(seg(p, 0, 0.15)), scale: String(pulse) }}
      >
        <Glyph />
      </div>
      <span className="vl-brand" style={rise(seg(p, 0.05, 0.2))}>
        CYBERVALUE · AKADEMIYA
      </span>
      <h2 className="vl-title" style={rise(seg(p, 0.1, 0.3))}>
        {title}
      </h2>
      <p className="vl-subtitle" style={rise(seg(p, 0.2, 0.4))}>
        {subtitle}
      </p>
    </div>
  );
}

function PointsScene({
  heading,
  items,
  p,
}: {
  heading: string;
  items: string[];
  p: number;
}) {
  const step = 0.85 / (items.length + 0.5);
  return (
    <div className="vl-panel">
      <h3 className="vl-heading" style={rise(seg(p, 0, 0.08))}>
        {heading}
      </h3>
      <ol className="vl-points">
        {items.map((item, i) => {
          const x = seg(p, 0.05 + i * step, 0.05 + i * step + 0.08);
          const current = p >= 0.05 + i * step && p < 0.05 + (i + 1) * step;
          return (
            <li key={item} className={current ? "on" : ""} style={rise(x)}>
              <span>{i + 1}</span>
              {item}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function AnalogyScene({
  icon,
  heading,
  text,
  p,
}: {
  icon: Icon;
  heading: string;
  text: string;
  p: number;
}) {
  const Glyph = ICONS[icon];
  return (
    <div className="vl-analogy">
      <div
        className="vl-analogy-icon"
        style={{
          ...rise(seg(p, 0, 0.15)),
          rotate: `${Math.sin(p * Math.PI * 3) * 4}deg`,
        }}
      >
        <Glyph />
      </div>
      <div>
        <span className="vl-tag" style={rise(seg(p, 0.08, 0.2))}>
          O‘XSHATISH
        </span>
        <h3 className="vl-heading" style={rise(seg(p, 0.12, 0.26))}>
          {heading}
        </h3>
        <p className="vl-text" style={rise(seg(p, 0.22, 0.4))}>
          {text}
        </p>
      </div>
    </div>
  );
}

function BytesScene({ text, p }: { text: string; p: number }) {
  const chars = charBytes(text);
  const total = chars.reduce((n, c) => n + c.bytes.length, 0);
  // Position of each character's first byte among all bytes.
  const firsts = chars.map((_, ci) =>
    chars.slice(0, ci).reduce((n, c) => n + c.bytes.length, 0),
  );
  return (
    <div className="vl-panel">
      <h3 className="vl-heading" style={rise(seg(p, 0, 0.08))}>
        “{text}” → baytlar
      </h3>
      <div className="vl-bytes">
        {chars.map(({ char, bytes }, ci) => (
          <div
            key={ci}
            className="vl-char"
            style={rise(seg(p, 0.05 + ci * 0.06, 0.15 + ci * 0.06))}
          >
            <strong>{char}</strong>
            <div className="vl-char-bytes">
              {bytes.map((byte, bi) => {
                const at =
                  0.25 + ((firsts[ci] + bi) / Math.max(1, total)) * 0.5;
                const x = seg(p, at, at + 0.12);
                return (
                  <div key={bi} className="vl-byte" style={rise(x)}>
                    <span className="vl-dec">{byte}</span>
                    <span className="vl-bin">{binary(byte)}</span>
                    <span className="vl-hex">{hex([byte])}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="vl-foot" style={rise(seg(p, 0.75, 0.9))}>
        {chars.length} belgi · {total} bayt · UTF-8
      </p>
    </div>
  );
}

function Base64Scene({ plain, p }: { plain: string; p: number }) {
  const bytes = bytesOf(plain);
  const encoded = toBase64(plain);
  const groups = Math.ceil(bytes.length / 3);
  const shown = Math.floor(seg(p, 0.15, 0.8) * groups + 0.0001);
  return (
    <div className="vl-panel">
      <h3 className="vl-heading" style={rise(seg(p, 0, 0.08))}>
        Base64: 3 bayt → 4 belgi
      </h3>
      <div className="vl-mono vl-big" style={rise(seg(p, 0.05, 0.15))}>
        {plain}
      </div>
      <div className="vl-groups">
        {Array.from({ length: groups }, (_, g) => (
          <div key={g} className={`vl-group${g < shown ? " on" : ""}`}>
            <span className="vl-mono">
              {hex(bytes.slice(g * 3, g * 3 + 3)).replace(/(..)/g, "$1 ")}
            </span>
            <span className="vl-arrow">↓</span>
            <strong className="vl-mono">
              {g < shown ? encoded.slice(g * 4, g * 4 + 4) : "····"}
            </strong>
          </div>
        ))}
      </div>
      <div className="vl-mono vl-result" style={rise(seg(p, 0.8, 0.92))}>
        {encoded}
      </div>
    </div>
  );
}

function ThreeScene({ p }: { p: number }) {
  const cards = [
    {
      glyph: Languages,
      name: "Kodlash",
      like: "tarjima",
      rule: "Kalitsiz ochiladi",
      ex: "Base64 · hex",
    },
    {
      glyph: FingerprintPattern,
      name: "Hash",
      like: "barmoq izi",
      rule: "Hech qachon ochilmaydi",
      ex: "SHA-256 · bcrypt",
    },
    {
      glyph: Lock,
      name: "Shifr",
      like: "seyf",
      rule: "Faqat kalit bilan",
      ex: "AES · RSA",
    },
  ];
  return (
    <div className="vl-three">
      {cards.map((c, i) => {
        const Glyph = c.glyph;
        return (
          <div
            key={c.name}
            className="vl-card"
            style={rise(seg(p, 0.08 + i * 0.22, 0.2 + i * 0.22))}
          >
            <Glyph />
            <h3>{c.name}</h3>
            <span className="vl-tag">{c.like}</span>
            <p>{c.rule}</p>
            <small className="vl-mono">{c.ex}</small>
          </div>
        );
      })}
    </div>
  );
}

function HashScene({ a, b, p }: { a: string; b: string; p: number }) {
  const ha = sha256(a);
  const hb = sha256(b);
  const same = a === b;
  const reveal = Math.floor(seg(p, 0.2, 0.7) * 64);
  const row = (text: string, digest: string, other: string, delay: number) => (
    <div className="vl-hash-row" style={rise(seg(p, delay, delay + 0.1))}>
      <span className="vl-mono vl-input">“{text}”</span>
      <span className="vl-arrow">→</span>
      <span className="vl-mono vl-digest">
        {digest.split("").map((ch, i) => (
          <span
            key={i}
            className={
              i >= reveal ? "dim" : !same && ch !== other[i] ? "diff" : ""
            }
          >
            {i < reveal ? ch : "·"}
          </span>
        ))}
      </span>
    </div>
  );
  const differ = ha.split("").filter((c, i) => c !== hb[i]).length;
  return (
    <div className="vl-panel">
      <h3 className="vl-heading" style={rise(seg(p, 0, 0.08))}>
        SHA-256
      </h3>
      {row(a, ha, hb, 0.05)}
      {same ? null : row(b, hb, ha, 0.12)}
      <p className="vl-foot" style={rise(seg(p, 0.72, 0.85))}>
        {same
          ? "Har doim 64 ta hex belgi — matn qancha uzun bo‘lmasin"
          : `Bitta harf farqi → 64 belgidan ${differ} tasi o‘zgardi`}
      </p>
    </div>
  );
}

function MirrorsScene({ p }: { p: number }) {
  const official = sha256("installer v2.4");
  const mirrors = [
    { name: "oyna-1", digest: sha256("installer v2.4 ") },
    { name: "oyna-2", digest: official },
    { name: "oyna-3", digest: sha256("installer v2.4+malware") },
  ];
  return (
    <div className="vl-panel">
      <div className="vl-official" style={rise(seg(p, 0, 0.12))}>
        <FileCheck />
        <span>Rasmiy hash</span>
        <span className="vl-mono">
          {official.slice(0, 12)}…{official.slice(-8)}
        </span>
      </div>
      <div className="vl-mirrors">
        {mirrors.map((m, i) => {
          const at = 0.2 + i * 0.22;
          const checked = p > at + 0.12;
          const ok = m.digest === official;
          return (
            <div
              key={m.name}
              className={`vl-mirror${checked ? (ok ? " ok" : " bad") : ""}`}
              style={rise(seg(p, at, at + 0.1))}
            >
              <strong>{m.name}</strong>
              <span className="vl-mono">
                {m.digest.slice(0, 12)}…{m.digest.slice(-8)}
              </span>
              {checked && (ok ? <CircleCheck /> : <CircleX />)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SaltScene({ p }: { p: number }) {
  const users = [
    ["ali", "qwerty123", "k9"],
    ["vali", "Bahor!2026", "x2"],
    ["olim", "qwerty123", "m4"],
  ];
  const salted = p > 0.55;
  return (
    <div className="vl-panel">
      <h3 className="vl-heading" style={rise(seg(p, 0, 0.08))}>
        {salted ? "Tuz bilan: hash(tuz + parol)" : "Tuzsiz: hash(parol)"}
      </h3>
      <table className="vl-table">
        <tbody>
          {users.map(([name, password, salt], i) => {
            const digest = sha256(salted ? salt + password : password);
            const twin = !salted && password === "qwerty123";
            return (
              <tr
                key={name}
                className={twin && p > 0.3 ? "twin" : ""}
                style={rise(seg(p, 0.05 + i * 0.07, 0.15 + i * 0.07))}
              >
                <td>{name}</td>
                {salted && <td className="vl-mono vl-salt">{salt}</td>}
                <td className="vl-mono">{digest.slice(0, 24)}…</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="vl-foot" style={rise(seg(p, 0.3, 0.4))}>
        {salted
          ? "Parollar bir xil, hashlar har xil"
          : "ali va olim — bir xil hash, demak bir xil parol"}
      </p>
    </div>
  );
}

const WORDS = [
  "123456",
  "password",
  "salom123",
  "iloveyou",
  "qwerty",
  "dragon",
];
function DictionaryScene({ p }: { p: number }) {
  const target = sha256("qwerty");
  const at = Math.min(WORDS.length, Math.floor(seg(p, 0.15, 0.75) * 5) + 1);
  return (
    <div className="vl-panel">
      <div className="vl-official bad" style={rise(seg(p, 0, 0.1))}>
        <TriangleAlert />
        <span>Sizib chiqqan hash</span>
        <span className="vl-mono">{target.slice(0, 20)}…</span>
      </div>
      <ul className="vl-dict">
        {WORDS.slice(0, at).map((word) => {
          const digest = sha256(word);
          const hit = digest === target;
          return (
            <li key={word} className={hit ? "hit" : ""}>
              <span className="vl-mono">{word}</span>
              <span className="vl-arrow">→</span>
              <span className="vl-mono">{digest.slice(0, 20)}…</span>
              {hit ? <CircleCheck /> : <CircleX />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function XorScene({
  plain,
  keyByte,
  p,
}: {
  plain: number;
  keyByte: number;
  p: number;
}) {
  const cipher = xorByte(plain, keyByte);
  const back = p > 0.62;
  const top = back ? cipher : plain;
  const result = back ? plain : cipher;
  const local = back ? seg(p, 0.66, 0.9) : seg(p, 0.15, 0.55);
  const shown = Math.floor(local * 8 + 0.0001);
  const row = (label: string, byte: number, limit = 8) => (
    <div className="vl-bits-row">
      <span className="vl-bits-label">{label}</span>
      {binary(byte)
        .split("")
        .map((bit, i) => (
          <span key={i} className={`vl-bit${bit === "1" ? " one" : ""}`}>
            {i < limit ? bit : "·"}
          </span>
        ))}
      <span className="vl-mono vl-letter">
        {limit >= 8 ? `“${String.fromCharCode(byte)}”` : ""}
      </span>
    </div>
  );
  return (
    <div className="vl-panel">
      <h3 className="vl-heading" style={rise(seg(p, 0, 0.08))}>
        {back ? "Shifr XOR kalit = asl matn" : "Matn XOR kalit = shifr"}
      </h3>
      <div className="vl-bits">
        {row(back ? "shifr" : "matn", top)}
        {row("kalit", keyByte)}
        <hr />
        {row(back ? "matn" : "shifr", result, shown)}
      </div>
      <p className="vl-foot">0 ⊕ 0 = 0 · 1 ⊕ 1 = 0 · 0 ⊕ 1 = 1</p>
    </div>
  );
}

const SPANS = [
  [8, "bir zumda"],
  [40, "bir soniya"],
  [56, "bir necha kun"],
  [80, "ming yillar"],
  [128, "koinot yoshidan ko‘p"],
] as const;
function KeyLengthScene({ p }: { p: number }) {
  const bits = Math.round(8 + seg(p, 0.1, 0.85) * 120);
  const label = SPANS.findLast(([b]) => bits >= b)?.[1] ?? SPANS[0][1];
  return (
    <div className="vl-panel">
      <h3 className="vl-heading" style={rise(seg(p, 0, 0.08))}>
        Kalit uzunligi
      </h3>
      <div className="vl-keylen">
        <strong className="vl-mono">{bits} bit</strong>
        <span className="vl-mono">2^{bits} ta kalit</span>
        <div className="vl-meter">
          <span style={{ width: `${((bits - 8) / 120) * 100}%` }} />
        </div>
        <p>
          Hammasini sinash: <strong>{label}</strong>
        </p>
      </div>
      <div className="vl-ticks">
        {SPANS.map(([b, l]) => (
          <span key={b} className={bits >= b ? "on" : ""}>
            {b} bit · {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function SignatureScene({ p }: { p: number }) {
  const signed = p > 0.2;
  const checked = p > 0.4;
  const forged = p > 0.62;
  const reChecked = p > 0.78;
  return (
    <div className="vl-sign">
      <div className="vl-doc" style={rise(seg(p, 0, 0.12))}>
        <span className="vl-tag">Bank xabari</span>
        <p>
          Aliga{" "}
          <strong className={forged ? "forged" : ""}>
            {forged ? "900 000" : "100 000"}
          </strong>{" "}
          so‘m o‘tkazilsin
        </p>
        {signed && (
          <span className="vl-stamp" style={rise(seg(p, 0.2, 0.3))}>
            <Stamp /> imzo: 2f9a
          </span>
        )}
      </div>
      <div className="vl-keys">
        <div className={`vl-key${signed && !checked ? " on" : ""}`}>
          <KeyRound /> Yopiq kalit · imzolaydi
        </div>
        <div className={`vl-key${checked ? " on" : ""}`}>
          <KeyRound /> Ochiq kalit · tekshiradi
        </div>
        {checked && (
          <div
            className={`vl-verdict ${reChecked ? "bad" : "ok"}`}
            style={rise(seg(p, reChecked ? 0.78 : 0.4, reChecked ? 0.86 : 0.5))}
          >
            {reChecked ? <CircleX /> : <CircleCheck />}
            {reChecked ? "Imzo mos emas — soxta!" : "Imzo to‘g‘ri"}
          </div>
        )}
      </div>
    </div>
  );
}

function TerminalScene({ lines, p }: { lines: TermLine[]; p: number }) {
  // Commands type out one after another; output appears with its command.
  const weights = lines.map((l) => (l.cmd ? l.cmd.length + 8 : 6));
  const sum = weights.reduce((a, b) => a + b, 0);
  const ends = weights.map((_, i) =>
    weights.slice(0, i + 1).reduce((a, b) => a + b, 0),
  );
  const span = seg(p, 0.05, 0.85);
  return (
    <div className="vl-term">
      <div className="vl-term-bar">
        <i />
        <i />
        <i />
        <span>student@laptop: ~</span>
      </div>
      <pre>
        {lines.map((line, i) => {
          const from = (ends[i] - weights[i]) / sum;
          const to = ends[i] / sum;
          const x = seg(span, from, to);
          if (span < from) return null;
          if (line.cmd) {
            const typed = line.cmd.slice(0, Math.ceil(x * line.cmd.length));
            return (
              <div key={i}>
                <span className="vl-prompt">$ </span>
                {typed}
                {x < 1 && <span className="vl-caret" />}
              </div>
            );
          }
          return (
            <div key={i} className="vl-out">
              {line.out}
            </div>
          );
        })}
      </pre>
    </div>
  );
}

/** A little Bash colouring: comments, strings, variables, keywords. */
function Highlight({ line }: { line: string }) {
  const parts = line.split(
    /(#.*$|"[^"]*"|'[^']*'|\$\(\([^)]*\)\)|\$\w+|\b(?:for|in|do|done|while|if|then|fi|echo|grep)\b)/,
  );
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        const cls = part.startsWith("#")
          ? "c"
          : part.startsWith('"') || part.startsWith("'")
            ? "s"
            : part.startsWith("$")
              ? "v"
              : /^(for|in|do|done|while|if|then|fi|echo|grep)$/.test(part)
                ? "k"
                : "";
        return (
          <span key={i} className={cls ? `hl-${cls}` : undefined}>
            {part}
          </span>
        );
      })}
    </>
  );
}

function CodeScene({
  title,
  lines,
  focus,
  p,
}: {
  title: string;
  lines: string[];
  focus?: number[];
  p: number;
}) {
  const typed = seg(p, 0.02, 0.35) * lines.length;
  const lit = p > 0.35 && focus ? focus : null;
  // The focused lines light up one after another.
  const current = lit
    ? lit[Math.min(lit.length - 1, Math.floor(seg(p, 0.35, 0.95) * lit.length))]
    : -1;
  return (
    <div className="vl-term vl-code">
      <div className="vl-term-bar">
        <i />
        <i />
        <i />
        <span>{title}</span>
      </div>
      <pre>
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              lit === null
                ? ""
                : i === current
                  ? "on"
                  : lit.includes(i)
                    ? ""
                    : "dim"
            }
            style={{ opacity: clamp(typed - i) }}
          >
            <span className="vl-ln">{i + 1}</span>
            <Highlight line={line} />
          </div>
        ))}
      </pre>
    </div>
  );
}

function BoxesScene({ vars, p }: { vars: [string, string][]; p: number }) {
  return (
    <div className="vl-shelf">
      {vars.map(([name, value], i) => {
        const drop = seg(p, 0.2 + i * 0.25, 0.4 + i * 0.25);
        return (
          <div
            key={name}
            className="vl-box"
            style={rise(seg(p, i * 0.1, 0.12 + i * 0.1))}
          >
            <span
              className="vl-box-value"
              style={{
                opacity: ease(drop),
                transform: `translateY(${(1 - ease(drop)) * -6}cqw)`,
              }}
            >
              {value}
            </span>
            <div className="vl-box-body" />
            <span className="vl-box-label vl-mono">{name}</span>
          </div>
        );
      })}
      <p className="vl-mono vl-foot" style={rise(seg(p, 0.75, 0.9))}>
        {vars.map(([n, v]) => `${n}=${v}`).join("   ")}
      </p>
    </div>
  );
}

function LoopScene({
  items,
  variable,
  p,
}: {
  items: string[];
  variable: string;
  p: number;
}) {
  const turn = Math.min(
    items.length,
    Math.floor(seg(p, 0.15, 0.85) * (items.length + 0.999)),
  );
  return (
    <div className="vl-loop">
      <div className="vl-term vl-code">
        <pre>
          <div className={turn < items.length ? "on" : ""}>
            <Highlight line={`for ${variable} in ${items.join(" ")}; do`} />
          </div>
          <div className={turn < items.length ? "on" : ""}>
            {"  "}
            <Highlight line={`echo "Tekshirilmoqda: $${variable}"`} />
          </div>
          <div>
            <Highlight line="done" />
          </div>
        </pre>
      </div>
      <div className="vl-loop-side">
        <div className="vl-box small">
          <span className="vl-box-value">
            {turn < items.length ? items[turn] : "—"}
          </span>
          <div className="vl-box-body" />
          <span className="vl-box-label vl-mono">{variable}</span>
        </div>
        <ul className="vl-roll">
          {items.map((item, i) => (
            <li
              key={item}
              className={i < turn ? "done" : i === turn ? "on" : ""}
            >
              {i < turn ? "✓" : i === turn ? "▶" : "·"} {item}
            </li>
          ))}
        </ul>
        <pre className="vl-out-box">
          {items
            .slice(0, Math.min(turn + 1, items.length))
            .map((item) => `Tekshirilmoqda: ${item}`)
            .join("\n")}
        </pre>
      </div>
    </div>
  );
}

function CountdownScene({ p }: { p: number }) {
  const steps = ["5", "4", "3", "2", "1", "Start!"];
  const at = Math.min(
    steps.length - 1,
    Math.floor(seg(p, 0.1, 0.8) * steps.length),
  );
  return (
    <div className="vl-loop">
      <div className="vl-countdown">
        <span className="vl-tag">i = {at < 5 ? 5 - at : 0}</span>
        <strong key={at} className={at === 5 ? "go" : ""}>
          {steps[at]}
        </strong>
        <span className="vl-mono">
          [ $i -gt 0 ] → {at < 5 ? "rost" : "yolg‘on"}
        </span>
      </div>
      <pre className="vl-out-box">{steps.slice(0, at + 1).join("\n")}</pre>
    </div>
  );
}

const AUTH_LOG = [
  "Oct 19 09:12 sshd: Accepted password for ali",
  "Oct 19 09:40 sshd: Failed password for root",
  "Oct 19 09:41 sshd: Failed password for root",
  "Oct 19 10:02 sshd: Accepted publickey for vali",
  "Oct 19 10:15 sshd: Failed password for admin",
  "Oct 19 11:30 sshd: Accepted password for ali",
];
function LogScanScene({ p }: { p: number }) {
  const scan = seg(p, 0.1, 0.75) * AUTH_LOG.length;
  const found = ["root", "admin"].filter((user) =>
    AUTH_LOG.some(
      (line, i) => i < scan && line.endsWith(`Failed password for ${user}`),
    ),
  );
  return (
    <div className="vl-loop wide">
      <div className="vl-term vl-code">
        <div className="vl-term-bar">
          <i />
          <i />
          <i />
          <span>auth.log</span>
        </div>
        <pre>
          {AUTH_LOG.map((line, i) => (
            <div
              key={i}
              className={
                i < scan ? (line.includes("Failed") ? "bad" : "") : "dim"
              }
            >
              {line}
            </div>
          ))}
        </pre>
      </div>
      <div className="vl-loop-side">
        <span className="vl-mono vl-tag">$ bash check.sh auth.log</span>
        <pre className="vl-out-box">
          {found.map((user) => `Ogohlantirish: ${user}`).join("\n")}
        </pre>
      </div>
    </div>
  );
}
