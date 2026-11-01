// Rules for CTF Challenges player accounts. Pure functions only, so the unit
// tests cover them without a database.
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 200;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 24;

/** Lower-cased and trimmed, so one address cannot sign up twice. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email());

// Shown on scoreboards: Latin letters, digits, dot, dash and underscore, so
// look-alike Unicode names cannot impersonate another player.
export const usernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN)
  .max(USERNAME_MAX)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/);

/** Usernames are unique regardless of case: "Ali" and "ali" are one name. */
export const usernameKey = (username: string) => username.trim().toLowerCase();

export type PasswordProblem = "length" | "personal" | "common" | null;

// The most guessed passwords and the patterns players reach for first.
const COMMON = [
  "password",
  "parol",
  "qwerty",
  "123456",
  "12345678",
  "1234567890",
  "11111111",
  "00000000",
  "iloveyou",
  "admin",
  "letmein",
  "welcome",
  "cybervalue",
  "uzbekistan",
];

export function passwordProblem(
  password: string,
  email: string,
  username: string,
): PasswordProblem {
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX)
    return "length";
  const lower = password.toLowerCase();
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  if (
    (username.length >= USERNAME_MIN &&
      lower.includes(username.toLowerCase())) ||
    (local.length >= USERNAME_MIN && lower.includes(local))
  )
    return "personal";
  // A single repeated character, or a common word with a few digits around it.
  const core = lower.replace(/[^a-z0-9]/g, "").replace(/\d+$/, "");
  if (new Set(lower).size <= 2 || COMMON.some((word) => core === word))
    return "common";
  return null;
}

/** Why a password was refused, as a message the form can translate. */
export function passwordMessage(problem: Exclude<PasswordProblem, null>) {
  if (problem === "length") return "Use a password of 10 to 200 characters.";
  if (problem === "personal")
    return "The password must not contain your username or email.";
  return "This password is too easy to guess. Choose another one.";
}

// One-time links: 32 random bytes; only a SHA-256 digest is stored.
export const newLinkToken = () => randomBytes(32).toString("base64url");
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const isLinkToken = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);

export const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
export const RESET_TTL_MS = 60 * 60 * 1000;

/** Where to send a player after sign-in: only paths inside the CTF area. */
export function isChallengesNext(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\/challenges(?:\/[A-Za-z0-9/_-]*)?(?:\?[A-Za-z0-9=&_-]*)?$/.test(value) &&
    !value.includes("//")
  );
}

// Teams --------------------------------------------------------------------

export const TEAM_MAX_MEMBERS = 10;

// Shown on scoreboards: Latin letters, digits, spaces and . _ - (no look-alike
// Unicode), 2–32 characters, starting with a letter or digit.
export const teamNameSchema = z
  .string()
  .trim()
  .transform((name) => name.replace(/\s+/g, " "))
  .pipe(
    z
      .string()
      .min(2)
      .max(32)
      .regex(/^[A-Za-z0-9][A-Za-z0-9 ._-]*$/),
  );

/** Team names are unique regardless of case and spacing. */
export const teamNameKey = (name: string) =>
  name.trim().replace(/\s+/g, " ").toLowerCase();

// Invite codes: 10 Crockford base32 symbols (50 bits), shown as XXXXX-XXXXX.
// Joining is rate-limited, so guessing a code is hopeless.
const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export function newInviteCode() {
  const raw = [...randomBytes(10)].map((b) => CODE_ALPHABET[b & 31]).join("");
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
}
export function normalizeInviteCode(input: string) {
  const raw = input
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
  if (raw.length !== 10 || ![...raw].every((c) => CODE_ALPHABET.includes(c)))
    return null;
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
}
