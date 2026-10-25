import "server-only";
import { cache } from "react";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getDb } from "./db";
import { isStaffPath, roleOf } from "./staff";

export {
  homeOf,
  isStaffPath,
  roleOf,
  STAFF_ROLES,
  type StaffRole,
} from "./staff";

export { hashPassword, verifyPassword } from "./password";

const SESSION_COOKIE = "cv_session";
// Sessions used to be scoped to /admin; the teacher panel needs the whole
// site. A response carries one instruction per cookie name, so an old
// /admin-scoped copy is not deleted here: it stops working when its session
// row is deleted and expires within SESSION_TTL_MS.
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
    path: "/",
    expires: expiresAt,
  });
}

export const getSession = cache(async () => {
  const db = getDb();
  if (!db) return null;
  // A browser may still hold the old /admin cookie next to the new one.
  const tokens = (await cookies()).getAll(SESSION_COOKIE).map((c) => c.value);
  if (!tokens.length) return null;
  const session = await db.session.findFirst({
    where: {
      tokenHash: { in: tokens.map(hashToken) },
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
  // A switched-off staff account loses access on its next request.
  if (!session?.user.active) return null;
  return session;
});

export async function requireAdmin(nextPath?: string) {
  const session = await getSession();
  if (!session) {
    const safeNext = nextPath && isStaffPath(nextPath) ? nextPath : undefined;
    redirect(
      safeNext
        ? `/admin/login?next=${encodeURIComponent(safeNext)}`
        : "/admin/login",
    );
  }
  return session;
}

/** Re-issues the signed-in session's cookie for the whole site (/teacher too). */
export async function moveSessionCookie() {
  const session = await getSession();
  if (!session) return null;
  const cookieStore = await cookies();
  const token = cookieStore
    .getAll(SESSION_COOKIE)
    .map((c) => c.value)
    .find((value) => hashToken(value) === session.tokenHash);
  if (!token) return null;
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });
  return session;
}

export async function destroySession() {
  const db = getDb();
  const cookieStore = await cookies();
  const tokens = cookieStore.getAll(SESSION_COOKIE).map((c) => c.value);
  if (db && tokens.length)
    await db.session.deleteMany({
      where: { tokenHash: { in: tokens.map(hashToken) } },
    });
  cookieStore.delete({ name: SESSION_COOKIE, path: "/" });
}

export type StaffSession = NonNullable<Awaited<ReturnType<typeof getSession>>>;

/**
 * Who may see what: `owner` is true for owners and admins, who see every
 * group; teachers only see theirs.
 */
export type Scope = { owner: boolean; groups: string[] };

export function scopeOf(session: StaffSession): Scope {
  return roleOf(session.user) === "teacher"
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

/**
 * groupWhere narrowed to one group picked in the URL. A group outside the
 * teacher's scope matches nobody instead of replacing the scope.
 */
export function pickedGroupWhere(scope: Scope, group: string) {
  if (!group) return groupWhere(scope);
  return canSeeGroup(scope, group) ? { group } : { group: { in: [] } };
}

/** For pages and actions only owners and admins may use; teachers get a 404. */
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
