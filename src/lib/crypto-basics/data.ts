// Fixed data of the cryptography lab's exercises. Everything is made up and
// small enough to read; the hashes are computed from it, never typed in.
import { sha256, toBase64 } from "./tools";

/** Lesson 1: the character whose UTF-8 bytes the student counts. */
export const APOSTROPHE = { char: "‘", bytes: 3 } as const;

/** Lesson 2: a cookie that trusts its own Base64 value. */
export const COOKIE = {
  plain: "admin=false",
  forged: "admin=true",
} as const;
export const COOKIE_VALUE = toBase64(COOKIE.plain);

/** Lesson 5: the published checksum and three downloads of one file. */
export const RELEASE = {
  name: "kiberlab-2.4.zip",
  content: "kiberlab 2.4 · rasmiy nashr · 1 204 812 bayt",
};
export const RELEASE_HASH = sha256(RELEASE.content);
export const MIRRORS = [
  {
    id: "a",
    host: "files.kiberlab.example",
    content: "kiberlab 2.4 · rasmiy nashr · 1 204 812 bayt ",
  },
  { id: "b", host: "mirror.uz.example", content: RELEASE.content },
  {
    id: "c",
    host: "tez-yuklash.example",
    content: "kiberlab 2.4 · rasmiy nashr · 1 204 813 bayt",
  },
] as const;
export const GOOD_MIRROR = "b";

/** Lesson 6: a leaked table of unsalted password hashes. */
const PASSWORDS = {
  aziza: "quyosh2024",
  bekzod: "Toshkent!88",
  dilnoza: "quyosh2024",
  eldor: "kitob-qalam-7",
  farrux: "Samarqand2025",
} as const;
export const SALTS: Record<keyof typeof PASSWORDS, string> = {
  aziza: "9f1c",
  bekzod: "41aa",
  dilnoza: "d07e",
  eldor: "6b25",
  farrux: "c3e9",
};
export const LEAK = (Object.keys(PASSWORDS) as (keyof typeof PASSWORDS)[]).map(
  (user) => ({
    user,
    plain: sha256(PASSWORDS[user]),
    salted: sha256(SALTS[user] + PASSWORDS[user]),
    salt: SALTS[user],
  }),
);
export const SHARED_PAIR = ["aziza", "dilnoza"] as const;

/** Lesson 7: a weak password and the short list a dictionary attack tries. */
export const WEAK_PASSWORD = "lola2010";
export const TARGET_HASH = sha256(WEAK_PASSWORD);
export const WORDLIST = [
  "123456",
  "parol",
  "qwerty",
  "salom123",
  "admin",
  "toshkent",
  "111111",
  "iloveyou",
  "lola2010",
  "dragon",
  "futbol",
  "000000",
];

/** Lesson 8: a byte encrypted with a one-byte XOR key. */
export const XOR_TASK = { cipher: 0x69, key: 0x2a, plain: "C" } as const;

/** Lesson 9: an attacker trying a trillion keys a second for a million years. */
export const KEYSPACE = { perSecond: 1e12, years: 1e6 } as const;

/** Lesson 10: the message the student signs and then tampers with. */
export const SIGNED_MESSAGE = "Aliga 100 000 so‘m o‘tkazilsin. — Bank";
