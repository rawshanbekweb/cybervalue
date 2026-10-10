import { createHash, randomBytes } from "node:crypto";

export { formatAccessCode } from "./format";

// Crockford base32: no I, L, O or U, so a code read aloud or copied by hand
// survives. 16 symbols carry 80 random bits, far beyond online guessing, which
// is why a fast SHA-256 digest is enough to store it.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const LENGTH = 16;

export function newAccessCode() {
  // 256 is a multiple of 32, so masking each byte stays unbiased.
  return [...randomBytes(LENGTH)].map((byte) => ALPHABET[byte & 31]).join("");
}

export function normalizeAccessCode(input: string) {
  return input
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
}

export function isAccessCode(code: string) {
  return code.length === LENGTH && [...code].every((c) => ALPHABET.includes(c));
}

export const hashSecret = (value: string) =>
  createHash("sha256").update(value).digest("hex");
