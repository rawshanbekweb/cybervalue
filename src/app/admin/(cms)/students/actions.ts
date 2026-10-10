"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { hashSecret, newAccessCode } from "@/lib/student/access";
import {
  parseRoster,
  rosterOptionsSchema,
  studentUpdateSchema,
} from "@/lib/student/admin";

type Values = Record<string, number | string>;
const NO_DB = "Database is not configured.";

export type CreateStudentsState =
  | {
      error?: string;
      values?: Values;
      codes?: { id: string; name: string; group: string; code: string }[];
    }
  | undefined;

// Codes are shown once; only their digests are stored.
export async function createStudentsAction(
  _state: CreateStudentsState,
  form: FormData,
): Promise<CreateStudentsState> {
  const session = await requireAdmin("/admin/students");
  if (!(await limit(`student-create:${session.user.id}`, 10, 60_000)))
    return { error: "Wait a moment and try again." };
  const options = rosterOptionsSchema.safeParse({
    roster: form.get("roster"),
    expiresAt: form.get("expiresAt") ?? "",
  });
  if (!options.success) return { error: "Check the list and the date." };
  const roster = parseRoster(options.data.roster);
  if ("error" in roster) return roster;
  const db = getDb();
  if (!db) return { error: NO_DB };
  const rows = roster.students.map((s) => ({ ...s, code: newAccessCode() }));
  const created = await db.$transaction(
    rows.map((row) =>
      db.student.create({
        data: {
          name: row.name,
          group: row.group,
          codeHash: hashSecret(row.code),
          expiresAt: options.data.expiresAt,
        },
        select: { id: true },
      }),
    ),
  );
  await audit(
    "student.create",
    session.user.id,
    `${rows.length}: ${rows.map((r) => r.name).join(", ")}`,
  );
  revalidatePath("/admin/students");
  return { codes: rows.map((row, i) => ({ ...row, id: created[i].id })) };
}

export type StudentFormState =
  { error?: string; success?: string; code?: string } | undefined;

export async function updateStudentAction(
  id: string,
  _state: StudentFormState,
  form: FormData,
): Promise<StudentFormState> {
  const session = await requireAdmin(`/admin/students/${id}`);
  const parsed = studentUpdateSchema.safeParse({
    name: form.get("name"),
    group: form.get("group") ?? "",
    note: form.get("note") ?? "",
    active: form.get("active") === "on",
    expiresAt: form.get("expiresAt") ?? "",
  });
  if (!parsed.success)
    return {
      error:
        "Name is required (up to 100 characters); the group allows letters, digits, spaces, dots, dashes and underscores.",
    };
  const db = getDb();
  if (!db) return { error: NO_DB };
  const student = await db.student.update({
    where: { id },
    data: parsed.data,
  });
  // Revoking access also ends every open session at once.
  if (!student.active)
    await db.studentSession.deleteMany({ where: { studentId: id } });
  await audit("student.update", session.user.id, student.name);
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  return { success: "Saved." };
}

// Bound for useActionState; the previous state is not needed.
export async function resetStudentCodeAction(
  id: string,
): Promise<StudentFormState> {
  const session = await requireAdmin(`/admin/students/${id}`);
  const db = getDb();
  if (!db) return { error: NO_DB };
  const code = newAccessCode();
  const [student] = await db.$transaction([
    db.student.update({
      where: { id },
      data: { codeHash: hashSecret(code) },
    }),
    db.studentSession.deleteMany({ where: { studentId: id } }),
  ]);
  await audit("student.code_reset", session.user.id, student.name);
  return { code };
}

export async function signOutStudentAction(id: string) {
  await requireAdmin(`/admin/students/${id}`);
  await getDb()?.studentSession.deleteMany({ where: { studentId: id } });
  revalidatePath(`/admin/students/${id}`);
}

export async function deleteStudentAction(id: string) {
  const session = await requireAdmin("/admin/students");
  const db = getDb();
  if (!db) return;
  const student = await db.student.delete({ where: { id } }).catch(() => null);
  if (student) await audit("student.delete", session.user.id, student.name);
  revalidatePath("/admin/students");
  redirect("/admin/students");
}
