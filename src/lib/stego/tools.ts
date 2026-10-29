// Academy Intermediate · Steganography, the idea: a message hidden in the
// first letters of a poem (an acrostic), and one hidden in invisible
// zero-width characters inside an ordinary chat message.
import type { Text } from "../network/ip";

// --- Acrostic -------------------------------------------------------------------------

export type Poem = { lines: string[]; answer: string };

/** One poem per language: the first letters spell the answer. */
export const POEMS: Record<keyof Text, Poem> = {
  en: {
    lines: [
      "Morning comes slowly over the hills,",
      "Every window still asleep,",
      "Every road still empty and grey;",
      "Trains are waiting in the station.",
      "Nobody hurries, nobody calls,",
      "Only the river keeps its pace,",
      "Wandering on towards the sea.",
    ],
    answer: "MEETNOW",
  },
  uz: {
    lines: [
      "Erta tong tog‘lar ortidan chiqdi,",
      "Rang-barang bulutlar suzib o‘tdi,",
      "Tinch shahar hali uyquda edi,",
      "Ariqlarda suv sekin oqardi.",
      "Gul ochildi bog‘ning to‘rida,",
      "Ammo hech kim buni ko‘rmadi.",
    ],
    answer: "ERTAGA",
  },
};

export const acrostic = (lines: string[]) =>
  lines
    .map((l) => l.trim()[0] ?? "")
    .join("")
    .toUpperCase();

export const acrosticRight = (lang: keyof Text, guess: string) =>
  guess.replace(/\s/g, "").toUpperCase() === POEMS[lang].answer;

// --- Zero-width characters -------------------------------------------------------------

export const ZERO = String.fromCharCode(0x200b); // zero-width space: a 0 bit
export const ONE = String.fromCharCode(0x200c); // zero-width non-joiner: a 1 bit

/** Each character of the secret as 8 invisible bits. */
export function hideBits(secret: string) {
  return [...secret]
    .map((c) =>
      c
        .charCodeAt(0)
        .toString(2)
        .padStart(8, "0")
        .replace(/0/g, ZERO)
        .replace(/1/g, ONE),
    )
    .join("");
}

/** The visible text with the secret tucked in after its first word. */
export function embed(cover: string, secret: string) {
  const i = cover.indexOf(" ");
  return cover.slice(0, i) + hideBits(secret) + cover.slice(i);
}

/** The invisible characters as 0s and 1s. */
export const bitsOf = (text: string) =>
  [...text]
    .filter((c) => c === ZERO || c === ONE)
    .map((c) => (c === ONE ? "1" : "0"))
    .join("");

export function decodeBits(bits: string) {
  let out = "";
  for (let i = 0; i + 8 <= bits.length; i += 8)
    out += String.fromCharCode(parseInt(bits.slice(i, i + 8), 2));
  return out;
}

export const SECRET = "13:00";
export const COVER: Text = {
  uz: "Salom! Ertaga tushlikka chiqamizmi? Yangi oshxona ochilibdi.",
  en: "Hi! Shall we go out for lunch tomorrow? A new place has opened.",
};

export const message = (lang: keyof Text) => embed(COVER[lang], SECRET);
