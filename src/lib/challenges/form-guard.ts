// A signed time stamp in the sign-up form. Scripts that post the form at once
// (or replay an old one) are refused; people take a few seconds to fill it in.
// Pure functions: the secret and the clock are passed in.
import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_AGE_MS = 2 * 60 * 60 * 1000;

const sign = (secret: string, at: number) =>
  createHmac("sha256", secret).update(`ctf-form:${at}`).digest("base64url");

export function formStamp(secret: string, now = Date.now()) {
  return `${now}.${sign(secret, now)}`;
}

export function stampOk(
  secret: string,
  stamp: unknown,
  minSeconds: number,
  now = Date.now(),
) {
  if (typeof stamp !== "string" || stamp.length > 100) return false;
  const [time, signature = ""] = stamp.split(".");
  const at = Number(time);
  if (!Number.isSafeInteger(at)) return false;
  const expected = Buffer.from(sign(secret, at));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    return false;
  return now - at >= minSeconds * 1000 && now - at <= MAX_AGE_MS;
}
