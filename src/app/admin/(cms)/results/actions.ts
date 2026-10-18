"use server";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { requireMember } from "@/lib/staff-guard";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { isLevel } from "@/lib/student/levels";
import { loadResults, resolveGroup } from "@/lib/student/results-data";

// Places one student at a level ("" clears it). The level decides which
// level-restricted materials the student sees from their next page load.
export async function setStudentLevelAction(studentId: string, level: string) {
  const session = await requireMember("student", studentId, "/admin/results");
  if (level !== "" && !isLevel(level)) return;
  const db = getDb();
  if (!db) return;
  const student = await db.student.update({
    where: { id: studentId },
    data: { level },
    select: { name: true },
  });
  await audit("student.level", session.user.id, `${student.name}: ${level}`);
  revalidatePath("/admin/results");
  revalidatePath(`/admin/students/${studentId}`);
}

// Confirms the suggestion for every student of the selected group who has
// none yet; a level the teacher already set is never overwritten.
export async function applySuggestedLevelsAction(form: FormData) {
  const { session, scope } = await requireStaff("/admin/results");
  const db = getDb();
  if (!db) return;
  const { group } = await resolveGroup(db, form.get("group"), scope);
  const { rows } = await loadResults(db, group);
  const pending = rows.filter((r) => !r.student.level && r.suggested);
  for (const row of pending) {
    await db.student.update({
      where: { id: row.student.id },
      data: { level: row.suggested! },
    });
    await audit(
      "student.level",
      session.user.id,
      `${row.student.name}: ${row.suggested}`,
    );
  }
  revalidatePath("/admin/results");
}
