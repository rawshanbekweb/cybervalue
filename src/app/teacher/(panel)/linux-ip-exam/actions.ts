"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { canSeeGroup, requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { OPENS, type LipResult } from "@/lib/linux-ip-exam/content";
import { applyReview } from "@/lib/linux-ip-exam/grading";

const PATH = "/teacher/linux-ip-exam";

/** The attempt, if the teacher may see its student's group. */
async function attemptInScope(id: string) {
  const { session, scope } = await requireStaff(PATH);
  const db = getDb();
  if (!db) throw new Error("Database is not configured");
  const attempt = await db.linuxIpAttempt.findUnique({
    where: { id },
    include: { student: { select: { group: true } } },
  });
  if (!attempt || !canSeeGroup(scope, attempt.student.group)) redirect(PATH);
  return { db, session, attempt };
}

/** Save the teacher's points for open questions and the note; optionally approve. */
export async function reviewLinuxIpAction(id: string, form: FormData) {
  const { db, session, attempt } = await attemptInScope(id);
  if (!attempt.grading) redirect(`${PATH}?attempt=${id}`);
  const overrides: Record<string, number> = {};
  for (const open of OPENS) {
    const raw = String(form.get(`score-${open.id}`) ?? "")
      .trim()
      .replace(",", ".");
    if (!raw) continue;
    const score = z.coerce.number().min(0).max(open.points).safeParse(raw);
    if (score.success) overrides[open.id] = score.data;
  }
  const note = String(form.get("note") ?? "").slice(0, 3000);
  const decision = form.get("decision");
  const finalScore = applyReview(attempt.grading as LipResult, overrides).total;
  await db.linuxIpAttempt.update({
    where: { id },
    data: {
      overrides,
      note,
      finalScore,
      ...(decision === "approve"
        ? { approvedAt: new Date(), approvedBy: session.user.id }
        : decision === "hide"
          ? { approvedAt: null, approvedBy: null }
          : {}),
    },
  });
  await audit("linux-ip-exam.review", session.user.id, id);
  revalidatePath(PATH);
  redirect(`${PATH}?attempt=${id}`);
}

/** Delete the attempt so the student can sit the exam again. */
export async function retakeLinuxIpAction(id: string) {
  const { db, session } = await attemptInScope(id);
  await db.linuxIpAttempt.delete({ where: { id } });
  await audit("linux-ip-exam.retake", session.user.id, id);
  revalidatePath(PATH);
  redirect(PATH);
}
