import "server-only";
import { cache } from "react";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "../db";
import { hashToken } from "./account";

const SESSION_COOKIE = "cv_ctf";
const COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
// Players come back over a multi-day competition; a blocked account or a
// password change still ends every session at once.
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function createPlayerSession(playerId: string) {
  const db = getDb();
  if (!db) throw new Error("Database is not configured");
  const now = new Date();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  await db.$transaction([
    db.ctfSession.deleteMany({ where: { playerId, expiresAt: { lte: now } } }),
    db.ctfSession.create({
      data: { playerId, tokenHash: hashToken(token), expiresAt },
    }),
    db.ctfPlayer.update({
      where: { id: playerId },
      data: { lastLoginAt: now },
    }),
  ]);
  (await cookies()).set(SESSION_COOKIE, token, {
    ...COOKIE,
    expires: expiresAt,
  });
}

const tokenOf = async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  return token.length > 0 && token.length <= 100 ? token : null;
};

/** The signed-in player, or null; a blocked account counts as signed out. */
export const getPlayerSession = cache(async () => {
  const db = getDb();
  const token = await tokenOf();
  if (!db || !token) return null;
  return db.ctfSession.findFirst({
    where: {
      tokenHash: hashToken(token),
      expiresAt: { gt: new Date() },
      player: { active: true },
    },
    include: { player: { omit: { passwordHash: true } } },
  });
});

export async function requirePlayer(next = "/challenges") {
  const session = await getPlayerSession();
  if (!session) redirect(`/challenges/login?next=${encodeURIComponent(next)}`);
  return session.player;
}

export async function destroyPlayerSession() {
  const token = await tokenOf();
  if (token)
    await getDb()
      ?.ctfSession.deleteMany({ where: { tokenHash: hashToken(token) } })
      .catch(() => undefined);
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/" });
}
