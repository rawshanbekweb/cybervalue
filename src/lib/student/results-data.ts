import "server-only";
import { groupCondition, pickGroup, type GroupPick } from "../staff";
import type { PrismaClient } from "@/generated/prisma/client";
import { buildResults } from "./results";

export async function studentGroups(db: PrismaClient) {
  const rows = await db.student.findMany({
    distinct: ["group"],
    orderBy: { group: "asc" },
    select: { group: true },
  });
  return rows.map((row) => row.group).filter(Boolean);
}

// An unknown or empty `group` means every student.
export async function resolveGroup(
  db: PrismaClient,
  requested: unknown,
  scope: { owner: boolean; groups: string[] } = { owner: true, groups: [] },
) {
  const picked = pickGroup(scope, await studentGroups(db), requested);
  return { groups: picked.groups, group: picked.group };
}

// `group` "" means every student. Only published materials are columns, and
// only those a selected group can see.
export async function loadResults(db: PrismaClient, group: GroupPick) {
  const [students, allMaterials] = await Promise.all([
    db.student.findMany({
      where: groupCondition(group),
      orderBy: [{ group: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        group: true,
        level: true,
        active: true,
        lastLoginAt: true,
      },
    }),
    db.studentMaterial.findMany({
      where: { published: true },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        kind: true,
        groups: true,
        levels: true,
      },
    }),
  ]);
  const picked = Array.isArray(group) ? group : group ? [group] : [];
  const materials = picked.length
    ? allMaterials.filter(
        (m) => !m.groups.length || m.groups.some((g) => picked.includes(g)),
      )
    : allMaterials;
  const studentIds = students.map((s) => s.id);
  const materialIds = materials.map((m) => m.id);
  const [submissions, progress] = await Promise.all([
    db.studentSubmission.findMany({
      where: { studentId: { in: studentIds }, materialId: { in: materialIds } },
      orderBy: { createdAt: "desc" },
      select: {
        studentId: true,
        materialId: true,
        score: true,
        maxScore: true,
        reviewedAt: true,
      },
    }),
    db.studentProgress.findMany({
      where: { studentId: { in: studentIds }, materialId: { in: materialIds } },
      select: { studentId: true, materialId: true },
    }),
  ]);
  return buildResults({ students, materials, submissions, progress });
}
