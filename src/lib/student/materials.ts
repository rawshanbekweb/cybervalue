import "server-only";
import type { Prisma, Student } from "@/generated/prisma/client";
import { getDb } from "../db";

// Published, open to the student's group (or every group) and to their level
// (or every level).
export function visibleTo(student: Pick<Student, "group" | "level">) {
  return {
    published: true,
    AND: [
      {
        OR: [
          { groups: { isEmpty: true } },
          ...(student.group ? [{ groups: { has: student.group } }] : []),
        ],
      },
      {
        OR: [
          { levels: { isEmpty: true } },
          ...(student.level ? [{ levels: { has: student.level } }] : []),
        ],
      },
    ],
  } satisfies Prisma.StudentMaterialWhereInput;
}

// The entrance exam is shown as one section at the top of the student's page
// whatever the kind of its materials.
export { isEntranceExam } from "./levels";

export type TestStats = { attempts: number; best: number };

export async function studentOverview(
  student: Pick<Student, "id" | "group" | "level">,
) {
  const db = getDb();
  if (!db)
    return {
      materials: [],
      done: new Set<string>(),
      tests: new Map<string, TestStats>(),
    };
  const [materials, progress, submissions] = await Promise.all([
    db.studentMaterial.findMany({
      where: visibleTo(student),
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        slug: true,
        kind: true,
        title: true,
        summary: true,
        maxAttempts: true,
        createdAt: true,
      },
    }),
    db.studentProgress.findMany({
      where: { studentId: student.id },
      select: { materialId: true },
    }),
    db.studentSubmission.findMany({
      where: {
        studentId: student.id,
        material: { kind: { not: "CHALLENGE" } },
      },
      select: { materialId: true, score: true, maxScore: true },
    }),
  ]);
  // Handing in a practice or quiz counts as finishing it; a personal lab only
  // counts once solved, which records progress.
  const done = new Set([
    ...progress.map((p) => p.materialId),
    ...submissions.map((s) => s.materialId),
  ]);
  // Graded attempts per test, for the attempt counter and best score.
  const quizzes = new Set(
    materials.filter((m) => m.kind === "QUIZ").map((m) => m.id),
  );
  const tests = new Map<string, TestStats>();
  for (const s of submissions) {
    if (!quizzes.has(s.materialId) || s.score === null || !s.maxScore) continue;
    const percent = Math.round((s.score / s.maxScore) * 100);
    const stats = tests.get(s.materialId);
    tests.set(s.materialId, {
      attempts: (stats?.attempts ?? 0) + 1,
      best: Math.max(stats?.best ?? 0, percent),
    });
  }
  return { materials, done, tests };
}

export async function materialForStudent(
  student: Pick<Student, "id" | "group" | "level">,
  slug: string,
) {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null;
  return (
    (await getDb()?.studentMaterial.findFirst({
      where: { slug, ...visibleTo(student) },
    })) ?? null
  );
}
