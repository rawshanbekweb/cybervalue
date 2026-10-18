import "server-only";
import { cache } from "react";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
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
  // A switched-off staff account loses access on its next request.
  if (!session?.user.active) return null;
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

export type StaffSession = NonNullable<Awaited<ReturnType<typeof getSession>>>;

/** Who may see what: owners see everything, teachers only their groups. */
export type Scope = { owner: boolean; groups: string[] };

export function scopeOf(session: StaffSession): Scope {
  return session.user.role === "teacher"
    ? { owner: false, groups: session.user.groups }
    : { owner: true, groups: [] };
}

/** A Prisma `where` part limiting rows with a `group` field to the scope. */
export function groupWhere(scope: Scope) {
  return scope.owner ? {} : { group: { in: scope.groups } };
}

export function canSeeGroup(scope: Scope, group: string) {
  return scope.owner || scope.groups.includes(group);
}

/** For pages and actions only owners may use; teachers get a 404. */
export async function requireOwner(nextPath?: string) {
  const session = await requireAdmin(nextPath);
  if (!scopeOf(session).owner) notFound();
  return session;
}

/** requireAdmin plus the session's scope, for pages that list people. */
export async function requireStaff(nextPath?: string) {
  const session = await requireAdmin(nextPath);
  return { session, scope: scopeOf(session) };
}
