"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner, requireStaff } from "@/lib/auth";
import {
  mayUseGroup,
  requireMember,
  rosterOutsideScope,
} from "@/lib/staff-guard";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { hashSecret, newAccessCode } from "@/lib/student/access";
import { newCertificateCode } from "@/lib/student/certificate";
import { isLevel } from "@/lib/student/levels";
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
  const { session, scope } = await requireStaff("/admin/students");
  if (!(await limit(`student-create:${session.user.id}`, 10, 60_000)))
    return { error: "Wait a moment and try again." };
  const options = rosterOptionsSchema.safeParse({
    roster: form.get("roster"),
    expiresAt: form.get("expiresAt") ?? "",
  });
  if (!options.success) return { error: "Check the list and the date." };
  const roster = parseRoster(options.data.roster);
  if ("error" in roster) return roster;
  const outside = rosterOutsideScope(scope, roster.students);
  if (outside)
    return {
      error: "You can only add people to your own groups (not “{group}”).",
      values: { group: outside },
    };
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
  const session = await requireMember("student", id, `/admin/students/${id}`);
  const parsed = studentUpdateSchema.safeParse({
    name: form.get("name"),
    group: form.get("group") ?? "",
    level: form.get("level") ?? "",
    note: form.get("note") ?? "",
    active: form.get("active") === "on",
    expiresAt: form.get("expiresAt") ?? "",
  });
  if (!parsed.success)
    return {
      error:
        "Name is required (up to 100 characters); the group allows letters, digits, spaces, dots, dashes and underscores.",
    };
  if (!(await mayUseGroup(parsed.data.group)))
    return { error: "You can only move people to your own groups." };
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
  const session = await requireMember("student", id, `/admin/students/${id}`);
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
  await requireMember("student", id, `/admin/students/${id}`);
  await getDb()?.studentSession.deleteMany({ where: { studentId: id } });
  revalidatePath(`/admin/students/${id}`);
}

export async function deleteStudentAction(id: string) {
  const session = await requireMember("student", id, "/admin/students");
  const db = getDb();
  if (!db) return;
  const student = await db.student.delete({ where: { id } }).catch(() => null);
  if (student) await audit("student.delete", session.user.id, student.name);
  revalidatePath("/admin/students");
  redirect("/admin/students");
}

// Issues a certificate with the student's current name. The title and level
// are copied, so later edits to the student do not change what was issued.
export async function issueCertificateAction(id: string, form: FormData) {
  const session = await requireMember("student", id, `/admin/students/${id}`);
  const title = String(form.get("title") ?? "").trim();
  const level = String(form.get("level") ?? "");
  if (!title || title.length > 160) return;
  const db = getDb();
  if (!db) return;
  const student = await db.student.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!student) return;
  await db.studentCertificate.create({
    data: {
      code: newCertificateCode(),
      studentId: id,
      name: student.name,
      title,
      level: isLevel(level) ? level : "",
    },
  });
  await audit(
    "certificate.issue",
    session.user.id,
    `${student.name}: ${title}`,
  );
  revalidatePath(`/admin/students/${id}`);
}

// Revoking keeps the record: the public page then says the certificate is no
// longer valid instead of "not found".
export async function setCertificateRevokedAction(
  certificateId: string,
  revoked: boolean,
) {
  const db = getDb();
  if (!db) return;
  const owner = await db.studentCertificate.findUnique({
    where: { id: certificateId },
    select: { studentId: true },
  });
  const session = owner?.studentId
    ? await requireMember("student", owner.studentId, "/admin/students")
    : await requireOwner("/admin/students");
  const certificate = await db.studentCertificate.update({
    where: { id: certificateId },
    data: { revokedAt: revoked ? new Date() : null },
  });
  await audit(
    revoked ? "certificate.revoke" : "certificate.restore",
    session.user.id,
    `${certificate.name}: ${certificate.code}`,
  );
  if (certificate.studentId)
    revalidatePath(`/admin/students/${certificate.studentId}`);
}
