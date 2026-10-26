"use client";

import { videoHref } from "@/lib/video-lessons";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Laptop,
  Link2,
  Lock,
  LockOpen,
  Send,
  Server,
  ShieldCheck,
  Wifi,
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
} from "@/lib/https-basics/curriculum";
import {
  CHAIN,
  INTERCEPTED,
  SECRET,
  shift,
  unshift,
} from "@/lib/https-basics/cipher";
import "../http-basics/http-basics.css";
import "./https-basics.css";

// Academy · HTTPS and TLS: why the web encrypts, the handshake, and how a
// browser decides to trust a certificate.
export function HttpsBasics() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      checkpoints={["https-1"]}
      video={videoHref("https")}
      eyebrow={t("WEB FOUNDATIONS · ANIMATED")}
      title={t("HTTPS and TLS.")}
      subtitle={t("See what the padlock really protects.")}
      description={t(
        "Spy on café Wi-Fi, crack a toy cipher, watch the TLS handshake, take a certificate apart and walk the chain of trust.",
      )}
      badge={t("HTTPS / TLS · LAB")}
      icon={<Lock size={22} />}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "wifi":
            return <WifiWidget {...props} />;
          case "cipher":
            return <CipherWidget {...props} />;
          case "chain":
            return <ChainWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

// Looks like TLS records: hex bytes the eavesdropper cannot read.
const GIBBERISH =
  "17 03 03 00 5a 9f e2 4b c1 07 d8 3e a6 51 f0 2c 88 b4 6d 13 e9 7a 0c 55 d2 31 9b";

