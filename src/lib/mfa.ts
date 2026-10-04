import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";
import { env } from "./env";
import { hashRecoveryCode, openSecret, sealSecret, verifyTotp } from "./totp";

const CHALLENGE_COOKIE = "cv_mfa";
const CHALLENGE_TTL_MS = 5 * 60_000;
const MAX_ATTEMPTS = 5;

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const mfaAvailable = () => Boolean(env.AUTH_SECRET);

export function seal(secret: string) {
  if (!env.AUTH_SECRET) throw new Error("AUTH_SECRET is not configured");
  return sealSecret(secret, env.AUTH_SECRET);
}

export function unseal(sealed: string) {
  if (!env.AUTH_SECRET) throw new Error("AUTH_SECRET is not configured");
  return openSecret(sealed, env.AUTH_SECRET);
}

type FactorUser = {
  id: string;
  totpSecret: string | null;
  totpLastStep: number | null;
  recoveryCodes: string[];
};

// Accepts an authenticator code or an unused recovery code. Consumption is a
// conditional update, so two concurrent requests cannot both use one code.
export async function verifySecondFactor(user: FactorUser, input: string) {
  const db = getDb();
  if (!db || !user.totpSecret) return null;
  const code = input.trim();
  if (/^\d{3}\s?\d{3}$/.test(code)) {
    let secret: string;
    try {
      secret = unseal(user.totpSecret);
    } catch {
      return null;
    }
    const step = verifyTotp(secret, code, user.totpLastStep);
    if (step === null) return null;
    const { count } = await db.user.updateMany({
      where: {
        id: user.id,
        OR: [{ totpLastStep: null }, { totpLastStep: { lt: step } }],
      },
      data: { totpLastStep: step },
    });
    return count === 1 ? "totp" : null;
  }
  const hash = hashRecoveryCode(code);
  if (!user.recoveryCodes.includes(hash)) return null;
  const { count } = await db.user.updateMany({
    where: { id: user.id, recoveryCodes: { has: hash } },
    data: { recoveryCodes: user.recoveryCodes.filter((c) => c !== hash) },
  });
  return count === 1 ? "recovery" : null;
}

export async function startChallenge(userId: string) {
  const db = getDb();
  if (!db) throw new Error("Database is not configured");
  const now = new Date();
  await db.loginChallenge.deleteMany({
    where: { OR: [{ userId }, { expiresAt: { lte: now } }] },
  });
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + CHALLENGE_TTL_MS);
  await db.loginChallenge.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });
  (await cookies()).set(CHALLENGE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin/login",
    expires: expiresAt,
  });
}

// Counts the attempt before the caller verifies, so a challenge allows at most
// MAX_ATTEMPTS guesses even under concurrent submissions.
export async function claimChallengeAttempt() {
  const db = getDb();
  const token = (await cookies()).get(CHALLENGE_COOKIE)?.value;
  if (!db || !token) return null;
  const tokenHash = hashToken(token);
  const { count } = await db.loginChallenge.updateMany({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
      attempts: { lt: MAX_ATTEMPTS },
    },
    data: { attempts: { increment: 1 } },
  });
  if (count !== 1) return null;
  return db.loginChallenge.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
}

export async function hasPendingChallenge() {
  const db = getDb();
  const token = (await cookies()).get(CHALLENGE_COOKIE)?.value;
  if (!db || !token) return false;
  return Boolean(
    await db.loginChallenge.findFirst({
      where: { tokenHash: hashToken(token), expiresAt: { gt: new Date() } },
      select: { id: true },
    }),
  );
}

export async function endChallenge() {
  const db = getDb();
  const jar = await cookies();
  const token = jar.get(CHALLENGE_COOKIE)?.value;
  if (db && token)
    await db.loginChallenge.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  jar.delete({ name: CHALLENGE_COOKIE, path: "/admin/login" });
}
