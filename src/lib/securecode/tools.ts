// Academy Intermediate · Secure coding: a denylist filter next to an
// allowlist for the same field, run on five inputs, and an Express-style
// handler with five mistakes to match to their fixes. Simplified, but the
// mistakes and fixes are the ones code review catches most often.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- Allowlist and denylist ------------------------------------------------------------

export const INPUTS = [
  "Ali",
  "O'Brien",
  "<script>alert(1)</script>",
  "<ScRiPt>alert(1)</ScRiPt>",
  "<img src=x onerror=alert(1)>",
] as const;

/** What the old code did: refuse one exact string. */
export const denylist = (s: string) => !s.includes("<script>");

/** What it should do: accept only what a name looks like. */
export const ALLOW = /^[\p{L}' -]{1,40}$/u;
export const allowlist = (s: string) => ALLOW.test(s);

/** Inputs an attacker gets past the denylist. */
export const BYPASSES = INPUTS.filter((s) => denylist(s) && !allowlist(s));

export const bypassRight = (picked: Iterable<string>) => {
  const set = new Set(picked);
  return set.size === BYPASSES.length && BYPASSES.every((s) => set.has(s));
};

// --- Fix the handler -------------------------------------------------------------------

export const FIXES = ["param", "generic", "env", "nolog", "schema"] as const;
export type Fix = (typeof FIXES)[number];

export const FIX_NAMES: Record<Fix, Text> = {
  param: t("Parametrli so‘rov", "A parameterised query"),
  generic: t(
    "Foydalanuvchiga umumiy xabar, tafsilot logga",
    "A generic message for the user, details to the log",
  ),
  env: t(
    "Kalitni muhit o‘zgaruvchisi yoki sirlar omboridan o‘qish",
    "Read the key from an environment variable or secret store",
  ),
  nolog: t("Parolni hech qachon logga yozmaslik", "Never log the password"),
  schema: t(
    "Sxema bilan tekshirish (faqat ruxsat etilgan maydonlar)",
    "Validate against a schema (allowed fields only)",
  ),
};

export type Line = { no: number; code: string; fix: Fix };

export const LINES: Line[] = [
  { no: 3, code: 'const PAYMENT_KEY = "live_9f8a…";', fix: "env" },
  {
    no: 8,
    code: 'const rows = await db.query("SELECT * FROM users WHERE id = " + req.params.id);',
    fix: "param",
  },
  {
    no: 12,
    code: 'logger.info("login", { email: req.body.email, password: req.body.password });',
    fix: "nolog",
  },
  {
    no: 15,
    code: "await db.users.update(req.user.id, req.body);",
    fix: "schema",
  },
  { no: 19, code: "res.status(500).send(err.stack);", fix: "generic" },
];

export type Calls = Partial<Record<number, Fix>>;

export const fixRight = (calls: Calls) =>
  LINES.every((l) => calls[l.no] === l.fix);