/** Sends a sign-in over café Wi-Fi with HTTPS off and on. */
function WifiWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const reduce = useReducedMotion();
  const [secure, setSecure] = useState(false);
  const [tried, setTried] = useState<{ http?: boolean; https?: boolean }>({});
  const [flight, setFlight] = useState<{ key: number; secure: boolean } | null>(
    null,
  );
  const [seen, setSeen] = useState<{ key: number; secure: boolean } | null>(
    null,
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const send = () => {
    if (flight) return;
    const key = (seen?.key ?? 0) + 1;
    setFlight({ key, secure });
    setSeen(null);
    timer.current = setTimeout(
      () => {
        setFlight(null);
        setSeen({ key, secure });
        const next = { ...tried, [secure ? "https" : "http"]: true };
        setTried(next);
        if (next.http && next.https) onSolved(true);
      },
      reduce ? 0 : 1600,
    );
  };
  return (
    <div className="nl-card hs-wifi">
      <fieldset className="hs-switch">
        <legend>{t("Connection")}</legend>
        {[false, true].map((on) => (
          <label key={String(on)} className={secure === on ? "on" : ""}>
            <input
              type="radio"
              name="hs-mode"
              checked={secure === on}
              onChange={() => setSecure(on)}
            />
            {on ? (
              <Lock size={14} aria-hidden="true" />
            ) : (
              <LockOpen size={14} aria-hidden="true" />
            )}
            {on ? "https://bank.uz" : "http://bank.uz"}
          </label>
        ))}
      </fieldset>
      <div className="hs-lane">
        <span className="hb-end">
          <Laptop size={20} aria-hidden="true" />
          {t("You")}
        </span>
        <span className="hb-end hs-spy">
          <Wifi size={20} aria-hidden="true" />
          {t("Café Wi-Fi")}
        </span>
        <span className="hb-end">
          <Server size={20} aria-hidden="true" />
          bank.uz
        </span>
        <div className="hs-track" aria-hidden="true">
          {flight && (
            <span
              key={flight.key}
              className={`al-packet al-${flight.secure ? "locked" : "plain"} ${reduce ? "" : "al-flying"}`}
              style={
                {
                  "--from": "8%",
                  "--to": "92%",
                  "--dur": "1600ms",
                  left: "92%",
                } as React.CSSProperties
              }
            >
              {flight.secure && <Lock size={12} />}
              POST /login
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        className="nl-primary"
        onClick={send}
        disabled={!!flight}
      >
        <Send size={15} aria-hidden="true" /> {t("Send the password")}
      </button>
      <div className="hs-spy-view" aria-live="polite">
        <span className="hs-label">{t("What the eavesdropper captured")}</span>
        {seen ? (
          <pre
            key={seen.key}
            className={`al-code al-appear ${seen.secure ? "hs-cipher" : "hs-plain"}`}
            tabIndex={0}
          >
            {seen.secure
              ? `${t("Server name (SNI)")}: bank.uz\n${GIBBERISH}…`
              : "POST /login HTTP/1.1\nHost: bank.uz\n\nuser=ali&pass=Qwerty-2026"}
          </pre>
        ) : (
          <p className="al-muted">{t("Nothing yet.")}</p>
        )}
        {seen && (
          <p className={seen.secure ? "nl-pass" : "nl-fail"}>
            {seen.secure
              ? t("Only gibberish and the site’s name. The password is safe.")
              : t("The password is in plain sight!")}
          </p>
        )}
      </div>
      <ul className="hb-families">
        <li className={tried.http ? "got" : ""}>
          {tried.http && <Check size={13} aria-hidden="true" />}HTTP
        </li>
        <li className={tried.https ? "got" : ""}>
          {tried.https && <Check size={13} aria-hidden="true" />}HTTPS
        </li>
      </ul>
    </div>
  );
}

/** Opens an intercepted message by trying keys of a letter-shift cipher. */
function CipherWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [key, setKey] = useState(0);
  const [mine, setMine] = useState("salom");
  const [mineKey, setMineKey] = useState(3);
  const opened = unshift(INTERCEPTED, key);
  const right = key === SECRET.key;
  return (
    <div className="nl-card hs-cipher-lab">
      <div>
        <span className="hs-label">{t("Intercepted message")}</span>
        <pre className="al-code hs-cipher" tabIndex={0}>
          {INTERCEPTED}
        </pre>
      </div>
      <label className="hs-slider">
        {t("Key")}: <strong>{key}</strong>
        <input
          type="range"
          min={0}
          max={25}
          value={key}
          onChange={(e) => {
            const next = Number(e.target.value);
            setKey(next);
            if (next === SECRET.key) onSolved(true);
          }}
        />
      </label>
      <div aria-live="polite">
        <span className="hs-label">{t("Decrypted with this key")}</span>
        <pre
          key={right ? "open" : "closed"}
          className={`al-code ${right ? "hs-open al-appear" : ""}`}
          tabIndex={0}
        >
          {opened}
        </pre>
        {right && (
          <p className="nl-pass">
            <LockOpen size={14} aria-hidden="true" />{" "}
            {t("Opened! Only 25 keys — a computer tries them in a blink.")}
          </p>
        )}
      </div>
      <details className="hs-try">
        <summary>{t("Encrypt your own message")}</summary>
        <label>
          {t("Text")}
          <input
            value={mine}
            maxLength={40}
            onChange={(e) => setMine(e.target.value)}
          />
        </label>
        <label>
          {t("Key")}
          <input
            type="number"
            min={1}
            max={25}
            value={mineKey}
            onChange={(e) => setMineKey(Number(e.target.value) || 0)}
          />
        </label>
        <pre className="al-code hs-cipher" tabIndex={0}>
          {shift(mine, mineKey)}
        </pre>
      </details>
    </div>
  );
}

const CHAIN_NOTE = [
  {
    uz: "bank.uz sertifikatidagi imzo R3 ning ochiq kaliti bilan tekshirildi — mos keldi.",
    en: "The signature on bank.uz’s certificate checks out against R3’s public key.",
  },
  {
    uz: "R3 sertifikatini ISRG Root X1 imzolagan — imzo to‘g‘ri.",
    en: "R3’s certificate was signed by ISRG Root X1 — the signature is valid.",
  },
  {
    uz: "ISRG Root X1 brauzerning ishonch omborida bor. Zanjir yopildi!",
    en: "ISRG Root X1 is in the browser’s trust store. The chain is complete!",
  },
];

/** Walks a certificate chain from the site up to a trusted root. */
function ChainWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [checked, setChecked] = useState(0);
  const check = (i: number) => {
    if (i !== checked) return;
    setChecked(i + 1);
    if (i + 1 === CHAIN.length) onSolved(true);
  };
  // Shown root first, checked site first.
  const order = CHAIN.map((link, i) => ({ link, i })).reverse();
  return (
    <div className="nl-card hs-chain">
      {order.map(({ link, i }) => (
        <div key={link.subject} className="hs-link-wrap">
          <div
            className={`hs-link${i < checked ? " ok" : ""}${i === checked ? " next" : ""}`}
          >
            <span className="hs-link-kind">
              {i === CHAIN.length - 1
                ? t("Root CA")
                : i === 0
                  ? t("Site certificate")
                  : t("Intermediate CA")}
            </span>
            <strong>{link.subject}</strong>
            <span className="al-muted">
              {t("Signed by")}: {link.issuer}
            </span>
            <button
              type="button"
              className={i < checked ? "nl-ghost" : "nl-primary"}
              onClick={() => check(i)}
              disabled={i !== checked}
            >
              {i < checked ? (
                <Check size={14} aria-hidden="true" />
              ) : (
                <ShieldCheck size={14} aria-hidden="true" />
              )}
              {i < checked ? t("Verified") : t("Check")}
            </button>
            {i < checked && (
              <p className="al-appear hs-link-note">{text(CHAIN_NOTE[i])}</p>
            )}
          </div>
          {i > 0 && (
            <span
              className={`hs-arrow${i <= checked ? " ok" : ""}`}
              aria-hidden="true"
            >
              <Link2 size={16} />
            </span>
          )}
        </div>
      ))}
      <div aria-live="polite">
        {checked === CHAIN.length && (
          <p className="nl-pass al-appear hs-secure">
            <Lock size={16} aria-hidden="true" />
            {t("Connection is secure: https://bank.uz")}
          </p>
        )}
      </div>
    </div>
  );
}
