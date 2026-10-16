// Pure cipher helpers for the Junior "Cipher room". Everything runs in the
// browser; nothing typed is sent anywhere. Only the Latin letters A–Z are
// enciphered: other characters (spaces, digits, o‘ and g‘ apostrophes) pass
// through unchanged unless a cipher says otherwise.

import { caesar } from "./logic";

export { caesar };

const A = 65;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Upper-case A–Z only: the form most answers are compared in. */
export function lettersOnly(text: string) {
  return text.toUpperCase().replace(/[^A-Z]/g, "");
}

// Atbash ---------------------------------------------------------------------

export function atbash(text: string) {
  return text.replace(/[a-z]/gi, (char) => {
    const base = char <= "Z" ? 65 : 97;
    return String.fromCharCode(base + 25 - (char.charCodeAt(0) - base));
  });
}

// Scytale --------------------------------------------------------------------
// The strip is wound so the rod shows `rows` lines of letters. The message is
// written along the rod line by line; unwinding the strip reads it column by
// column. Spaces are dropped and the last line is padded with X.

export function scytaleGrid(text: string, rows: number) {
  const letters = lettersOnly(text);
  const r = Math.max(2, Math.floor(rows));
  const cols = Math.max(1, Math.ceil(letters.length / r));
  const padded = letters.padEnd(r * cols, "X");
  return Array.from({ length: r }, (_, row) =>
    padded.slice(row * cols, row * cols + cols).split(""),
  );
}

export function scytaleEncrypt(text: string, rows: number) {
  const grid = scytaleGrid(text, rows);
  let out = "";
  for (let col = 0; col < grid[0].length; col++)
    for (const line of grid) out += line[col];
  return out;
}

export function scytaleDecrypt(text: string, rows: number) {
  const letters = lettersOnly(text);
  const r = Math.max(2, Math.floor(rows));
  const cols = Math.ceil(letters.length / r);
  const grid = Array.from({ length: r }, () => Array<string>(cols).fill(""));
  let i = 0;
  for (let col = 0; col < cols; col++)
    for (let row = 0; row < r; row++) grid[row][col] = letters[i++] ?? "";
  return grid.map((line) => line.join("")).join("");
}

// Polybius square ------------------------------------------------------------
// A 5 × 5 square; I and J share a cell, as in the classical square.

export const POLYBIUS = ["ABCDE", "FGHIK", "LMNOP", "QRSTU", "VWXYZ"];

export function polybiusCell(letter: string): [number, number] | null {
  const upper = letter.toUpperCase() === "J" ? "I" : letter.toUpperCase();
  for (let row = 0; row < 5; row++) {
    const col = POLYBIUS[row].indexOf(upper);
    if (col >= 0) return [row + 1, col + 1];
  }
  return null;
}

export function polybiusEncrypt(text: string) {
  return lettersOnly(text)
    .split("")
    .map((letter) => polybiusCell(letter)!.join(""))
    .join(" ");
}

export function polybiusDecrypt(text: string) {
  const digits = text.replace(/[^1-5]/g, "");
  let out = "";
  for (let i = 0; i + 1 < digits.length; i += 2)
    out += POLYBIUS[Number(digits[i]) - 1][Number(digits[i + 1]) - 1];
  return out;
}

// Vigenère -------------------------------------------------------------------
// Each letter is shifted by the matching letter of the key word (A = 0).
// Characters that are not letters do not use up a key letter.

export function vigenere(text: string, key: string, decrypt = false) {
  const shifts = lettersOnly(key)
    .split("")
    .map((letter) => letter.charCodeAt(0) - A);
  if (!shifts.length) return text;
  let i = 0;
  return text.replace(/[a-z]/gi, (char) => {
    const shift = shifts[i++ % shifts.length] * (decrypt ? -1 : 1);
    return caesar(char, shift);
  });
}

// Morse code -----------------------------------------------------------------
// An encoding, not a cipher: the table is public, so there is no secret key.

export const MORSE: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
};
const FROM_MORSE = Object.fromEntries(
  Object.entries(MORSE).map(([letter, code]) => [code, letter]),
);

/** Letters are separated by a space, words by " / ". */
export function morseEncode(text: string) {
  return text
    .toUpperCase()
    .split(/\s+/)
    .map((word) =>
      word
        .split("")
        .map((char) => MORSE[char])
        .filter(Boolean)
        .join(" "),
    )
    .filter(Boolean)
    .join(" / ");
}

export function morseDecode(code: string) {
  return code
    .replace(/[–—−_]/g, "-")
    .replace(/[·•*]/g, ".")
    .trim()
    .split(/\s*\/\s*|\s{3,}/)
    .map((word) =>
      word
        .split(/\s+/)
        .map((token) => FROM_MORSE[token] ?? (token ? "?" : ""))
        .join(""),
    )
    .join(" ");
}

