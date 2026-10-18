"use client";

import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";
import { ArrowLeft, Copy, KeyRound, Mail, Share2, Unlock } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  decodeSecret,
  decryptSecret,
  encodeSecret,
  encryptSecret,
  MAX_SECRET,
  needsKey,
  SECRET_CIPHERS,
  validKey,
  type SecretCipher,
  type SecretPayload,
} from "@/lib/junior/secret";
import { CIPHERS } from "@/lib/junior/cipher-content";
import { useJuniorState } from "./state";
import "./junior.css";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const cipherInfo = (id: SecretCipher) => CIPHERS.find((c) => c.id === id)!;

const KEY_HELP: Record<SecretCipher, { uz: string; en: string }> = {
  caesar: {
    uz: "Siljish: 1 dan 25 gacha son",
    en: "Shift: a number from 1 to 25",
  },
  vigenere: { uz: "Kalit so‘z: faqat harflar", en: "Key word: letters only" },
  enigma: {
    uz: "Rotorlar holati: 3 ta harf, masalan QEV",
    en: "Rotor start: 3 letters, e.g. QEV",
  },
  atbash: { uz: "Kalit kerak emas", en: "No key needed" },
  morse: { uz: "Kalit kerak emas", en: "No key needed" },
};

function Compose() {
  const { t, text, locale } = useT();
  const { addEvent } = useJuniorState();
  const ids = { message: useId(), key: useId(), hint: useId(), link: useId() };
  const [message, setMessage] = useState("");
  const [cipher, setCipher] = useState<SecretCipher>("caesar");
  const [key, setKey] = useState("3");
  const [includeKey, setIncludeKey] = useState(false);
  const [hint, setHint] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const keyOk = !needsKey(cipher) || validKey(cipher, key);
  const ready = message.trim().length > 0 && keyOk;

  const create = () => {
    const payload: SecretPayload = {
      c: cipher,
      t: encryptSecret(cipher, message.slice(0, MAX_SECRET), key),
    };
    if (needsKey(cipher) && includeKey) payload.k = key;
    if (hint.trim()) payload.h = hint.trim().slice(0, 80);
    setLink(
      `${window.location.origin}${window.location.pathname}#m=${encodeSecret(payload)}`,
    );
    setCopied(false);
    addEvent({ secret: true });
  };

  return (
    <section className="jr-mission jr-secret" aria-labelledby="jr-secret-title">
      <h2 id="jr-secret-title">
        <Mail size={20} aria-hidden="true" /> {t("Write a secret message")}
      </h2>
      <div className="jr-panel">
        <label htmlFor={ids.message} className="jr-label">
          {t("Message")}
        </label>
        <textarea
          id={ids.message}
          className="jr-input jr-plain cr-area"
          rows={3}
          maxLength={MAX_SECRET}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setLink("");
          }}
        />
        <fieldset className="cr-sheet-pick">
          <legend className="jr-label">{t("Cipher")}</legend>
          {SECRET_CIPHERS.map((id) => (
            <label key={id} className={cipher === id ? "on" : undefined}>
              <input
                type="radio"
                name="secret-cipher"
                checked={cipher === id}
                onChange={() => {
                  setCipher(id);
                  setKey(
                    id === "caesar"
                      ? "3"
                      : id === "vigenere"
                        ? "SIR"
                        : id === "enigma"
                          ? "AAA"
                          : "",
                  );
                  setLink("");
                }}
              />
              {text(cipherInfo(id).title).split(" — ")[0]}
            </label>
          ))}
        </fieldset>
        {needsKey(cipher) && (
          <>
            <label htmlFor={ids.key} className="jr-label">
              <KeyRound size={14} aria-hidden="true" /> {t("Key")} —{" "}
              {KEY_HELP[cipher][locale]}
            </label>
            <input
              id={ids.key}
              className="jr-input"
              value={key}
              maxLength={20}
              onChange={(event) => {
                setKey(event.target.value.trim());
                setLink("");
              }}
              aria-invalid={!keyOk}
            />
            <label className="cr-check">
              <input
                type="checkbox"
                checked={includeKey}
                onChange={(event) => {
                  setIncludeKey(event.target.checked);
                  setLink("");
                }}
              />
              {t("Put the key in the link")}
            </label>
            {!includeKey && (
              <p className="jr-note">
                {t(
                  "The key stays out of the link: tell your friend face to face. Keeping the key apart from the message is the golden rule of real encryption too!",
                )}
              </p>
            )}
          </>
        )}
        <label htmlFor={ids.hint} className="jr-label">
          {t("Hint (optional)")}
        </label>
        <input
          id={ids.hint}
          className="jr-input jr-plain"
          value={hint}
          maxLength={80}
          placeholder={t("e.g. the key is our class number")}
          onChange={(event) => {
            setHint(event.target.value);
            setLink("");
          }}
        />
        <button
          type="button"
          className="button button-primary"
          disabled={!ready}
          onClick={create}
        >
          {t("Create the link")}
        </button>
        {link && (
          <>
            <label htmlFor={ids.link} className="jr-label">
              {t("Send this to your friend:")}
            </label>
            <input
              id={ids.link}
              className="jr-input"
              readOnly
              value={link}
              onFocus={(event) => event.target.select()}
            />
            <div className="jr-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  navigator.clipboard
                    ?.writeText(link)
                    .then(() => setCopied(true))
                    .catch(() => setCopied(false))
                }
              >
                <Copy size={15} aria-hidden="true" />{" "}
                {copied ? t("Copied!") : t("Copy")}
              </button>
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() =>
                    navigator
                      .share({ title: "Cybervalue", url: link })
                      .catch(() => {})
                  }
                >
                  <Share2 size={15} aria-hidden="true" /> {t("Share")}
                </button>
              )}
            </div>
            <p className="jr-note">
              {t(
                "The ciphertext lives after the # in the link — browsers never send that part to the server.",
              )}
            </p>
          </>
        )}
      </div>
    </section>
  );
}

