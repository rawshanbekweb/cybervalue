import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { visibleAtLevel } from "./levels";
import { standing, weeklyXp, withoutReturned, type WeeklyStanding } from "./xp";

type Who = { id: string; group: string; level: string; bonusXp?: number };

// XP, ranks and activity for many students at once (a whole group for the
// ranking and the class panel), with each student's own visible materials.
export async function loadStandings(
  db: PrismaClient,
  students: Who[],
  now = Date.now(),
) {
  const ids = students.map((s) => s.id);
  const [materials, progress, submissions, checkpoints, labs] =
    await Promise.all([
      db.studentMaterial.findMany({
        where: { published: true },
        select: {
          id: true,
          slug: true,
          kind: true,
          groups: true,
          levels: true,
        },
      }),
      db.studentProgress.findMany({
        where: { studentId: { in: ids } },
        select: { studentId: true, materialId: true, completedAt: true },
      }),
      db.studentSubmission.findMany({
        where: { studentId: { in: ids } },
        select: {
          studentId: true,
          materialId: true,
          score: true,
          maxScore: true,
          createdAt: true,
          returned: true,
        },
      }),
      db.studentCheckpoint.findMany({
        where: { studentId: { in: ids } },
        select: {
          studentId: true,
          checkpoint: true,
          score: true,
          total: true,
          createdAt: true,
        },
      }),
      db.studentLabProgress.findMany({
        where: { studentId: { in: ids } },
        select: { studentId: true, lab: true, lessons: true },
      }),
    ]);
  const result = new Map<string, WeeklyStanding>();
  for (const student of students) {
    const mine = <T extends { studentId: string }>(rows: T[]) =>
      rows.filter((row) => row.studentId === student.id);
    const own = { progress: mine(progress), submissions: mine(submissions) };
    // Work already done keeps counting after a level or group change hides
    // its material from the student.
    const touched = new Set(
      [...own.progress, ...own.submissions].map((r) => r.materialId),
    );
    const input = {
      materials: materials.filter(
        (m) =>
          touched.has(m.id) ||
          ((m.groups.length === 0 || m.groups.includes(student.group)) &&
            visibleAtLevel(m.levels, student.level)),
      ),
      progress: own.progress,
      submissions: withoutReturned(own.submissions),
      checkpoints: mine(checkpoints),
      labs: mine(labs),
      bonus: student.bonusXp,
    };
    const weekly = weeklyXp(input, now);
    result.set(student.id, {
      ...standing(input, now),
      weekXp: weekly.week,
      lastWeekXp: weekly.lastWeek,
    });
  }
  return result;
}
