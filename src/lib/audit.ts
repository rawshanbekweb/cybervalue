import "server-only";
import { headers } from "next/headers";
import { getDb } from "./db";
import { clientKey } from "./rate-limit";

export type AuditAction =
  | "login.success"
  | "login.failure"
  | "login.mfa_failure"
  | "login.recovery_code"
  | "logout"
  | "mfa.enable"
  | "mfa.disable"
  | "password.change"
  | "sessions.revoke"
  | "content.create"
  | "content.update"
  | "content.status"
  | "content.delete"
  | "file.upload"
  | "file.delete"
  | "assessment.create"
  | "student.create"
  | "student.update"
  | "student.code_reset"
  | "student.delete"
  | "material.create"
  | "material.update"
  | "material.delete"
  | "submission.review";

const RETENTION_MS = 180 * 86_400_000;

// Best effort: an audit write must never block or fail the action itself.
export async function audit(
  action: AuditAction,
  userId: string | null,
  target?: string,
) {
  const db = getDb();
  if (!db) return;
  try {
    const client = clientKey((await headers()).get("x-forwarded-for"));
    await db.adminEvent.create({
      data: { action, userId, target: target?.slice(0, 200), client },
    });
    if (Math.random() < 0.01)
      await db.adminEvent.deleteMany({
        where: { createdAt: { lt: new Date(Date.now() - RETENTION_MS) } },
      });
  } catch (error) {
    console.error("audit write failed", action, error);
  }
}