/** Normalised Morse for comparing answers: dots, dashes, single spaces, " / ". */
export function normalizeMorse(code: string) {
  return code
    .replace(/[–—−_]/g, "-")
    .replace(/[·•*]/g, ".")
    .replace(/[^.\-/\s]/g, "")
    .trim()
    .split(/\s*\/\s*/)
    .map((word) => word.trim().split(/\s+/).join(" "))
    .join(" / ");
}

// Frequency analysis ---------------------------------------------------------
// Letter shares (per mille). English from the usual tables; Uzbek (Latin)
// counted from the Uzbek copy of this site, with o‘ and g‘ read as O and G.

export const FREQUENCIES: Record<"en" | "uz", number[]> = {
  en: [
    82, 15, 28, 43, 127, 22, 20, 61, 70, 2, 8, 40, 24, 67, 75, 19, 1, 60, 63,
    91, 28, 10, 24, 2, 20, 1,
  ],
  uz: [
    142, 27, 15, 34, 34, 9, 31, 42, 130, 6, 22, 57, 29, 67, 60, 10, 21, 59, 55,
    55, 30, 17, 2, 6, 27, 12,
  ],
};

export function letterCounts(text: string) {
  const counts = Array<number>(26).fill(0);
  for (const letter of lettersOnly(text)) counts[letter.charCodeAt(0) - A]++;
  return counts;
}

/** The Caesar shift whose decryption looks most like the language. */
export function crackCaesar(text: string, language: "en" | "uz") {
  const counts = letterCounts(text);
  const total = counts.reduce((sum, n) => sum + n, 0);
  if (!total) return 0;
  const expected = FREQUENCIES[language];
  let best = 0;
  let bestScore = Infinity;
  for (let shift = 0; shift < 26; shift++) {
    let score = 0;
    for (let i = 0; i < 26; i++) {
      const observed = counts[(i + shift) % 26];
      const wanted = (expected[i] / 1000) * total;
      score += (observed - wanted) ** 2 / Math.max(wanted, 0.5);
    }
    if (score < bestScore) {
      bestScore = score;
      best = shift;
    }
  }
  return best;
}

// Pigpen (Freemasons') cipher -----------------------------------------------
// A–I sit in a # grid, J–R in a dotted # grid, S–V in an X, W–Z in a dotted X.
// A letter is drawn as the walls around its cell.

export type PigpenGlyph = {
  kind: "grid" | "x";
  /** Walls of a grid cell: top, right, bottom, left. */
  walls: [boolean, boolean, boolean, boolean];
  /** For an X cell: where the open side faces. */
  opens: "up" | "right" | "down" | "left";
  dot: boolean;
};

export function pigpen(letter: string): PigpenGlyph | null {
  const index = ALPHABET.indexOf(letter.toUpperCase());
  if (index < 0) return null;
  if (index < 18) {
    const cell = index % 9;
    const row = Math.floor(cell / 3);
    const col = cell % 3;
    return {
      kind: "grid",
      walls: [row > 0, col < 2, row < 2, col > 0],
      opens: "up",
      dot: index >= 9,
    };
  }
  const opens = (["up", "left", "right", "down"] as const)[(index - 18) % 4];
  return {
    kind: "x",
    walls: [false, false, false, false],
    opens,
    dot: index >= 22,
  };
}

// Public-key "paint mixing" --------------------------------------------------
// A mixture is a recipe of equal parts; its colour is the average. Adding the
// same three parts in any order gives the same colour, which is the idea
// behind Diffie–Hellman key exchange.

export type Rgb = [number, number, number];

export function mix(...parts: Rgb[]): Rgb {
  const sum = parts.reduce<Rgb>(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0],
  );
  return sum.map((v) => Math.round(v / parts.length)) as Rgb;
}

export const toCss = ([r, g, b]: Rgb) => `rgb(${r}, ${g}, ${b})`;

// Answers --------------------------------------------------------------------

export type AnswerFormat = "letters" | "morse" | "digits" | "choice";

export function sameAnswer(
  format: AnswerFormat,
  given: string,
  expected: string,
) {
  switch (format) {
    case "morse":
      return normalizeMorse(given) === normalizeMorse(expected);
    case "digits":
      return given.replace(/\D/g, "") === expected.replace(/\D/g, "");
    case "choice":
      return given === expected;
    default:
      return (
        lettersOnly(given).length > 0 &&
        lettersOnly(given) === lettersOnly(expected)
      );
  }
}
