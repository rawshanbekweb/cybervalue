"use client";

import { videoHref } from "@/lib/video-lessons";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  FileCheck2,
  FileWarning,
  KeyRound,
  Play,
  ShieldAlert,
  ShieldCheck,
  Signature,
} from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { useReducedMotion } from "../anim-lab/widgets";
import {
  LESSONS,
  PROGRESS_KEY,
  type Widget,
} from "@/lib/crypto-basics/curriculum";
import {
  binary,
  bitsDiffer,
  bitsToOutlast,
  charBytes,
  fromBase64,
  hex,
  oneCharApart,
  searchSeconds,
  sha256,
  toBase64,
  toySign,
  toyVerify,
  xorByte,
} from "@/lib/crypto-basics/tools";
import {
  APOSTROPHE,
  COOKIE,
  COOKIE_VALUE,
  GOOD_MIRROR,
  KEYSPACE,
  LEAK,
  MIRRORS,
  RELEASE,
  RELEASE_HASH,
  SHARED_PAIR,
  SIGNED_MESSAGE,
  TARGET_HASH,
  WEAK_PASSWORD,
  WORDLIST,
  XOR_TASK,
} from "@/lib/crypto-basics/data";
import "../http-basics/http-basics.css";
import "../https-basics/https-basics.css";
import "./crypto-basics.css";

// Academy · Cryptography basics: encoding, hashing and encryption told apart.
export function CryptoBasics() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      checkpoints={["crypto-1"]}
      video={videoHref("crypto")}
      eyebrow={t("SECURITY FOUNDATIONS · ANIMATED")}
      title={t("Cryptography basics.")}
      subtitle={t("Encoding, hashing and encryption, told apart.")}
      description={t(
        "Read text as bytes, forge a Base64 cookie, watch one letter scramble a hash, salt a leaked table, run a dictionary attack, flip XOR bits and sign a message.",
      )}
      badge={t("CRYPTO / BASICS")}
      icon={<KeyRound size={22} />}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "bytes":
            return <BytesWidget {...props} />;
          case "base64":
            return <Base64Widget {...props} />;
          case "avalanche":
            return <AvalancheWidget {...props} />;
          case "integrity":
            return <IntegrityWidget {...props} />;
          case "salt":
            return <SaltWidget {...props} />;
          case "crack":
            return <CrackWidget {...props} />;
          case "xor":
            return <XorWidget {...props} />;
          case "keyspace":
            return <KeyspaceWidget {...props} />;
          case "signature":
            return <SignatureWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Shows each character's UTF-8 bytes and asks how many “‘” takes. */
function BytesWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [text, setText] = useState("o‘zbek");
  const [answer, setAnswer] = useState<number | null>(null);
  const chars = charBytes(text);
  const total = chars.reduce((n, c) => n + c.bytes.length, 0);
  return (
    <div className="nl-card cb-card">
      <label className="cb-field">
        {t("Text")}
        <input
          value={text}
          maxLength={24}
          spellCheck={false}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div
        className="cb-chars"
        tabIndex={0}
        aria-label={t("Bytes of the text")}
      >
        {chars.map(({ char, bytes }, i) => (
          <div key={`${i}-${char}`} className="cb-char">
            <strong>{char === " " ? "␠" : char}</strong>
            {bytes.map((b, j) => (
              <span key={j} className="cb-byte">
                <code>{b}</code>
                <code>0x{hex([b])}</code>
                <code className="cb-bin">{binary(b)}</code>
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="al-muted">
        {t("{chars} characters, {bytes} bytes", {
          chars: chars.length,
          bytes: total,
        })}
      </p>
      <fieldset className="cb-choice">
        <legend>
          {t("How many bytes does the {char} mark (as in o‘) take in UTF-8?", {
            char: APOSTROPHE.char,
          })}
        </legend>
        {[1, 2, 3, 4].map((n) => (
          <label key={n} className={answer === n ? "on" : ""}>
            <input
              type="radio"
              name="cb-bytes"
              checked={answer === n}
              onChange={() => {
                setAnswer(n);
                onSolved(n === APOSTROPHE.bytes);
              }}
            />
            {n}
          </label>
        ))}
      </fieldset>
      <div aria-live="polite">
        {answer !== null &&
          (answer === APOSTROPHE.bytes ? (
            <p className="nl-pass">
              {t("Right: 3 bytes. So “o‘” is 2 characters but 4 bytes.")}
            </p>
          ) : (
            <p className="nl-fail">
              {t("Not quite. Type the mark on its own and count its bytes.")}
            </p>
          ))}
      </div>
    </div>
  );
}

/** Decodes a site cookie and forges a new one. */
function Base64Widget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [decodeIn, setDecodeIn] = useState("");
  const [encodeIn, setEncodeIn] = useState("");
  const [forged, setForged] = useState("");
  const decoded = fromBase64(decodeIn);
  const opened = decoded === COOKIE.plain;
  const forgedOk = fromBase64(forged) === COOKIE.forged;
  const report = (cookie: string, forgery: string) =>
    onSolved(
      fromBase64(cookie) === COOKIE.plain &&
        fromBase64(forgery) === COOKIE.forged,
    );
  return (
    <div className="nl-card cb-card">
      <div>
        <span className="cb-label">{t("The site’s cookie")}</span>
        <pre className="al-code" tabIndex={0}>
          Set-Cookie: role={COOKIE_VALUE}; Path=/
        </pre>
      </div>
      <div className="cb-grid">
        <label className="cb-field">
          {t("Decode Base64")}
          <input
            value={decodeIn}
            spellCheck={false}
            maxLength={80}
            onChange={(e) => {
              setDecodeIn(e.target.value);
              report(e.target.value, forged);
            }}
            placeholder="YWJj"
          />
          <output className={`cb-out${opened ? " ok" : ""}`}>
            {decodeIn ? (decoded ?? t("Not valid Base64")) : "—"}
          </output>
        </label>
        <label className="cb-field">
          {t("Encode to Base64")}
          <input
            value={encodeIn}
            spellCheck={false}
            maxLength={80}
            onChange={(e) => setEncodeIn(e.target.value)}
            placeholder="abc"
          />
          <output className="cb-out">
            {encodeIn ? toBase64(encodeIn) : "—"}
          </output>
        </label>
      </div>
      <label className="cb-field">
        {t("Forged cookie value")}
        <input
          value={forged}
          spellCheck={false}
          maxLength={80}
          onChange={(e) => {
            setForged(e.target.value);
            report(decodeIn, e.target.value);
          }}
        />
      </label>
      <ul className="hb-families" aria-label={t("Steps")}>
        <li className={opened ? "got" : ""}>
          {opened && <Check size={13} aria-hidden="true" />}
          {t("Cookie opened")}
        </li>
        <li className={forgedOk ? "got" : ""}>
          {forgedOk && <Check size={13} aria-hidden="true" />}
          {t("Cookie forged")}
        </li>
      </ul>
      <div aria-live="polite">
        {opened && forgedOk && (
          <p className="nl-pass al-appear">
            {t(
              "No key was needed. A server that trusts this cookie just made you an admin — it must check roles on its side.",
            )}
          </p>
        )}
      </div>
    </div>
  );
}

/** Two texts one character apart and how far their hashes fall apart. */
function AvalancheWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [a, setA] = useState("salom");
  const [b, setB] = useState("salom");
  const ha = sha256(a);
  const hb = sha256(b);
  const diff = bitsDiffer(ha, hb);
  const near = oneCharApart(a, b);
  return (
    <div className="nl-card cb-card">
      {[
        {
          value: a,
          set: (v: string) => {
            setA(v);
            onSolved(oneCharApart(v, b));
          },
          hash: ha,
          label: t("Text A"),
        },
        {
          value: b,
          set: (v: string) => {
            setB(v);
            onSolved(oneCharApart(a, v));
          },
          hash: hb,
          label: t("Text B"),
        },
      ].map((row, i) => (
        <div key={i} className="cb-hash-row">
          <label className="cb-field">
            {row.label}
            <input
              value={row.value}
              maxLength={40}
              spellCheck={false}
              onChange={(e) => row.set(e.target.value)}
            />
          </label>
          <code className="cb-hash" aria-label={`SHA-256: ${row.hash}`}>
            {[...row.hash].map((ch, j) => (
              <span
                key={j}
                className={i === 1 && ch !== ha[j] ? "cb-changed" : ""}
              >
                {ch}
              </span>
            ))}
          </code>
        </div>
      ))}
      <div className="cb-meter" aria-live="polite">
        <span>{t("{bits} of 256 bits differ", { bits: diff })}</span>
        <span className="cb-bar" aria-hidden="true">
          <span style={{ width: `${(diff / 256) * 100}%` }} />
        </span>
      </div>
      {near && (
        <p className="nl-pass al-appear">
          {t(
            "One character apart, yet {bits} bits changed — the hashes share nothing you could follow.",
            { bits: diff },
          )}
        </p>
      )}
    </div>
  );
}

/** Compares three mirror downloads with the published checksum. */
function IntegrityWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="nl-card cb-card">
      <div>
        <span className="cb-label">
          {t("Official SHA-256 of {file}", { file: RELEASE.name })}
        </span>
        <code className="cb-hash cb-official">{RELEASE_HASH}</code>
      </div>
      <ul className="cb-mirrors">
        {MIRRORS.map((m) => {
          const hash = sha256(m.content);
          const chosen = picked === m.id;
          const good = m.id === GOOD_MIRROR;
          return (
            <li key={m.id} className={chosen ? (good ? "ok" : "bad") : ""}>
              <span className="cb-label">{m.host}</span>
              <code className="cb-hash">{hash}</code>
              <button
                type="button"
                className={chosen ? "nl-primary" : "nl-ghost"}
                aria-pressed={chosen}
                onClick={() => {
                  setPicked(m.id);
                  onSolved(good);
                }}
              >
                {chosen && good ? (
                  <FileCheck2 size={14} aria-hidden="true" />
                ) : chosen ? (
                  <FileWarning size={14} aria-hidden="true" />
                ) : null}
                {t("This one matches")}
              </button>
            </li>
          );
        })}
      </ul>
      <div aria-live="polite">
        {picked &&
          (picked === GOOD_MIRROR ? (
            <p className="nl-pass">
              {t("Identical to the last character: this file is genuine.")}
            </p>
          ) : (
            <p className="nl-fail">
              {t(
                "The hash differs, so the file differs — even one byte. Do not run it.",
              )}
            </p>
          ))}
      </div>
    </div>
  );
}

/** Finds the users sharing a password in an unsalted leak, then salts it. */
function SaltWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [chosen, setChosen] = useState<string[]>([]);
  const [salted, setSalted] = useState(false);
  const found =
    chosen.length === 2 && SHARED_PAIR.every((u) => chosen.includes(u));
  const toggle = (user: string) => {
    const next = chosen.includes(user)
      ? chosen.filter((u) => u !== user)
      : [...chosen, user].slice(-2);
    setChosen(next);
    const ok = next.length === 2 && SHARED_PAIR.every((u) => next.includes(u));
    onSolved(ok && salted);
  };
  return (
    <div className="nl-card cb-card">
      <fieldset className="hs-switch">
        <legend>{t("How the site stored passwords")}</legend>
        {[false, true].map((on) => (
          <label key={String(on)} className={salted === on ? "on" : ""}>
            <input
              type="radio"
              name="cb-salt"
              checked={salted === on}
              onChange={() => {
                setSalted(on);
                onSolved(found && on);
              }}
            />
            {on ? "sha256(salt + password)" : "sha256(password)"}
          </label>
        ))}
      </fieldset>
      <div className="hb-net-wrap" tabIndex={0}>
        <table className="hb-net-table cb-leak">
          <caption className="visually-hidden">{t("Leaked table")}</caption>
          <thead>
            <tr>
              <th scope="col">{t("User")}</th>
              {salted && <th scope="col">{t("Salt")}</th>}
              <th scope="col">{t("Stored hash")}</th>
              <th scope="col">{t("Same password?")}</th>
            </tr>
          </thead>
          <tbody>
            {LEAK.map((row) => (
              <tr key={row.user}>
                <th scope="row">{row.user}</th>
                {salted && (
                  <td>
                    <code>{row.salt}</code>
                  </td>
                )}
                <td>
                  <code className="cb-short">
                    {(salted ? row.salted : row.plain).slice(0, 24)}…
                  </code>
                </td>
                <td>
                  <input
                    type="checkbox"
                    aria-label={t("Mark {user}", { user: row.user })}
                    checked={chosen.includes(row.user)}
                    onChange={() => toggle(row.user)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div aria-live="polite">
        {found && !salted && (
          <p className="nl-pass">
            {t(
              "Found: equal hashes give the shared password away. Now switch on salt.",
            )}
          </p>
        )}
        {found && salted && (
          <p className="nl-pass al-appear">
            {t(
              "With salt every hash is different: nothing shows that aziza and dilnoza share a password.",
            )}
          </p>
        )}
        {chosen.length === 2 && !found && (
          <p className="nl-fail">
            {t("These two hashes differ, so the passwords differ too.")}
          </p>
        )}
      </div>
    </div>
  );
}

/** Hashes a word list until it hits the leaked hash. */
function CrackWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const reduce = useReducedMotion();
  const [tried, setTried] = useState(0);
  const [running, setRunning] = useState(false);
  const [guess, setGuess] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hit = WORDLIST.indexOf(WEAK_PASSWORD);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );
  const start = () => {
    if (running) return;
    if (reduce) {
      setTried(hit + 1);
      return;
    }
    setTried(0);
    setRunning(true);
    timer.current = setInterval(() => {
      setTried((n) => {
        if (n + 1 > hit) {
          if (timer.current) clearInterval(timer.current);
          setRunning(false);
        }
        return n + 1;
      });
    }, 260);
  };
  const right = guess.trim() === WEAK_PASSWORD;
  return (
    <div className="nl-card cb-card">
      <div>
        <span className="cb-label">{t("Leaked hash (SHA-256, no salt)")}</span>
        <code className="cb-hash cb-official">{TARGET_HASH}</code>
      </div>
      <button
        type="button"
        className="nl-primary"
        onClick={start}
        disabled={running}
      >
        <Play size={15} aria-hidden="true" /> {t("Start the attack")}
      </button>
      <ol className="cb-attempts" aria-live="polite">
        {WORDLIST.slice(0, tried).map((word, i) => (
          <li key={word} className={i === hit ? "ok" : ""}>
            <code>{word}</code>
            <code className="cb-short">{sha256(word).slice(0, 20)}…</code>
            <span>{i === hit ? t("Match!") : "✗"}</span>
          </li>
        ))}
      </ol>
      <label className="cb-field">
        {t("The password is")}
        <input
          value={guess}
          spellCheck={false}
          maxLength={40}
          onChange={(e) => {
            setGuess(e.target.value);
            onSolved(e.target.value.trim() === WEAK_PASSWORD);
          }}
        />
      </label>
      <div aria-live="polite">
        {right && (
          <p className="nl-pass al-appear">
            {t(
              "Cracked in {count} guesses. A real list has millions — SHA-256 checks them in about a second, bcrypt would need years.",
              { count: hit + 1 },
            )}
          </p>
        )}
      </div>
    </div>
  );
}

/** Flips key bits and XORs them with an encrypted byte. */
function XorWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [key, setKey] = useState(0);
  const plain = xorByte(XOR_TASK.cipher, key);
  const right = key === XOR_TASK.key;
  const flip = (bit: number) => {
    const next = key ^ (1 << (7 - bit));
    setKey(next);
    onSolved(next === XOR_TASK.key);
  };
  const printable = plain >= 32 && plain < 127;
  const rows = [
    { label: t("Encrypted byte"), value: XOR_TASK.cipher },
    { label: t("Key"), value: key, editable: true },
    { label: t("Result (XOR)"), value: plain },
  ];
  return (
    <div className="nl-card cb-card">
      <div className="cb-xor" role="group" aria-label={t("XOR of two bytes")}>
        {rows.map((row) => (
          <div key={row.label} className="cb-xor-row">
            <span className="cb-label">{row.label}</span>
            <span className="cb-bits">
              {[...binary(row.value)].map((bit, i) =>
                row.editable ? (
                  <button
                    key={i}
                    type="button"
                    className={`cb-bit${bit === "1" ? " on" : ""}`}
                    aria-pressed={bit === "1"}
                    aria-label={t("Key bit {n}", { n: i + 1 })}
                    onClick={() => flip(i)}
                  >
                    {bit}
                  </button>
                ) : (
                  <span key={i} className={`cb-bit${bit === "1" ? " on" : ""}`}>
                    {bit}
                  </span>
                ),
              )}
            </span>
            <code>0x{hex([row.value])}</code>
          </div>
        ))}
      </div>
      <p aria-live="polite" className={right ? "nl-pass" : "al-muted"}>
        {t("As a letter")}:{" "}
        <strong>{printable ? String.fromCharCode(plain) : "·"}</strong>
        {right &&
          ` — ${t("opened with key 0x2a. XOR it with the same key again and you get the encrypted byte back.")}`}
      </p>
    </div>
  );
}

function duration(seconds: number, t: ReturnType<typeof useT>["t"]) {
  const year = 365.25 * 24 * 3600;
  if (seconds < 1) return t("less than a second");
  if (seconds < 3600) return t("{n} minutes", { n: Math.ceil(seconds / 60) });
  if (seconds < 86400) return t("{n} hours", { n: Math.ceil(seconds / 3600) });
  if (seconds < year) return t("{n} days", { n: Math.ceil(seconds / 86400) });
  const years = seconds / year;
  if (years < 1e6)
    return t("{n} years", { n: Math.ceil(years).toLocaleString("en-US") });
  return t("about 10^{n} years", { n: Math.floor(Math.log10(years)) });
}

/** Key length against the time to try every key. */
function KeyspaceWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [bits, setBits] = useState(40);
  const answer = bitsToOutlast(KEYSPACE.years, KEYSPACE.perSecond);
  const seconds = searchSeconds(bits, KEYSPACE.perSecond);
  const enough = bits >= answer;
  return (
    <div className="nl-card cb-card">
      <label className="hs-slider">
        {t("Key length")}: <strong>{t("{n} bits", { n: bits })}</strong>
        <input
          type="range"
          min={8}
          max={256}
          value={bits}
          onChange={(e) => {
            const next = Number(e.target.value);
            setBits(next);
            onSolved(next === answer);
          }}
        />
      </label>
      <dl className="cb-facts" aria-live="polite">
        <div>
          <dt>{t("Possible keys")}</dt>
          <dd>
            2<sup>{bits}</sup> ≈ 10<sup>{Math.floor(bits * Math.log10(2))}</sup>
          </dd>
        </div>
        <div>
          <dt>{t("At a trillion keys a second")}</dt>
          <dd className={enough ? "ok" : "bad"}>{duration(seconds, t)}</dd>
        </div>
      </dl>
      <div aria-live="polite">
        {bits === answer && (
          <p className="nl-pass al-appear">
            {t(
              "{n} bits is the shortest that holds out for a million years. AES uses 128 or 256 — far beyond that.",
              { n: answer },
            )}
          </p>
        )}
        {bits > answer && (
          <p className="al-muted">
            {t("Long enough — but is it the shortest? Step down.")}
          </p>
        )}
      </div>
    </div>
  );
}

