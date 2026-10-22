import "server-only";
import { cache } from "react";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "../db";
import { hashSecret } from "./access";

const SESSION_COOKIE = "cv_student";
// Scoped to the whole site so /intermediate knows the student too. The cookie
// used to be scoped to /student; a browser may still send that old copy (see
// moveStudentCookie).
const COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
// Short enough that a shared classroom computer does not stay signed in for days.
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export async function createStudentSession(studentId: string) {
  const db = getDb();
  if (!db) throw new Error("Database is not configured");
  const now = new Date();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  await db.$transaction([
    db.studentSession.deleteMany({
      where: { studentId, expiresAt: { lte: now } },
    }),
    db.studentSession.create({
      data: { studentId, tokenHash: hashSecret(token), expiresAt },
    }),
    db.student.update({
      where: { id: studentId },
      data: { lastLoginAt: now },
    }),
  ]);
  (await cookies()).set(SESSION_COOKIE, token, {
    ...COOKIE,
    expires: expiresAt,
  });
}

const tokensOf = async () =>
  (await cookies())
    .getAll(SESSION_COOKIE)
    .map((c) => c.value)
    .filter((token) => token.length <= 100);

// A deactivated or expired account loses access on its next request, even
// with a session that has not timed out yet.
export const getStudentSession = cache(async () => {
  const db = getDb();
  if (!db) return null;
  const tokens = await tokensOf();
  if (!tokens.length) return null;
  const now = new Date();
  const session = await db.studentSession.findFirst({
    where: {
      tokenHash: { in: tokens.map(hashSecret) },
      expiresAt: { gt: now },
      student: {
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    },
    // The portrait is large and only the portal home draws it.
    include: { student: { omit: { portrait: true } } },
  });
  return session;
});

export async function requireStudent() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");
  return session.student;
}

/**
 * Re-issues the signed-in student's cookie for the whole site. Only a Route
 * Handler or Server Action can set it, so pages outside /student send an old
 * /student-scoped session through /student/continue.
 */
export async function moveStudentCookie() {
  const session = await getStudentSession();
  if (!session) return null;
  const token = (await tokensOf()).find(
    (value) => hashSecret(value) === session.tokenHash,
  );
  if (!token) return null;
  (await cookies()).set(SESSION_COOKIE, token, {
    ...COOKIE,
    expires: session.expiresAt,
  });
  return session;
}

// One instruction per cookie name fits in a response, so an old
// /student-scoped copy is left to expire; its session row is deleted here.
export async function destroyStudentSession() {
  const db = getDb();
  const tokens = await tokensOf();
  if (db && tokens.length)
    await db.studentSession.deleteMany({
      where: { tokenHash: { in: tokens.map(hashSecret) } },
    });
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/" });
}
