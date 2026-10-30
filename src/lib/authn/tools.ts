// Academy Intermediate · Authentication: a modern password policy (length,
// a blocklist of known-bad passwords, not the username) checked on six
// candidates. The rules follow current guidance such as NIST SP 800-63B.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export const MIN_LENGTH = 12;

/** A tiny stand-in for a breached-password list. */
export const BLOCKLIST = ["password123456", "qwertyuiop123", "tashkent2024!"];

export type Verdict = "ok" | "short" | "blocked" | "username";

export function check(password: string, username: string): Verdict {
  const p = password.toLowerCase();
  if ([...password].length < MIN_LENGTH) return "short";
  if (BLOCKLIST.includes(p)) return "blocked";
  if (username && p.includes(username.toLowerCase())) return "username";
  return "ok";
}

export const VERDICT_TEXT: Record<Verdict, Text> = {
  ok: t("Qabul qilinadi", "Accepted"),
  short: t("Juda qisqa", "Too short"),
  blocked: t("Sizib chiqqanlar ro‘yxatida", "On the breached list"),
  username: t("Foydalanuvchi nomini o‘z ichiga oladi", "Contains the username"),
};

export const USERNAME = "dilnoza";

export const CANDIDATES = [
  "Tashkent2024!",
  "olma-tog‘-daryo-osmon",
  "P@ssw0rd",
  "dilnoza_secure_99",
  "correct horse battery staple",
  "Qw3rty!",
] as const;

export type Calls = Partial<Record<string, boolean>>;

/** true = the student accepts the password. */
export const policyRight = (calls: Calls) =>
  CANDIDATES.every((p) => calls[p] === (check(p, USERNAME) === "ok"));
