import { randomBytes } from "node:crypto";
import { ALPHABET, hashSecret } from "../student/access";

export { hashSecret };

// Junior codes are short enough for a 13-year-old to type: 8 Crockford
// base32 symbols (40 random bits), shown as XXXX-XXXX. With the sign-in rate
// limits, guessing one is out of reach.
const LENGTH = 8;

export function newJuniorCode() {
  return [...randomBytes(LENGTH)].map((byte) => ALPHABET[byte & 31]).join("");
}

export function isJuniorCode(code: string) {
  return code.length === LENGTH && [...code].every((c) => ALPHABET.includes(c));
}

export const formatJuniorCode = (code: string) =>
  `${code.slice(0, 4)}-${code.slice(4)}`;
