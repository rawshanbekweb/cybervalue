"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";

export type BulkState =
  | { error?: string; success?: string; values?: Record<string, number> }
  | undefined;

const groupName = z
  .string()
  .trim()
  .max(40)
  .regex(/^[\p{L}\p{N} ._-]*$/u);

// One action for both kinds of account. Ids arrive as "s:<id>" (student) or
// "j:<id>" (Academy Junior member).
export async function bulkUsersAction(
  _state: BulkState,
  form: FormData,
): Promise<BulkState> {
  const session = await requireAdmin("/admin/users");
  if (!(await limit(`admin-write:${session.user.id}`, 60, 60_000)))
    return { error: "Too many changes. Try again shortly." };
  const db = getDb();
  if (!db) return { error: "Database is not configured." };
  const ids = form.getAll("id").map(String).slice(0, 1000);
  const students = ids.filter((i) => i.startsWith("s:")).map((i) => i.slice(2));
  const juniors = ids.filter((i) => i.startsWith("j:")).map((i) => i.slice(2));
  if (!students.length && !juniors.length)
    return { error: "Select at least one user." };
  const action = String(form.get("action"));
  const s = { id: { in: students } };
  const j = { id: { in: juniors } };
  switch (action) {
    case "group": {
      const group = groupName.safeParse(form.get("group") ?? "");
      if (!group.success)
        return {
          error:
            "The group allows letters, digits, spaces, dots, dashes and underscores (up to 40).",
        };
      await db.$transaction([
        db.student.updateMany({ where: s, data: { group: group.data } }),
        db.juniorMember.updateMany({ where: j, data: { group: group.data } }),
      ]);
      break;
    }
    case "activate":
      await db.$transaction([
        db.student.updateMany({ where: s, data: { active: true } }),
        db.juniorMember.updateMany({ where: j, data: { active: true } }),
      ]);
      break;
    case "block":
    case "signout":
      await db.$transaction([
        ...(action === "block"
          ? [
              db.student.updateMany({ where: s, data: { active: false } }),
              db.juniorMember.updateMany({ where: j, data: { active: false } }),
            ]
          : []),
        db.studentSession.deleteMany({
          where: { studentId: { in: students } },
        }),
        db.juniorSession.deleteMany({ where: { memberId: { in: juniors } } }),
      ]);
      break;
    default:
      return { error: "Choose an action." };
  }
  await audit(
    "users.bulk",
    session.user.id,
    `${action}: ${students.length} students, ${juniors.length} junior`,
  );
  revalidatePath("/admin/users");
  revalidatePath("/admin/students");
  revalidatePath("/admin/junior");
  return {
    success: "Done: {count} users updated.",
    values: { count: students.length + juniors.length },
  };
}
