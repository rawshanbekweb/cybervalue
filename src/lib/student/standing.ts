import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { visibleAtLevel } from "./levels";
import { standing, type Standing } from "./xp";

type Who = { id: string; group: string; level: string };

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
  const result = new Map<string, Standing>();
  for (const student of students) {
    const mine = <T extends { studentId: string }>(rows: T[]) =>
      rows.filter((row) => row.studentId === student.id);
    result.set(
      student.id,
      standing(
        {
          materials: materials.filter(
            (m) =>
              (m.groups.length === 0 || m.groups.includes(student.group)) &&
              visibleAtLevel(m.levels, student.level),
          ),
          progress: mine(progress),
          submissions: mine(submissions),
          checkpoints: mine(checkpoints),
          labs: mine(labs),
        },
        now,
      ),
    );
  }
  return result;
}
