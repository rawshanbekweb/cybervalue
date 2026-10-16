import { atbash, caesar, morseDecode, morseEncode, vigenere } from "./ciphers";
import { enigma } from "./enigma";

// "Send a secret to a friend": the encrypted message travels in the link's
// #fragment, which browsers never send to the server. The key can be left
// out, so the friend has to ask for it in person — a real key exchange.

export const SECRET_CIPHERS = [
  "caesar",
  "atbash",
  "vigenere",
  "enigma",
  "morse",
] as const;
export type SecretCipher = (typeof SECRET_CIPHERS)[number];

export type SecretPayload = {
  c: SecretCipher;
  /** Ciphertext. */
  t: string;
  /** Key, only when the sender chose to include it. */
  k?: string;
  /** A short hint from the sender. */
  h?: string;
};

export const MAX_SECRET = 300;

/** Whether `key` is a valid key for the cipher ("" for keyless ciphers). */
export function validKey(cipher: SecretCipher, key: string) {
  switch (cipher) {
    case "caesar":
      return /^\d{1,2}$/.test(key) && Number(key) >= 1 && Number(key) <= 25;
    case "vigenere":
      return /^[A-Za-z]{1,20}$/.test(key);
    case "enigma":
      return /^[A-Za-z]{3}$/.test(key);
    default:
      return key === "";
  }
}

export const needsKey = (cipher: SecretCipher) =>
  cipher === "caesar" || cipher === "vigenere" || cipher === "enigma";

export function encryptSecret(cipher: SecretCipher, text: string, key: string) {
  switch (cipher) {
    case "caesar":
      return caesar(text, Number(key));
    case "atbash":
      return atbash(text);
    case "vigenere":
      return vigenere(text, key);
    case "enigma":
      return enigma(text, key);
    default:
      return morseEncode(text);
  }
}

export function decryptSecret(cipher: SecretCipher, text: string, key: string) {
  switch (cipher) {
    case "caesar":
      return caesar(text, -Number(key));
    case "atbash":
      return atbash(text);
    case "vigenere":
      return vigenere(text, key, true);
    case "enigma":
      return enigma(text, key);
    default:
      return morseDecode(text);
  }
}

function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(text: string) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return new TextDecoder("utf-8", { fatal: true }).decode(
    Uint8Array.from(binary, (c) => c.charCodeAt(0)),
  );
}

export function encodeSecret(payload: SecretPayload) {
  return toBase64Url(JSON.stringify(payload));
}

const CLEAN = /[\u0000-\u0008\u000b-\u001f\u007f<>]/g;

/** Reads a link fragment; anything malformed or oversized is rejected. */
export function decodeSecret(fragment: string): SecretPayload | null {
  const match = /(?:^|[#&])m=([A-Za-z0-9_-]{1,1200})(?:&|$)/.exec(fragment);
  if (!match) return null;
  try {
    const value = JSON.parse(fromBase64Url(match[1])) as Record<
      string,
      unknown
    >;
    const c = value.c;
    if (typeof c !== "string" || !SECRET_CIPHERS.includes(c as SecretCipher))
      return null;
    const cipher = c as SecretCipher;
    if (
      typeof value.t !== "string" ||
      !value.t.trim() ||
      value.t.length > MAX_SECRET * 6
    )
      return null;
    const payload: SecretPayload = { c: cipher, t: value.t.replace(CLEAN, "") };
    if (value.k !== undefined) {
      if (typeof value.k !== "string" || !validKey(cipher, value.k))
        return null;
      payload.k = value.k;
    }
    if (value.h !== undefined) {
      if (typeof value.h !== "string" || value.h.length > 80) return null;
      payload.h = value.h.replace(CLEAN, "");
    }
    return payload;
  } catch {
    return null;
  }
}
