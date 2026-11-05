import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { isLabId, type LabId } from "../lab-progress";
import { newCertificateCode } from "./certificate";
import { newAwards, type AwardFacts } from "./award-rules";

/**
 * Issues every automatic certificate the student has newly earned and
 * returns their titles. Safe to call after any progress: the unique
 * (studentId, rule) index stops a second copy.
 */
export async function awardCertificates(db: PrismaClient, studentId: string) {
  const [student, labs, checkpoints, exams, issued] = await Promise.all([
    db.student.findUnique({
      where: { id: studentId },
      select: { name: true, active: true },
    }),
    db.studentLabProgress.findMany({
      where: { studentId },
      select: { lab: true, lessons: true },
    }),
    db.studentCheckpoint.findMany({
      where: { studentId },
      select: { checkpoint: true, score: true, total: true },
    }),
    // Only results a teacher approved count.
    db.domainExamAttempt.findMany({
      where: { studentId, approvedAt: { not: null } },
      select: { domain: true, score: true, total: true },
    }),
    db.studentCertificate.findMany({
      where: { studentId, rule: { not: null } },
      select: { rule: true },
    }),
  ]);
  if (!student?.active) return [];
  const facts: AwardFacts = { labs: {}, checkpoints: {}, exams: {} };
  for (const l of labs)
    if (isLabId(l.lab)) facts.labs[l.lab as LabId] = new Set(l.lessons).size;
  for (const c of checkpoints) {
    const percent = c.total ? Math.round((c.score / c.total) * 100) : 0;
    facts.checkpoints[c.checkpoint] = Math.max(
      facts.checkpoints[c.checkpoint] ?? 0,
      percent,
    );
  }
  for (const e of exams)
    if (e.total)
      facts.exams![e.domain] = Math.round((e.score! / e.total) * 100);
  const awards = newAwards(
    facts,
    issued.map((c) => c.rule!),
  );
  const titles: string[] = [];
  for (const award of awards) {
    const created = await db.studentCertificate
      .create({
        data: {
          code: newCertificateCode(),
          studentId,
          name: student.name,
          title: award.title,
          level: award.level ?? "",
          rule: award.id,
        },
      })
      .catch(() => null);
    if (created) titles.push(award.title);
  }
  return titles;
}
