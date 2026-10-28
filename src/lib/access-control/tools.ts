// Academy Intermediate · Access control: the pretend services the lessons
// use. An orders API that may or may not check who owns an order, a JWT
// issuer and checker with a simplified signature, and a sign-in whose
// second factor is weighed against common attacks. Nothing leaves the page.
import type { Text } from "../network/ip";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- Orders and IDOR --------------------------------------------------------

export type Order = { id: number; owner: string; item: Text; total: number };

/** The signed-in student is always "ali". */
export const ME = "ali";

export const ORDERS: Order[] = [
  {
    id: 1041,
    owner: "ali",
    item: t("Kitob: Python", "Book: Python"),
    total: 89000,
  },
  {
    id: 1042,
    owner: "vali",
    item: t("Quloqchin", "Headphones"),
    total: 245000,
  },
  { id: 1043, owner: "ali", item: t("Daftar", "Notebook"), total: 12000 },
  { id: 1044, owner: "dilnoza", item: t("Planshet", "Tablet"), total: 2150000 },
];

export type OrderReply = {
  status: 200 | 401 | 404;
  order: Order | null;
  /** True when the reply shows another person's order. */
  leak: boolean;
};

/**
 * GET /api/orders/{id}. Every version checks that someone is signed in;
 * with `checkOwner` it also checks the order is theirs, and answers 404 for
 * another person's order so the reply does not tell that it exists.
 */
export function getOrder(
  id: number,
  user: string | null,
  checkOwner: boolean,
): OrderReply {
  if (!user) return { status: 401, order: null, leak: false };
  const order = ORDERS.find((o) => o.id === id) ?? null;
  if (!order || (checkOwner && order.owner !== user))
    return { status: 404, order: null, leak: false };
  return { status: 200, order, leak: order.owner !== user };
}

// --- JSON Web Tokens --------------------------------------------------------

export type JwtHeader = { alg: "HS256" | "none"; typ: "JWT" };
export type JwtPayload = { sub: string; role: string; exp: number };

/** The server's secret. Real secrets are long and random. */
const SECRET = "cybervalue-demo-secret";

export function b64url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function unb64url(part: string) {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return new TextDecoder().decode(
    Uint8Array.from(binary, (c) => c.charCodeAt(0)),
  );
}

/**
 * A simplified stand-in for HMAC-SHA256: a keyed FNV-1a mix, enough to show
 * that changing one character of the token changes the signature and that
 * nobody without the secret can make a matching one.
 */
export function sign(data: string, secret = SECRET) {
  let out = "";
  for (let round = 0; round < 4; round++) {
    let h = 0x811c9dc5 ^ round;
    for (const ch of `${secret}.${round}.${data}`) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    out += h.toString(16).padStart(8, "0");
  }
  return b64url(out).slice(0, 43);
}

export function makeToken(
  header: JwtHeader,
  payload: JwtPayload,
  signature?: string,
) {
  const body = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  return `${body}.${signature ?? (header.alg === "none" ? "" : sign(body))}`;
}

export type Decoded = {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  body: string;
};

export function decode(token: string): Decoded | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return {
      header: JSON.parse(unb64url(parts[0])),
      payload: JSON.parse(unb64url(parts[1])),
      signature: parts[2],
      body: `${parts[0]}.${parts[1]}`,
    };
  } catch {
    return null;
  }
}

export type Checker = {
  /** Does the server check the signature at all? */
  verify: boolean;
  /** Does it take the algorithm from the token, "none" included? */
  allowNone: boolean;
};

export type Verdict = { accepted: boolean; why: Text };

/** How a server set up this way treats a token. */
export function check(token: string, server: Checker, now: number): Verdict {
  const d = decode(token);
  if (!d)
    return {
      accepted: false,
      why: t("Token o‘qilmadi.", "The token cannot be read."),
    };
  if (d.payload.exp <= now)
    return {
      accepted: false,
      why: t("Tokenning muddati o‘tgan.", "The token has expired."),
    };
  if (!server.verify)
    return {
      accepted: true,
      why: t(
        "Server imzoni umuman tekshirmaydi.",
        "The server does not check the signature at all.",
      ),
    };
  if (d.header.alg === "none")
    return server.allowNone
      ? {
          accepted: true,
          why: t(
            "Server tokendagi alg: none ga ishondi — imzosiz qabul qildi.",
            "The server trusted alg: none in the token and took it unsigned.",
          ),
        }
      : {
          accepted: false,
          why: t(
            "Server faqat HS256 ni qabul qiladi.",
            "The server accepts HS256 only.",
          ),
        };
  return d.signature === sign(d.body)
    ? { accepted: true, why: t("Imzo mos keldi.", "The signature matches.") }
    : {
        accepted: false,
        why: t(
          "Imzo mos kelmadi: token o‘zgartirilgan.",
          "The signature does not match: the token was changed.",
        ),
      };
}

/** The three tokens the lesson sends: the real one and two forgeries. */
export function attempts(role: string, now: number) {
  const exp = now + 3600;
  const real = makeToken(
    { alg: "HS256", typ: "JWT" },
    { sub: ME, role: "student", exp },
  );
  const edited = makeToken(
    { alg: "HS256", typ: "JWT" },
    { sub: ME, role, exp },
    decode(real)!.signature,
  );
  const unsigned = makeToken(
    { alg: "none", typ: "JWT" },
    { sub: ME, role, exp },
  );
  return [
    { id: "real", token: real },
    { id: "edited", token: edited },
    { id: "none", token: unsigned },
  ] as const;
}

/** The real token works and both forgeries are refused. */
export const checkerSafe = (server: Checker, now = 1_800_000_000) => {
  const [real, edited, unsigned] = attempts("admin", now);
  return (
    check(real.token, server, now).accepted &&
    !check(edited.token, server, now).accepted &&
    !check(unsigned.token, server, now).accepted
  );
};

// --- Second factors ---------------------------------------------------------

export const FACTORS = ["password", "sms", "totp", "key"] as const;
export type Factor = (typeof FACTORS)[number];

export const FACTOR_LABEL: Record<Factor, Text> = {
  password: t("Faqat parol", "Password only"),
  sms: t("Parol + SMS kod", "Password + SMS code"),
  totp: t("Parol + ilovadagi kod (TOTP)", "Password + app code (TOTP)"),
  key: t(
    "Parol + xavfsizlik kaliti (passkey)",
    "Password + security key (passkey)",
  ),
};

export const ATTACKS = ["reuse", "guess", "simswap", "relay"] as const;
export type Attack = (typeof ATTACKS)[number];

export const ATTACK_LABEL: Record<Attack, Text> = {
  reuse: t(
    "Parol boshqa saytdan sizib chiqqan",
    "The password leaked from another site",
  ),
  guess: t(
    "Parolni ketma-ket taxmin qilish",
    "Guessing the password again and again",
  ),
  simswap: t(
    "SIM almashtirish: raqamingiz boshqa kartaga o‘tkazilgan",
    "SIM swap: your number moved to another card",
  ),
  relay: t(
    "Soxta kirish sahifasi kodni darhol haqiqiy saytga uzatadi",
    "A fake sign-in page passes your code to the real site at once",
  ),
};

/** Which attacks each way of signing in stops. */
export function stops(factor: Factor, attack: Attack) {
  switch (factor) {
    case "password":
      return false;
    case "sms":
      return attack === "reuse" || attack === "guess";
    case "totp":
      return attack !== "relay";
    case "key":
      // The key signs for the site's real address, so a fake page gets
      // nothing it can pass on.
      return true;
  }
}
