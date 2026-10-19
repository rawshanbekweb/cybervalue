// Pure helpers for Cybervalue Academy Junior, used in the browser and by the
// server's checks (./verify.ts). A password typed into the password mission
// never leaves the browser.

export type Text = { uz: string; en: string };

// A fast offline attack on a leaked, weakly hashed password list.
export const GUESSES_PER_SECOND = 1e10;
// A password must hold out this long for the password mission to count.
export const STRONG_SECONDS = 10 * 365 * 24 * 3600;
// Word list size of a typical passphrase generator (five dice rolls).
const WORD_LIST = 7776;

const COMMON = new Set([
  "123456",
  "12345678",
  "123456789",
  "1234567890",
  "111111",
  "000000",
  "qwerty",
  "qwerty123",
  "qwertyuiop",
  "password",
  "password1",
  "p@ssw0rd",
  "parol",
  "parol123",
  "admin",
  "admin123",
  "letmein",
  "iloveyou",
  "salom",
  "salom123",
  "uzbekistan",
  "football",
  "dragon",
  "monkey",
  "abc123",
  "welcome",
  "minecraft",
  "roblox",
]);

const SEQUENCES = [
  "abcdefghijklmnopqrstuvwxyz",
  "qwertyuiopasdfghjklzxcvbnm",
  "01234567890",
];

export type StrengthIssue =
  "common" | "short" | "sequence" | "repeats" | "one-class";

export type Strength = {
  guesses: number;
  seconds: number;
  issues: StrengthIssue[];
  passphrase: boolean;
};

function leet(value: string) {
  return value
    .replace(/0/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/3/g, "e")
    .replace(/[4@]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/7/g, "t");
}

function hasSequence(value: string) {
  const lower = value.toLowerCase();
  for (const run of SEQUENCES) {
    for (let i = 0; i + 3 <= run.length; i++) {
      const part = run.slice(i, i + 3);
      if (lower.includes(part) || lower.includes([...part].reverse().join("")))
        return true;
    }
  }
  return false;
}

// A teaching estimate, not a security guarantee: it explains why length and
// unpredictability beat clever substitutions.
export function estimateStrength(password: string): Strength {
  const issues: StrengthIssue[] = [];
  if (!password)
    return { guesses: 1, seconds: 0, issues: ["short"], passphrase: false };

  const lower = password.toLowerCase();
  const plain = leet(lower).replace(/[^a-z]/g, "");
  if (
    COMMON.has(lower) ||
    COMMON.has(leet(lower)) ||
    COMMON.has(lower.replace(/\d+$/, "")) ||
    COMMON.has(plain)
  ) {
    return {
      guesses: 1000,
      seconds: 1000 / GUESSES_PER_SECOND,
      issues: ["common"],
      passphrase: false,
    };
  }

  const words = password
    .split(/[\s\-_.]+/)
    .filter((word) => /^\p{L}{3,}$/u.test(word));
  const separated = password.split(/[\s\-_.]+/).filter(Boolean);
  const passphrase =
    words.length >= 3 &&
    words.length === separated.length &&
    new Set(words.map((word) => word.toLowerCase())).size === words.length &&
    !words.some((word) => COMMON.has(word.toLowerCase()));

  let guesses: number;
  if (passphrase) {
    guesses = Math.pow(WORD_LIST, words.length) / 2;
  } else {
    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/\d/.test(password)) pool += 10;
    if (/[^A-Za-z\d]/.test(password)) pool += 33;
    const distinct = new Set(lower).size;
    // Repeated characters add almost nothing.
    let length = distinct + (password.length - distinct) * 0.25;
    if (distinct <= password.length / 2) issues.push("repeats");
    if (hasSequence(password)) {
      length = Math.max(1, length - 3);
      issues.push("sequence");
    }
    if (password.length < 8) issues.push("short");
    if (pool <= 26 && password.length < 12) issues.push("one-class");
    guesses = Math.pow(Math.max(pool, 2), length) / 2;
  }
  guesses = Math.max(1, guesses);
  return {
    guesses,
    seconds: guesses / GUESSES_PER_SECOND,
    issues,
    passphrase,
  };
}

export type Duration = {
  unit:
    | "instant"
    | "seconds"
    | "minutes"
    | "hours"
    | "days"
    | "years"
    | "millennia";
  value: number;
};

export function humanize(seconds: number): Duration {
  if (seconds < 1) return { unit: "instant", value: 0 };
  if (seconds < 60) return { unit: "seconds", value: Math.floor(seconds) };
  if (seconds < 3600)
    return { unit: "minutes", value: Math.floor(seconds / 60) };
  if (seconds < 86400)
    return { unit: "hours", value: Math.floor(seconds / 3600) };
  if (seconds < 86400 * 365)
    return { unit: "days", value: Math.floor(seconds / 86400) };
  const years = seconds / (86400 * 365);
  if (years < 1000) return { unit: "years", value: Math.floor(years) };
  return { unit: "millennia", value: Math.floor(years / 1000) };
}

export function caesar(text: string, shift: number) {
  const k = ((shift % 26) + 26) % 26;
  return text.replace(/[a-z]/gi, (char) => {
    const base = char <= "Z" ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + k) % 26) + base);
  });
}

export function base64Encode(text: string) {
  return btoa(text);
}

export function base64Decode(text: string): string | null {
  const clean = text.trim();
  if (!clean || clean.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(clean))
    return null;
  try {
    const decoded = atob(clean);
    // Mission payloads are plain ASCII; anything else is not a readable message.
    return /^[\x20-\x7e]*$/.test(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

export function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export type Progress = Record<string, true>;

// Browser storage is untrusted: keep only known mission ids stored as `true`.
export function restoreProgress(
  raw: unknown,
  ids: readonly string[],
): Progress {
  const result: Progress = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return result;
  for (const id of ids) {
    if (
      Object.prototype.hasOwnProperty.call(raw, id) &&
      (raw as Record<string, unknown>)[id] === true
    )
      result[id] = true;
  }
  return result;
}
