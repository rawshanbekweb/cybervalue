import "server-only";
import { cache } from "react";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";

export { hashPassword, verifyPassword } from "./password";

const SESSION_COOKIE = "cv_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const db = getDb();
  if (!db) throw new Error("Database is not configured");
  const now = new Date();
  await db.session.deleteMany({ where: { userId, expiresAt: { lte: now } } });
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  await db.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: expiresAt,
  });
}

export const getSession = cache(async () => {
  const db = getDb();
  if (!db) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findFirst({
    where: { tokenHash: hashToken(token), expiresAt: { gt: new Date() } },
    include: { user: true },
  });
  return session;
});

export async function requireAdmin(nextPath?: string) {
  const session = await getSession();
  if (!session) {
    const safeNext =
      nextPath && nextPath.startsWith("/admin") ? nextPath : undefined;
    redirect(
      safeNext
        ? `/admin/login?next=${encodeURIComponent(safeNext)}`
        : "/admin/login",
    );
  }
  return session;
}

export async function destroySession() {
  const db = getDb();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (db && token)
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(SESSION_COOKIE);
}