function Read({ payload }: { payload: SecretPayload }) {
  const { t, text, locale } = useT();
  const keyId = useId();
  const [key, setKey] = useState(payload.k ?? "");
  const [opened, setOpened] = useState(false);
  const info = cipherInfo(payload.c);
  const keyOk = !needsKey(payload.c) || validKey(payload.c, key);
  return (
    <section className="jr-mission jr-secret" aria-labelledby="jr-read-title">
      <h2 id="jr-read-title">
        <Mail size={20} aria-hidden="true" /> {t("You have a secret message!")}
      </h2>
      <div className="jr-panel">
        <p className="jr-lead">
          {t("Cipher:")} <strong>{text(info.title)}</strong>
        </p>
        <code className="jr-code">{payload.t}</code>
        {payload.h && (
          <p className="jr-note">
            {t("Hint:")} {payload.h}
          </p>
        )}
        {needsKey(payload.c) && (
          <>
            <label htmlFor={keyId} className="jr-label">
              <KeyRound size={14} aria-hidden="true" /> {t("Key")} —{" "}
              {KEY_HELP[payload.c][locale]}
            </label>
            <input
              id={keyId}
              className="jr-input"
              value={key}
              onChange={(event) => {
                setKey(event.target.value.trim());
                setOpened(false);
              }}
              aria-invalid={!keyOk}
            />
            {!payload.k && (
              <p className="jr-note">
                {t("The key is not in the link — ask the friend who sent it.")}
              </p>
            )}
          </>
        )}
        <button
          type="button"
          className="button button-primary"
          disabled={!keyOk}
          onClick={() => setOpened(true)}
        >
          <Unlock size={15} aria-hidden="true" /> {t("Decrypt")}
        </button>
        {opened && (
          <code className="jr-code jr-live cr-out" aria-live="polite">
            {decryptSecret(payload.c, payload.t, key)}
          </code>
        )}
        <div className="jr-actions">
          <Link
            href={`/junior/ciphers#cipher/${info.number}`}
            className="jr-linkbtn"
          >
            {t("Learn about this cipher")}
          </Link>
          <button
            type="button"
            className="jr-linkbtn"
            onClick={() => {
              window.location.hash = "";
            }}
          >
            {t("Write my own message")}
          </button>
        </div>
      </div>
    </section>
  );
}

export function SecretMessage() {
  const { t } = useT();
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => "",
  );
  const payload = decodeSecret(hash);
  const broken = hash.includes("m=") && !payload;
  // Inside the academy the frame is already there; a visiting friend gets
  // the page on its own, with a way into the academy.
  const { signedIn } = useJuniorState();
  return (
    <div className={signedIn ? undefined : "junior container page-content"}>
      {!signedIn && (
        <Link className="jr-back" href="/junior">
          <ArrowLeft size={15} aria-hidden="true" /> Cybervalue Academy Junior
        </Link>
      )}
      <header className="jr-hero jr-page-head">
        <span className="eyebrow">
          <span className="status-dot" /> {t("SECRET MAIL")}
        </span>
        <h1>
          {t("Secret message.")} <span>{t("For the two of you.")}</span>
        </h1>
        <p>
          {t(
            "Send a friend a message only the two of you can read. Pick a cipher, choose a key and share the link.",
          )}
        </p>
      </header>
      {broken && (
        <p className="jr-verdict jr-bad" role="alert">
          {t("This link is broken or invalid. You can write a new message.")}
        </p>
      )}
      {payload ? <Read key={hash} payload={payload} /> : <Compose />}
    </div>
  );
}
