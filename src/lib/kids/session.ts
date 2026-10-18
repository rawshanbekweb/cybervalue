import "server-only";
import { cache } from "react";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "../db";
import { hashSecret } from "../junior/codes";

const COOKIE = "cv_kids";
// Kids share classroom computers, so a sign-in lasts one day.
const TTL_MS = 24 * 60 * 60 * 1000;

export async function createKidsSession(memberId: string) {
  const db = getDb();
  if (!db) throw new Error("Database is not configured");
  const now = new Date();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + TTL_MS);
  await db.$transaction([
    db.kidsSession.deleteMany({
      where: { memberId, expiresAt: { lte: now } },
    }),
    db.kidsSession.create({
      data: { memberId, tokenHash: hashSecret(token), expiresAt },
    }),
    db.kidsMember.update({
      where: { id: memberId },
      data: { lastLoginAt: now },
    }),
  ]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/kids",
    expires: expiresAt,
  });
}

// A blocked member loses access on their next request.
export const getKidsMember = cache(async () => {
  const db = getDb();
  if (!db) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const now = new Date();
  const session = await db.kidsSession.findFirst({
    where: {
      tokenHash: hashSecret(token),
      expiresAt: { gt: now },
      member: { active: true },
    },
    include: { member: true },
  });
  return session?.member ?? null;
});

export async function destroyKidsSession() {
  const db = getDb();
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (db && token)
    await db.kidsSession.deleteMany({
      where: { tokenHash: hashSecret(token) },
    });
  store.delete({ name: COOKIE, path: "/kids" });
}
