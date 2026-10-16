import { createHmac, timingSafeEqual } from "node:crypto";

// An attempt token ties a seed to the student who started it, so the server
// can rebuild the questions at submit time without storing anything first.
// Tokens expire, and a seed can be graded only once per student.
export type Attempt = {
  checkpoint: string;
  seed: number;
  student: string;
  issued: number;
};

export const ATTEMPT_TTL_MS = 2 * 60 * 60 * 1000;

const sign = (secret: string, body: string) =>
  createHmac("sha256", `checkpoint:${secret}`).update(body).digest("base64url");

export function issueAttempt(secret: string, attempt: Attempt) {
  const body = Buffer.from(JSON.stringify(attempt)).toString("base64url");
  return `${body}.${sign(secret, body)}`;
}

export function readAttempt(
  secret: string,
  token: unknown,
  now = Date.now(),
): Attempt | null {
  if (typeof token !== "string" || token.length > 1000) return null;
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra !== undefined) return null;
  const expected = Buffer.from(sign(secret, body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given))
    return null;
  try {
    const value = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (
      typeof value?.checkpoint !== "string" ||
      !Number.isInteger(value.seed) ||
      typeof value.student !== "string" ||
      typeof value.issued !== "number" ||
      now - value.issued > ATTEMPT_TTL_MS ||
      value.issued > now + 60_000
    )
      return null;
    return value as Attempt;
  } catch {
    return null;
  }
}
