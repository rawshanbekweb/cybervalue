import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";

export type GroupRow = {
  name: string;
  students: number;
  junior: number;
  kids: number;
  teachers: { id: string; name: string }[];
};

/** Every group in use by people or teachers, with member counts. */
export async function listGroups(db: PrismaClient, only?: string[]) {
  const where = {
    group: only ? { in: only } : { not: "" },
  };
  const [students, junior, kids, teachers] = await Promise.all([
    db.student.groupBy({ by: ["group"], where, _count: { _all: true } }),
    db.juniorMember.groupBy({ by: ["group"], where, _count: { _all: true } }),
    db.kidsMember.groupBy({ by: ["group"], where, _count: { _all: true } }),
    db.user.findMany({
      where: { role: "teacher" },
      select: { id: true, name: true, groups: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const rows = new Map<string, GroupRow>();
  const row = (name: string) => {
    if (!rows.has(name))
      rows.set(name, { name, students: 0, junior: 0, kids: 0, teachers: [] });
    return rows.get(name)!;
  };
  for (const s of students) row(s.group).students = s._count._all;
  for (const j of junior) row(j.group).junior = j._count._all;
  for (const k of kids) row(k.group).kids = k._count._all;
  for (const teacher of teachers)
    for (const g of teacher.groups)
      if (!only || only.includes(g))
        row(g).teachers.push({ id: teacher.id, name: teacher.name });
  return [...rows.values()]
    .filter((r) => r.name)
    .sort((a, b) => a.name.localeCompare(b.name, "uz", { numeric: true }));
}
