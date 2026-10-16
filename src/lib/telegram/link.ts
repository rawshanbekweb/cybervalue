import { createHmac, timingSafeEqual } from "node:crypto";

// Deep links (t.me/<bot>?start=<payload>) that tie a Telegram chat to one
// person. The payload is the kind, the id and a signature, all within the
// 64 characters and [A-Za-z0-9_-] Telegram allows.
export const LINK_KINDS = {
  t: "teacher",
  s: "student",
  p: "parent:student",
  j: "parent:junior",
} as const;
export type LinkKind = keyof typeof LINK_KINDS;

const SIG = 16;
const sign = (secret: string, body: string) =>
  createHmac("sha256", `telegram-link:${secret}`)
    .update(body)
    .digest("base64url")
    .slice(0, SIG);

export function signLink(secret: string, kind: LinkKind, id: string) {
  if (!/^[A-Za-z0-9_-]{1,46}$/.test(id)) throw new Error("Unsupported id");
  return `${kind}${id}${sign(secret, `${kind}${id}`)}`;
}

export function readLink(secret: string, payload: unknown) {
  if (
    typeof payload !== "string" ||
    !/^[tspj][A-Za-z0-9_-]{2,63}$/.test(payload)
  )
    return null;
  if (payload.length < SIG + 3) return null;
  const body = payload.slice(0, -SIG);
  const given = Buffer.from(payload.slice(-SIG));
  const expected = Buffer.from(sign(secret, body));
  if (!timingSafeEqual(given, expected)) return null;
  const kind = body[0] as LinkKind;
  const id = body.slice(1);
  return { kind, id, subject: `${LINK_KINDS[kind]}:${id}` };
}
