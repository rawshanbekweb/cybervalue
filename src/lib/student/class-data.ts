import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { attention, type ClassRow } from "./class";
import { loadStandings } from "./standing";

// Groups from both student accounts and Academy Junior members.
export async function classGroups(db: PrismaClient) {
  const [students, juniors] = await Promise.all([
    db.student.findMany({ distinct: ["group"], select: { group: true } }),
    db.juniorMember.findMany({ distinct: ["group"], select: { group: true } }),
  ]);
  return [
    ...new Set([...students, ...juniors].map((r) => r.group).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));
}

export async function loadClass(
  db: PrismaClient,
  group: string,
  now = Date.now(),
) {
  const students = await db.student.findMany({
    where: { active: true, ...(group ? { group } : {}) },
    orderBy: { name: "asc" },
    select: { id: true, name: true, group: true, level: true },
    take: 500,
  });
  const standings = await loadStandings(db, students, now);
  const completions = students.map((s) => {
    const st = standings.get(s.id)!;
    return st.available ? st.done / st.available : 0;
  });
  const classCompletion = completions.length
    ? completions.reduce((a, b) => a + b, 0) / completions.length
    : 0;
  const rows: (ClassRow & { id: string })[] = students.map((s) => {
    const standing = standings.get(s.id)!;
    return {
      id: s.id,
      name: s.name,
      group: s.group,
      standing,
      reasons: attention(standing, classCompletion, now),
    };
  });
  return { rows, classCompletion };
}
