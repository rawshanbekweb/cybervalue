import type { Text } from "./logic";
import {
  atbash,
  caesar,
  morseEncode,
  polybiusEncrypt,
  vigenere,
  type AnswerFormat,
} from "./ciphers";
import { enigma } from "./enigma";

// The daily puzzle: one encrypted saying per day (Tashkent time), the same
// for everyone, with the cipher and its key shown so it can be solved with
// the Cipher Room's tools. Solving it on consecutive days builds a streak.

const DAY = 86_400_000;
const TASHKENT = 5 * 3_600_000;

/** Days since 1970 in Tashkent time; the puzzle changes at local midnight. */
export const dayIndex = (ms: number) => Math.floor((ms + TASHKENT) / DAY);

const SAYINGS: Text[] = [
  { uz: "ILM BAXT KALITI", en: "KNOWLEDGE IS POWER" },
  { uz: "PAROLINGNI HECH KIMGA AYTMA", en: "NEVER SHARE YOUR PASSWORD" },
  { uz: "NOTANISH HAVOLANI BOSMA", en: "THINK BEFORE YOU CLICK" },
  { uz: "YETTI OLCHAB BIR KES", en: "MEASURE TWICE CUT ONCE" },
  { uz: "IKKI BOSQICHLI HIMOYANI YOQ", en: "TURN ON TWO STEP LOGIN" },
  { uz: "TIL DIL KALITI", en: "CURIOSITY BUILDS DEFENDERS" },
  { uz: "KITOB BILIM MANBAI", en: "BOOKS ARE A SOURCE OF KNOWLEDGE" },
  { uz: "SHUBHALI XATGA JAVOB BERMA", en: "DO NOT ANSWER STRANGE EMAILS" },
  { uz: "SABR TAGI SARIQ OLTIN", en: "PATIENCE IS GOLDEN" },
  { uz: "EKRANINGNI QULFLAB QOY", en: "LOCK YOUR SCREEN" },
  { uz: "RUXSAT SORAMASDAN SINAMA", en: "ASK BEFORE YOU HACK" },
  {
    uz: "HAR BIR USTA AVVAL SHOGIRD BOLGAN",
    en: "EVERY EXPERT WAS A BEGINNER",
  },
  { uz: "DASTURLARNI YANGILAB TUR", en: "KEEP YOUR APPS UPDATED" },
  { uz: "BILIM KUCH", en: "KEEP CALM AND ENCRYPT" },
];

const KINDS = [
  "caesar",
  "atbash",
  "vigenere",
  "morse",
  "polybius",
  "enigma",
] as const;
export type DailyKind = (typeof KINDS)[number];
const KEYWORDS = ["SIR", "KOD", "NUR", "KEY", "SUN", "OWL", "ILM"];

export type DailyPuzzle = {
  day: number;
  kind: DailyKind;
  key?: string;
  given: string;
  answer: string;
  format: AnswerFormat;
};

export function puzzleFor(day: number, locale: "uz" | "en"): DailyPuzzle {
  // 14 sayings and 6 ciphers do not repeat together for 42 days.
  const plain =
    SAYINGS[((day % SAYINGS.length) + SAYINGS.length) % SAYINGS.length][locale];
  const kind = KINDS[((day % KINDS.length) + KINDS.length) % KINDS.length];
  const n = Math.abs(day);
  switch (kind) {
    case "caesar": {
      const key = String(1 + (n % 25));
      return {
        day,
        kind,
        key,
        given: caesar(plain, Number(key)),
        answer: plain,
        format: "letters",
      };
    }
    case "atbash":
      return {
        day,
        kind,
        given: atbash(plain),
        answer: plain,
        format: "letters",
      };
    case "vigenere": {
      const key = KEYWORDS[n % KEYWORDS.length];
      return {
        day,
        kind,
        key,
        given: vigenere(plain, key),
        answer: plain,
        format: "letters",
      };
    }
    case "morse":
      return {
        day,
        kind,
        given: morseEncode(plain),
        answer: plain,
        format: "letters",
      };
    case "polybius":
      return {
        day,
        kind,
        given: polybiusEncrypt(plain),
        answer: plain.replace(/J/g, "I"),
        format: "letters",
      };
    default: {
      const key = [n, n * 7, n * 13]
        .map((v) => String.fromCharCode(65 + (v % 26)))
        .join("");
      return {
        day,
        kind,
        key,
        given: enigma(plain, key),
        answer: plain,
        format: "letters",
      };
    }
  }
}

/** Solved days from storage: integers, newest 400 kept. */
export function restoreDaily(raw: unknown): number[] {
  const days =
    raw &&
    typeof raw === "object" &&
    Array.isArray((raw as { days?: unknown }).days)
      ? ((raw as { days: unknown[] }).days.filter(
          (d) => Number.isInteger(d) && (d as number) > 0,
        ) as number[])
      : [];
  return [...new Set(days)].sort((a, b) => a - b).slice(-400);
}

/** Consecutive solved days ending today, or yesterday if today is still open. */
export function streak(days: readonly number[], today: number) {
  const solved = new Set(days);
  let day = solved.has(today) ? today : today - 1;
  let count = 0;
  while (solved.has(day)) {
    count++;
    day--;
  }
  return count;
}
