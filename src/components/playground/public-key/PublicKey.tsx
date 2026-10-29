"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck, Skull } from "lucide-react";
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
} from "@/lib/public-key/curriculum";
import {
  decryptRsa,
  encryptRsa,
  eveSearch,
  exchange,
  factor,
  GROUPS,
  middle,
  PRIMES,
  rsaKey,
  type GroupId,
} from "@/lib/public-key/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./public-key.css";

const MESSAGE = 42n;
// Names, not phrases: shown through text() so “Bob” may stay “Bob”.
const ALICE = { uz: "Alisa", en: "Alice" };
const BOB = { uz: "Bob", en: "Bob" };
const MALLORY = { uz: "Mallory", en: "Mallory" };

// Academy Intermediate · Public-key cryptography: Diffie–Hellman, RSA and a
// man in the middle, on real arithmetic with numbers small enough to read.
export function PublicKey() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("CRYPTOGRAPHY · MODULE 4")}
      title={t("Public-key cryptography.")}
      subtitle={t("A secret agreed in the open.")}
      description={t(
        "Agree a key with Diffie–Hellman while Eve listens, build an RSA key from two primes and see it factored, and stop a man in the middle with a signed public value.",
      )}
      badge={t("RSA / LAB")}
      icon={<KeyRound size={22} />}
      checkpoints={["pubkey-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "dh":
            return <DhWidget {...props} />;
          case "rsa":
            return <RsaWidget {...props} />;
          case "mitm":
            return <MitmWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Diffie–Hellman in three groups, with Eve searching for Alice's secret. */
function DhWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [group, setGroup] = useState<GroupId>("p23");
  const x = exchange(group);
  const eve = eveSearch(group, x.A);
  return (
    <div className="nl-card cb-card">
      <fieldset className="br-modes">
        <legend>{t("Public numbers")}</legend>
        {GROUPS.map((g) => (
          <label key={g.id} className={`br-mode${group === g.id ? " on" : ""}`}>
            <input
              type="radio"
              name="pk-group"
              checked={group === g.id}
              onChange={() => {
                setGroup(g.id);
                onSolved(eveSearch(g.id, exchange(g.id).A).found === null);
              }}
            />
            <code>{g.label}</code>
          </label>
        ))}
      </fieldset>
      <div className="pk-trio">
        <div className="pk-side">
          <strong>{text(ALICE)}</strong>
          <code>A = gᵃ mod p = {String(x.A)}</code>
          <code className="ok">
            {t("Key")} = Bᵃ mod p = {String(x.aliceKey)}
          </code>
        </div>
        <div className="pk-side">
          <strong>{text(BOB)}</strong>
          <code>B = gᵇ mod p = {String(x.B)}</code>
          <code className="ok">
            {t("Key")} = Aᵇ mod p = {String(x.bobKey)}
          </code>
        </div>
      </div>
      <div
        aria-live="polite"
        className={`ac-reply ${eve.found !== null ? "bad" : "ok"}`}
      >
        <strong>{t("Eve sees p, g, A and B")}</strong>
        {eve.found !== null ? (
          <p className="nl-fail">
            <Skull size={15} aria-hidden="true" />{" "}
            {t("After {tries} tries she finds a = {a} and computes the key.", {
              tries: eve.tries,
              a: String(eve.found),
            })}
          </p>
        ) : (
          <p className="nl-pass">
            <ShieldCheck size={15} aria-hidden="true" />{" "}
            {t(
              "{tries} tries and no answer: searching all of p would take thousands of years.",
              { tries: eve.tries.toLocaleString("en").replace(/,/g, " ") },
            )}
          </p>
        )}
      </div>
    </div>
  );
}

/** An RSA key from two primes; 42 encrypted and back; n factored. */
function RsaWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [p, setP] = useState(61n);
  const [q, setQ] = useState(53n);
  const [ran, setRan] = useState(false);
  const key = rsaKey(p, q);
  const c = key ? encryptRsa(MESSAGE, key) : null;
  const back = key && c !== null ? decryptRsa(c, key) : null;
  const split = key ? factor(key.n) : null;
  const pick = (which: "p" | "q", value: bigint) => {
    if (which === "p") setP(value);
    else setQ(value);
    setRan(false);
    onSolved(false);
  };
  return (
    <div className="nl-card cb-card">
      <div className="cb-grid">
        {(["p", "q"] as const).map((which) => (
          <label key={which} className="cb-field">
            {t("Prime {name}", { name: which })}
            <select
              value={String(which === "p" ? p : q)}
              onChange={(e) => pick(which, BigInt(e.target.value))}
            >
              {PRIMES.map((n) => (
                <option key={String(n)} value={String(n)}>
                  {String(n)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {key ? (
        <pre className="ui-query" tabIndex={0}>
          {`n = p·q = ${key.n}\nφ = (p−1)(q−1) = ${key.phi}\n${t("public key")}:  (e = ${key.e}, n = ${key.n})\n${t("private key")}: d = ${key.d}`}
        </pre>
      ) : (
        <p className="nl-fail">{t("Pick two different primes.")}</p>
      )}
      <button
        type="button"
        className="nl-primary"
        disabled={!key}
        onClick={() => {
          setRan(true);
          onSolved(back === MESSAGE);
        }}
      >
        {t("Encrypt 42 and decrypt it")}
      </button>
      {ran && key && c !== null && (
        <div aria-live="polite" className="cb-grid">
          <code className="pk-step">c = 42ᵉ mod n = {String(c)}</code>
          <code className="pk-step ok">m = cᵈ mod n = {String(back)}</code>
        </div>
      )}
      {ran && split && (
        <p className="nl-fail">
          <Skull size={15} aria-hidden="true" />{" "}
          {t(
            "An attacker factors n = {n} into {a} × {b} at once and rebuilds d. Real n has 600+ digits.",
            { n: String(key!.n), a: String(split[0]), b: String(split[1]) },
          )}
        </p>
      )}
    </div>
  );
}

/** Diffie–Hellman with Mallory on the line, with and without a signature. */
function MitmWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [signed, setSigned] = useState(false);
  const r = middle(signed);
  return (
    <div className="nl-card cb-card">
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={signed}
          onChange={(e) => {
            setSigned(e.target.checked);
            onSolved(e.target.checked);
          }}
        />
        {t("Bob signs his value with a key Alice trusts")}
      </label>
      <ol className="pk-line">
        <li>
          {t("Alice sends A")} → <strong>{text(MALLORY)}</strong> →{" "}
          {t("Bob gets M instead")}
        </li>
        <li>
          {t("Bob sends B")}
          {signed ? ` + ${t("signature")}` : ""} →{" "}
          <strong>{text(MALLORY)}</strong> → {t("Alice gets M instead")}
        </li>
      </ol>
      <div
        aria-live="polite"
        className={`ac-reply ${r.stopped ? "ok" : "bad"}`}
      >
        {r.stopped ? (
          <p className="nl-pass">
            <ShieldCheck size={15} aria-hidden="true" />{" "}
            {t(
              "Alice checks the signature: it does not cover M. She stops before sending anything.",
            )}
          </p>
        ) : (
          <>
            <p className="nl-fail">
              <Skull size={15} aria-hidden="true" />{" "}
              {t(
                "Alice and Bob each share a key with Mallory, not with each other.",
              )}
            </p>
            <code className="pk-step">
              {t("Alice’s key")} {String(r.aliceKey).slice(0, 10)}… ·{" "}
              {t("Bob’s key")} {String(r.bobKey).slice(0, 10)}…
            </code>
            {r.readsAlice && r.readsBob && (
              <p>{t("Mallory decrypts, reads and re-encrypts both sides.")}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
