// Shifr xazinasi: every chest holds an encrypted clue, and the child writes a
// small decoding program, one step per line:
//
//   sur(3)          shift every letter 3 back (undoes a Caesar shift)
//   teskari()       reverse the text
//   atbash()        swap A↔Z, B↔Y, …
//   kalit("KOD")    undo a Vigenère cipher with that key
//   sinab_kor()     list all 25 Caesar shifts, to find the readable one
//
// The browser shows the text after every step; the server runs the same
// steps before it opens a chest.

import { normalize, suggest, type Problem, type Text } from "./lang";

export type Step =
  | { kind: "sur"; line: number; n: number }
  | { kind: "teskari"; line: number }
  | { kind: "atbash"; line: number }
  | { kind: "kalit"; line: number; key: string }
  | { kind: "sinab_kor"; line: number };

export type CipherProgram = { steps: Step[]; problems: Problem[] };

const A = "A".charCodeAt(0);
const isLetter = (c: string) => c >= "A" && c <= "Z";

/** Moves every letter `n` places forward in the alphabet. */
export function shift(text: string, n: number) {
  return [...text]
    .map((c) =>
      isLetter(c)
        ? String.fromCharCode(
            A + ((((c.charCodeAt(0) - A + n) % 26) + 26) % 26),
          )
        : c,
    )
    .join("");
}

export const reverse = (text: string) => [...text].reverse().join("");

export const atbash = (text: string) =>
  [...text]
    .map((c) =>
      isLetter(c) ? String.fromCharCode(A + 25 - (c.charCodeAt(0) - A)) : c,
    )
    .join("");

/** Vigenère with the key's letters; only letters use up the key. */
export function vigenere(text: string, key: string, sign: 1 | -1) {
  const k = [...key.toUpperCase()].filter(isLetter);
  if (!k.length) return text;
  let i = 0;
  return [...text]
    .map((c) => {
      if (!isLetter(c)) return c;
      const n = k[i++ % k.length].charCodeAt(0) - A;
      return shift(c, sign * n);
    })
    .join("");
}

const COMMANDS = ["sur", "teskari", "atbash", "kalit", "sinab_kor"];
const CALL = /^([a-z_']+)\s*\(\s*(.*?)\s*\)$/;

export function parseCipher(code: string): CipherProgram {
  const steps: Step[] = [];
  const problems: Problem[] = [];
  const fail = (line: number, message: Text) =>
    problems.push({ line, message });
  code
    .split("\n")
    .slice(0, 100)
    .forEach((source, index) => {
      const line = index + 1;
      const text = source.replace(/(\/\/|#).*$/, "").trim();
      if (!text) return;
      const call = CALL.exec(normalize(text));
      const name = call?.[1] ?? normalize(text).replace(/\(.*$/, "").trim();
      if (!call || !COMMANDS.includes(name)) {
        const close = suggest(name, COMMANDS);
        fail(line, {
          uz: close
            ? `Bu buyruqni tushunmadim. Balki “${close}()”?`
            : "Bu buyruqni tushunmadim. Namuna: sur(3)",
          en: close
            ? `I did not understand this command. Did you mean “${close}()”?`
            : "I did not understand this command. Example: sur(3)",
        });
        return;
      }
      const arg = call[2];
      if (name === "sur") {
        if (!/^-?\d+$/.test(arg) || Math.abs(Number(arg)) > 25) {
          fail(line, {
            uz: "sur() ichiga 1 dan 25 gacha son yozing, masalan: sur(3)",
            en: "Put a number from 1 to 25 inside sur(), for example: sur(3)",
          });
          return;
        }
        steps.push({ kind: "sur", line, n: Number(arg) });
      } else if (name === "kalit") {
        // The key keeps the child's letters; it is read from the raw line.
        const key = /\(\s*"([A-Za-z]{1,20})"\s*\)/.exec(text)?.[1];
        if (!key) {
          fail(line, {
            uz: `kalit() ichiga qo‘shtirnoqda harflar yozing, masalan: kalit("KOD")`,
            en: `Put letters in quotes inside kalit(), for example: kalit("KOD")`,
          });
          return;
        }
        steps.push({ kind: "kalit", line, key: key.toUpperCase() });
      } else if (arg) {
        fail(line, {
          uz: `${name}() ichiga hech narsa yozilmaydi.`,
          en: `${name}() takes nothing inside the brackets.`,
        });
      } else
        steps.push({ kind: name as "teskari" | "atbash" | "sinab_kor", line });
    });
  return { steps, problems };
}

export type Trace = {
  /** The text after each step, in order. */
  after: { line: number; text: string }[];
  /** Filled when the program asks to try every shift. */
  tries: { n: number; text: string }[];
  result: string;
};

export function runCipher(steps: Step[], cipher: string): Trace {
  let text = cipher;
  const after: Trace["after"] = [];
  let tries: Trace["tries"] = [];
  for (const step of steps) {
    if (step.kind === "sur") text = shift(text, -step.n);
    else if (step.kind === "teskari") text = reverse(text);
    else if (step.kind === "atbash") text = atbash(text);
    else if (step.kind === "kalit") text = vigenere(text, step.key, -1);
    else
      tries = Array.from({ length: 25 }, (_, i) => ({
        n: i + 1,
        text: shift(text, -(i + 1)),
      }));
    after.push({ line: step.line, text });
  }
  return { after, tries, result: text };
}

export type Chest = {
  id: string;
  plain: string;
  cipher: string;
  /** Commands the solution has to use. */
  needs?: Step["kind"][];
};

const chest = (
  id: string,
  plain: string,
  encode: (text: string) => string,
  needs?: Step["kind"][],
): Chest => ({ id, plain, cipher: encode(plain), needs });

export const CHESTS: Record<string, Chest> = Object.fromEntries(
  [
    chest("c1", "XAZINA", (t) => shift(t, 1), ["sur"]),
    chest("c2", "OLTIN TANGA", (t) => shift(t, 3), ["sur"]),
    chest("c3", "KALIT BOGDA", (t) => shift(t, 7), ["sur"]),
    chest("c4", "SANDIQ", reverse, ["teskari"]),
    chest("c5", "MAXFIY YOL", (t) => reverse(shift(t, 4)), ["teskari", "sur"]),
    chest("c6", "TOSH OSTIDA", atbash, ["atbash"]),
    chest("c7", "QAROQCHI KEMASI", (t) => shift(atbash(t), 2), [
      "atbash",
      "sur",
    ]),
    chest("c8", "XARITA", (t) => vigenere(t, "KOD", 1), ["kalit"]),
    chest("c9", "OROL SHIMOLDA", (t) => reverse(vigenere(t, "SIR", 1)), [
      "teskari",
      "kalit",
    ]),
    chest("c10", "YULDUZLAR OSTIDA QAZING", (t) => vigenere(t, "XAZINA", 1), [
      "kalit",
    ]),
  ].map((c) => [c.id, c]),
);

export function cipherSolved(code: string, chest: Chest) {
  const program = parseCipher(code);
  if (program.problems.length) return false;
  if (chest.needs?.some((kind) => !program.steps.some((s) => s.kind === kind)))
    return false;
  return runCipher(program.steps, chest.cipher).result === chest.plain;
}
