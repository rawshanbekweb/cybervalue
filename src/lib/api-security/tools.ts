// Academy Intermediate · API security: the pretend API the lessons use. A
// profile endpoint whose fields can be trimmed, a profile update that may
// copy every field it is sent, a request schema, and a sign-in endpoint
// under a rate limit. Everything answers in the page.
import type { Text } from "../network/ip";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- Over-sharing responses -------------------------------------------------

export const PROFILE = {
  id: 7,
  name: "Dilnoza",
  avatar: "/a/7.png",
  email: "dilnoza@example.uz",
  phone: "+998 90 123 45 67",
  passwordHash: "$argon2id$v=19$m=65536…",
  isAdmin: false,
} as const;

export type Field = keyof typeof PROFILE;
export const FIELDS = Object.keys(PROFILE) as Field[];

/** What the public profile card needs: a link, a name and a picture. */
export const NEEDED: readonly Field[] = ["id", "name", "avatar"];

export const FIELD_RISK: Partial<Record<Field, Text>> = {
  email: t("Email — spam va fishing uchun", "Email — for spam and phishing"),
  phone: t(
    "Telefon — SIM almashtirish va qo‘ng‘iroqlar uchun",
    "Phone — for SIM swaps and calls",
  ),
  passwordHash: t(
    "Parol xeshi — oflayn taxmin qilish uchun",
    "Password hash — for offline guessing",
  ),
  isAdmin: t(
    "Admin belgisi — kimni nishonga olishni aytadi",
    "Admin flag — tells who to target",
  ),
};

/** The response the endpoint sends with these fields chosen. */
export const respond = (chosen: readonly Field[]) =>
  Object.fromEntries(
    FIELDS.filter((f) => chosen.includes(f)).map((f) => [f, PROFILE[f]]),
  );

export const responseRight = (chosen: readonly Field[]) =>
  chosen.length === NEEDED.length && NEEDED.every((f) => chosen.includes(f));

// --- Mass assignment --------------------------------------------------------

export type Account = {
  name: string;
  bio: string;
  role: string;
  balance: number;
};

export const ACCOUNT: Account = {
  name: "Ali",
  bio: "",
  role: "student",
  balance: 0,
};

/** The fields a user may change on their own profile. */
export const EDITABLE = ["name", "bio"] as const;

export type PatchResult =
  | { ok: false; error: Text }
  | { ok: true; account: Account; ignored: string[]; escalated: boolean };

/**
 * PATCH /api/me with a JSON body. Without the allowlist the server copies
 * every field it is sent onto the account (Object.assign); with it, only
 * the editable ones, and reports the rest as ignored.
 */
export function patchMe(body: string, allowlist: boolean): PatchResult {
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    return {
      ok: false,
      error: t("JSON o‘qilmadi.", "The JSON cannot be read."),
    };
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    return {
      ok: false,
      error: t(
        "Tana JSON obyekt bo‘lishi kerak.",
        "The body must be a JSON object.",
      ),
    };
  const account: Account = { ...ACCOUNT };
  const ignored: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (
      !(key in ACCOUNT) ||
      (allowlist && !(EDITABLE as readonly string[]).includes(key))
    ) {
      ignored.push(key);
      continue;
    }
    if (typeof value !== typeof ACCOUNT[key as keyof Account]) {
      ignored.push(key);
      continue;
    }
    (account as Record<string, unknown>)[key] = value;
  }
  const escalated =
    account.role !== ACCOUNT.role || account.balance !== ACCOUNT.balance;
  return { ok: true, account, ignored, escalated };
}

/** The body sends a field the user must not set. */
export const triesProtected = (body: string) => {
  try {
    const data = JSON.parse(body);
    return (
      !!data &&
      typeof data === "object" &&
      Object.keys(data).some(
        (k) => k in ACCOUNT && !(EDITABLE as readonly string[]).includes(k),
      )
    );
  } catch {
    return false;
  }
};

// --- Schemas ----------------------------------------------------------------

/**
 * The order schema: quantity is a whole number from 1 to 10, coupon an
 * optional string of up to 20 characters, and nothing else is accepted.
 */
export function validateOrder(data: unknown): Text[] {
  if (!data || typeof data !== "object" || Array.isArray(data))
    return [t("Obyekt kutilgan.", "An object is expected.")];
  const errors: Text[] = [];
  const o = data as Record<string, unknown>;
  for (const key of Object.keys(o))
    if (key !== "quantity" && key !== "coupon")
      errors.push(
        t(
          `“${key}” maydoni ruxsat etilmagan.`,
          `The “${key}” field is not allowed.`,
        ),
      );
  const q = o.quantity;
  if (typeof q !== "number" || !Number.isInteger(q))
    errors.push(
      t(
        "quantity butun son bo‘lishi kerak.",
        "quantity must be a whole number.",
      ),
    );
  else if (q < 1 || q > 10)
    errors.push(t("quantity 1 dan 10 gacha.", "quantity is from 1 to 10."));
  if ("coupon" in o && (typeof o.coupon !== "string" || o.coupon.length > 20))
    errors.push(
      t(
        "coupon — 20 belgigacha matn.",
        "coupon is text of up to 20 characters.",
      ),
    );
  return errors;
}

// --- Rate limiting ----------------------------------------------------------

export const LIMITS = [null, 1, 5, 20, 100] as const;
export type Limit = (typeof LIMITS)[number];
export type LimitKey = "ip" | "account";

/** The attacker: 50 addresses, each able to send 60 guesses a minute. */
export const BOTS = 50;
const BOT_SPEED = 60;
/** Guesses needed to go through a list of likely passwords. */
export const GUESSES = 10_000;
/** A real user who mistypes twice sends three tries in a minute. */
export const USER_TRIES = 3;

/** Guesses per minute that reach one account, and what it means. */
export function limitOutcome(limit: Limit, key: LimitKey) {
  const perAddress = limit === null ? BOT_SPEED : Math.min(limit, BOT_SPEED);
  const perMinute =
    key === "ip" || limit === null ? perAddress * BOTS : perAddress;
  return {
    perMinute,
    hours: GUESSES / perMinute / 60,
    userBlocked: limit !== null && limit < USER_TRIES,
  };
}

/** The list takes at least a day and a real user is never blocked. */
export const limitRight = (limit: Limit, key: LimitKey) => {
  const o = limitOutcome(limit, key);
  return o.hours >= 24 && !o.userBlocked;
};
