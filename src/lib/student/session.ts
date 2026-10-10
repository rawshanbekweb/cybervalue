import "server-only";
import { cache } from "react";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "../db";
import { hashSecret } from "./access";

const SESSION_COOKIE = "cv_student";
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
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/student",
    expires: expiresAt,
  });
}

// A deactivated or expired account loses access on its next request, even
// with a session that has not timed out yet.
export const getStudentSession = cache(async () => {
  const db = getDb();
  if (!db) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const now = new Date();
  const session = await db.studentSession.findFirst({
    where: {
      tokenHash: hashSecret(token),
      expiresAt: { gt: now },
      student: {
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    },
    include: { student: true },
  });
  return session;
});

export async function requireStudent() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");
  return session.student;
}

export async function destroyStudentSession() {
  const db = getDb();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (db && token)
    await db.studentSession.deleteMany({
      where: { tokenHash: hashSecret(token) },
    });
  cookieStore.delete({ name: SESSION_COOKIE, path: "/student" });
}
