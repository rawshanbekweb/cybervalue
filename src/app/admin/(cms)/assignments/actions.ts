"use server";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { canSeeGroup, requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { assignmentSchema } from "@/lib/student/assignments";
import { assignmentCreated } from "@/lib/telegram/events";
import { quietly } from "@/lib/telegram/notify";

export type AssignmentState =
  { error?: string; success?: string; at?: number } | undefined;

const text = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
};

export async function createAssignmentAction(
  _state: AssignmentState,
  form: FormData,
): Promise<AssignmentState> {
  const { session, scope } = await requireStaff("/admin/assignments");
  if (!(await limit(`admin-write:${session.user.id}`, 60, 60_000)))
    return { error: "Too many changes. Try again shortly." };
  const parsed = assignmentSchema.safeParse({
    title: text(form, "title"),
    note: text(form, "note"),
    group: text(form, "group"),
    target: text(form, "target"),
    dueAt: text(form, "dueAt"),
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return {
      error:
        field === "target"
          ? "Choose what the students must do."
          : field === "dueAt"
            ? "Choose the deadline date and time."
            : field === "group"
              ? "Group: up to 40 letters, digits, spaces, dots, dashes or underscores."
              : "A title is required, and each text field has a length limit.",
    };
  }
  // A teacher sets work for one of their own groups, never for everyone.
  if (!scope.owner && !canSeeGroup(scope, parsed.data.group))
    return { error: "Choose one of your groups." };
  const db = getDb();
  if (!db) return { error: "Database is not configured." };
  if (parsed.data.target.startsWith("material:")) {
    const exists = await db.studentMaterial.count({
      where: { id: parsed.data.target.slice("material:".length) },
    });
    if (!exists) return { error: "Choose what the students must do." };
  }
  const saved = await db.studentAssignment.create({ data: parsed.data });
  await audit("assignment.create", session.user.id, saved.title);
  await quietly(() => assignmentCreated(db, saved.id));
  revalidatePath("/admin/assignments");
  revalidatePath("/admin/class");
  revalidatePath("/student", "layout");
  return { success: "Assignment created.", at: Date.now() };
}

export async function deleteAssignmentAction(id: string) {
  const { session, scope } = await requireStaff("/admin/assignments");
  const db = getDb();
  if (!db) return;
  const assignment = await db.studentAssignment.findUnique({
    where: { id },
    select: { group: true },
  });
  if (!assignment || !(scope.owner || canSeeGroup(scope, assignment.group)))
    return;
  const removed = await db.studentAssignment
    .delete({ where: { id } })
    .catch(() => null);
  if (removed) await audit("assignment.delete", session.user.id, removed.title);
  revalidatePath("/admin/assignments");
  revalidatePath("/admin/class");
  revalidatePath("/student", "layout");
}
