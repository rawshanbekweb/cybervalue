import "server-only";
import { notFound } from "next/navigation";
import { getDb } from "./db";
import { requireStaff, type Scope } from "./auth";

export type MemberKind = "student" | "junior" | "kids";

async function groupOf(kind: MemberKind, id: string) {
  const db = getDb();
  if (!db) return null;
  const select = { group: true };
  const row =
    kind === "student"
      ? await db.student.findUnique({ where: { id }, select })
      : kind === "junior"
        ? await db.juniorMember.findUnique({ where: { id }, select })
        : await db.kidsMember.findUnique({ where: { id }, select });
  return row?.group ?? null;
}

/**
 * requireAdmin for one learner: a teacher only reaches learners of their
 * own groups; anyone else's page or action answers 404.
 */
export async function requireMember(
  kind: MemberKind,
  id: string,
  nextPath?: string,
) {
  const { session, scope } = await requireStaff(nextPath);
  if (!scope.owner) {
    const group = await groupOf(kind, id);
    if (group === null || !scope.groups.includes(group)) notFound();
  }
  return session;
}

/** A roster's groups must all be the teacher's own; null when they are. */
export function rosterOutsideScope(
  scope: Scope,
  rows: { group: string }[],
): string | null {
  if (scope.owner) return null;
  const outside = rows.find((r) => !scope.groups.includes(r.group));
  return outside ? outside.group || "—" : null;
}

/** Whether the signed-in person may put a learner into this group. */
export async function mayUseGroup(group: string) {
  const { scope } = await requireStaff();
  return scope.owner || scope.groups.includes(group);
}
