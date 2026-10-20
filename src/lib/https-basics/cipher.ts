// The toy cipher of the HTTPS lab: a letter shift, enough to show that the
// same key locks and unlocks, and that a small key space falls to guessing.

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

export function shift(text: string, key: number) {
  const k = ((key % 26) + 26) % 26;
  return [...text]
    .map((ch) => {
      const lower = ch.toLowerCase();
      const i = ALPHABET.indexOf(lower);
      if (i < 0) return ch;
      const out = ALPHABET[(i + k) % 26];
      return ch === lower ? out : out.toUpperCase();
    })
    .join("");
}

export const unshift = (text: string, key: number) => shift(text, -key);

/** The intercepted message the student must open, and its key. */
export const SECRET = { plain: "parol kuchli bolsin", key: 7 } as const;
export const INTERCEPTED = shift(SECRET.plain, SECRET.key);

/** One link of a certificate chain: who it is for and who signed it. */
export type Link = {
  subject: string;
  issuer: string;
  /** Whether the issuer's signature on it checks out. */
  valid: boolean;
};

export const CHAIN: Link[] = [
  { subject: "bank.uz", issuer: "R3 Intermediate CA", valid: true },
  { subject: "R3 Intermediate CA", issuer: "ISRG Root X1", valid: true },
  { subject: "ISRG Root X1", issuer: "ISRG Root X1", valid: true },
];
