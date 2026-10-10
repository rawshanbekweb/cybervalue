import "server-only";
import type { Prisma, Student } from "@/generated/prisma/client";
import { getDb } from "../db";

// Published, and either open to every student or to the student's group.
export function visibleTo(student: Pick<Student, "group">) {
  return {
    published: true,
    OR: [
      { groups: { isEmpty: true } },
      ...(student.group ? [{ groups: { has: student.group } }] : []),
    ],
  } satisfies Prisma.StudentMaterialWhereInput;
}

export async function studentOverview(student: Student) {
  const db = getDb();
  if (!db) return { materials: [], done: new Set<string>() };
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
      },
    }),
    db.studentProgress.findMany({
      where: { studentId: student.id },
      select: { materialId: true },
    }),
    db.studentSubmission.findMany({
      where: { studentId: student.id },
      select: { materialId: true },
      distinct: ["materialId"],
    }),
  ]);
  // Handing in a practice or quiz counts as finishing it.
  const done = new Set([
    ...progress.map((p) => p.materialId),
    ...submissions.map((s) => s.materialId),
  ]);
  return { materials, done };
}

export async function materialForStudent(student: Student, slug: string) {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null;
  return (
    (await getDb()?.studentMaterial.findFirst({
      where: { slug, ...visibleTo(student) },
    })) ?? null
  );
}
