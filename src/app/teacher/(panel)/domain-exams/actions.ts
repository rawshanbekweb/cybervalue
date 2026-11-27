"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { canSeeGroup, groupWhere, requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { certificatesEarned } from "@/lib/telegram/events";

const PATH = "/teacher/domain-exams";

/** The attempt, if the teacher may see its student's group. */
async function attemptInScope(id: string) {
  const { session, scope } = await requireStaff(PATH);
  const db = getDb();
  if (!db) throw new Error("Database is not configured");
  const attempt = await db.domainExamAttempt.findUnique({
    where: { id },
    include: { student: { select: { group: true } } },
  });
  if (!attempt || !canSeeGroup(scope, attempt.student.group)) redirect(PATH);
  return { db, session, attempt };
}

/** Save the note for the student; optionally show or hide the result. */
export async function reviewDomainExamAction(id: string, form: FormData) {
  const { db, session, attempt } = await attemptInScope(id);
  const back = `${PATH}?domain=${attempt.domain}&attempt=${id}`;
  if (!attempt.submittedAt) redirect(back);
  const note = String(form.get("note") ?? "").slice(0, 3000);
  const decision = form.get("decision");
  await db.domainExamAttempt.update({
    where: { id },
    data: {
      note,
      ...(decision === "approve"
        ? { approvedAt: new Date(), approvedBy: session.user.id }
        : decision === "hide"
          ? { approvedAt: null, approvedBy: null }
          : {}),
    },
  });
  await audit("domain-exam.review", session.user.id, id);
  // An approved pass earns the domain's certificate (and, with every domain
  // passed, the Intermediate one).
  if (decision === "approve")
    await certificatesEarned(db, attempt.studentId).catch(() => []);
  revalidatePath(PATH);
  redirect(back);
}

/** Approve one submitted attempt as it is, keeping any note. */
export async function approveDomainExamAction(id: string) {
  const { db, session, attempt } = await attemptInScope(id);
  const back = `${PATH}?domain=${attempt.domain}`;
  if (!attempt.submittedAt || attempt.approvedAt) redirect(back);
  await db.domainExamAttempt.update({
    where: { id },
    data: { approvedAt: new Date(), approvedBy: session.user.id },
  });
  await audit("domain-exam.review", session.user.id, id);
  await certificatesEarned(db, attempt.studentId).catch(() => []);
  revalidatePath(PATH);
  redirect(back);
}

/** Approve every submitted, unapproved attempt of one exam in scope. */
export async function approveWaitingDomainExamsAction(domain: string) {
  const { session, scope } = await requireStaff(PATH);
  const db = getDb();
  if (!db) throw new Error("Database is not configured");
  const waiting = await db.domainExamAttempt.findMany({
    where: {
      domain,
      student: groupWhere(scope),
      submittedAt: { not: null },
      approvedAt: null,
    },
    select: { id: true, studentId: true },
  });
  if (waiting.length) {
    await db.domainExamAttempt.updateMany({
      where: { id: { in: waiting.map((a) => a.id) }, approvedAt: null },
      data: { approvedAt: new Date(), approvedBy: session.user.id },
    });
    for (const a of waiting) {
      await audit("domain-exam.review", session.user.id, a.id);
      await certificatesEarned(db, a.studentId).catch(() => []);
    }
  }
  revalidatePath(PATH);
  redirect(`${PATH}?domain=${domain}`);
}

/** Delete the attempt so the student can sit the exam again. */
export async function retakeDomainExamAction(id: string) {
  const { db, session, attempt } = await attemptInScope(id);
  await db.domainExamAttempt.delete({ where: { id } });
  await audit("domain-exam.retake", session.user.id, id);
  revalidatePath(PATH);
  redirect(`${PATH}?domain=${attempt.domain}`);
}