/** Signs a message with a toy RSA key, then catches a tampered copy. */
function SignatureWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [message, setMessage] = useState(SIGNED_MESSAGE);
  const [signed, setSigned] = useState<{ text: string; value: number } | null>(
    null,
  );
  const [check, setCheck] = useState<{ ok: boolean; tampered: boolean } | null>(
    null,
  );
  const [seen, setSeen] = useState({ valid: false, caught: false });
  const verify = () => {
    if (!signed) return;
    const ok = toyVerify(message, signed.value);
    const tampered = message !== signed.text;
    setCheck({ ok, tampered });
    const next = {
      valid: seen.valid || (ok && !tampered),
      caught: seen.caught || (!ok && tampered),
    };
    setSeen(next);
    onSolved(next.valid && next.caught);
  };
  return (
    <div className="nl-card cb-card">
      <label className="cb-field">
        {t("Message")}
        <input
          value={message}
          maxLength={80}
          onChange={(e) => {
            setMessage(e.target.value);
            setCheck(null);
          }}
        />
      </label>
      <div className="cb-sign-row">
        <button
          type="button"
          className="nl-primary"
          onClick={() => {
            setSigned({ text: message, value: toySign(message) });
            setCheck(null);
          }}
        >
          <Signature size={15} aria-hidden="true" />{" "}
          {t("Sign with the bank’s private key")}
        </button>
        <button
          type="button"
          className="nl-ghost"
          onClick={verify}
          disabled={!signed}
        >
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t("Verify with the public key")}
        </button>
      </div>
      <dl className="cb-facts">
        <div>
          <dt>{t("Signature")}</dt>
          <dd>
            <code>{signed?.value ?? "—"}</code>
          </dd>
        </div>
        <div>
          <dt>{t("Public key")}</dt>
          <dd>
            <code>n = 3233, e = 17</code>
          </dd>
        </div>
      </dl>
      <div aria-live="polite">
        {check &&
          (check.ok ? (
            <p className="nl-pass al-appear">
              <ShieldCheck size={14} aria-hidden="true" />{" "}
              {check.tampered
                ? t(
                    "Still valid: with only 3233 possible values the toy key can collide. A real 2048-bit key never would.",
                  )
                : t(
                    "Valid: the bank sent this, and not one character changed.",
                  )}
            </p>
          ) : (
            <p className="nl-fail al-appear">
              <ShieldAlert size={14} aria-hidden="true" />{" "}
              {t("Invalid: the message changed after signing. Reject it.")}
            </p>
          ))}
      </div>
      <ul className="hb-families" aria-label={t("Steps")}>
        <li className={seen.valid ? "got" : ""}>
          {seen.valid && <Check size={13} aria-hidden="true" />}
          {t("Valid signature checked")}
        </li>
        <li className={seen.caught ? "got" : ""}>
          {seen.caught && <Check size={13} aria-hidden="true" />}
          {t("Tampering caught")}
        </li>
      </ul>
    </div>
  );
}
