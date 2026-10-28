// Academy Intermediate · Hashes and passwords: a user table stored with and
// without salt against a precomputed table, the cost of a slow password hash
// against a GPU, and a webhook signed with a plain hash or with HMAC. The
// hashes are real SHA-256 (../crypto-basics/tools.ts); the speeds are
// round figures for one modern graphics card.
import { bytesOf, hex, sha256, sha256Bytes } from "../crypto-basics/tools";
import type { Text } from "../network/ip";

export { sha256 };

const t = (uz: string, en: string): Text => ({ uz, en });

// --- Salt ---------------------------------------------------------------------

export type User = { name: string; password: string; salt: string };

export const USERS: User[] = [
  { name: "ali", password: "qwerty123", salt: "9f2c" },
  { name: "vali", password: "Bahor-2026!", salt: "41ab" },
  { name: "dilnoza", password: "qwerty123", salt: "c07e" },
  { name: "sardor", password: "parol", salt: "5d13" },
];

/** What the database keeps for a user. */
export const stored = (u: User, salted: boolean) =>
  salted ? sha256(u.salt + u.password) : sha256(u.password);

/** An attacker's table of common passwords and their plain SHA-256. */
export const COMMON = ["123456", "parol", "qwerty123", "admin", "salom123"];
export const RAINBOW = new Map(COMMON.map((p) => [sha256(p), p]));

/** What the leaked table gives away. */
export function leak(salted: boolean) {
  const rows = USERS.map((u) => {
    const hash = stored(u, salted);
    return { name: u.name, hash, cracked: RAINBOW.get(hash) ?? null };
  });
  // Users whose hash is also someone else's: they share a password.
  const shared = rows.filter(
    (r) => rows.filter((s) => s.hash === r.hash).length > 1,
  ).length;
  return { rows, shared, cracked: rows.filter((r) => r.cracked).length };
}

// --- Cost ---------------------------------------------------------------------

/** Every 8-character password of lowercase letters and digits. */
export const SPACE = 36 ** 8;
/** Guesses a second on one graphics card. */
export const SHA_SPEED = 10_000_000_000;
const BCRYPT_SPEED_AT_5 = 184_000;
/** The server's time for one bcrypt hash at cost 10, in milliseconds. */
const LOGIN_MS_AT_10 = 80;

export const COSTS = [4, 6, 8, 10, 12, 14, 16] as const;
export type Choice = { algo: "sha256" } | { algo: "bcrypt"; cost: number };

const YEAR = 365 * 24 * 3600;

export function costOutcome(choice: Choice) {
  const speed =
    choice.algo === "sha256"
      ? SHA_SPEED
      : BCRYPT_SPEED_AT_5 / 2 ** (choice.cost - 5);
  const loginMs =
    choice.algo === "sha256" ? 0.001 : LOGIN_MS_AT_10 * 2 ** (choice.cost - 10);
  const seconds = SPACE / speed;
  return { speed, seconds, years: seconds / YEAR, loginMs };
}

/** Searching every password takes over a year; signing in under a second. */
export const costRight = (choice: Choice) => {
  const o = costOutcome(choice);
  return o.years >= 1 && o.loginMs <= 1000;
};

/** A duration in the largest unit that fits. */
export function duration(seconds: number): { n: number; unit: Text } {
  const units: [number, Text][] = [
    [YEAR, t("yil", "years")],
    [86400, t("kun", "days")],
    [3600, t("soat", "hours")],
    [60, t("daqiqa", "minutes")],
    [1, t("soniya", "seconds")],
  ];
  for (const [size, unit] of units)
    if (seconds >= size)
      return { n: Math.round((seconds / size) * 10) / 10, unit };
  return { n: Math.round(seconds * 1000) / 1000, unit: t("soniya", "seconds") };
}

// --- HMAC ---------------------------------------------------------------------

/** HMAC-SHA256 (RFC 2104) over UTF-8 text. */
export function hmac(key: string, message: string) {
  let k = bytesOf(key);
  if (k.length > 64) k = sha256Bytes(k);
  while (k.length < 64) k.push(0);
  const inner = sha256Bytes([...k.map((b) => b ^ 0x36), ...bytesOf(message)]);
  return hex(sha256Bytes([...k.map((b) => b ^ 0x5c), ...inner]));
}

/** The shop's secret, shared with the payment service. */
export const WEBHOOK_KEY = "whsec_7f3a91c2";
export const WEBHOOK = '{"order":1043,"paid":12000}';
export const FORGED = '{"order":1043,"paid":1200000}';

/**
 * The payment service tells the shop an order was paid and adds a
 * signature. An attacker changes the amount and makes a new signature with
 * what it can compute: a plain hash anyone can redo, but not an HMAC.
 */
export function webhook(useHmac: boolean) {
  const sign = (body: string) =>
    useHmac ? hmac(WEBHOOK_KEY, body) : sha256(body);
  const genuine = { body: WEBHOOK, signature: sign(WEBHOOK) };
  const attackerSig = useHmac ? hmac("guess", FORGED) : sha256(FORGED);
  const forged = { body: FORGED, signature: attackerSig };
  const accepts = (m: { body: string; signature: string }) =>
    sign(m.body) === m.signature;
  return {
    genuine: { ...genuine, accepted: accepts(genuine) },
    forged: { ...forged, accepted: accepts(forged) },
  };
}
