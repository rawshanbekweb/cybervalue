import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { rankFor } from "../junior/rank";
import { rankingName } from "../junior/ranking";

export { juniorFromSnapshot, MAX_SNAPSHOT } from "../junior/ranking";

export async function groupRanking(
  db: PrismaClient,
  student: { id: string; group: string },
) {
  if (!student.group) return [];
  const rows = await db.student.findMany({
    where: {
      group: student.group,
      active: true,
      juniorSyncedAt: { not: null },
    },
    orderBy: [{ juniorXp: "desc" }, { juniorSyncedAt: "asc" }],
    take: 30,
    select: { id: true, name: true, juniorCodename: true, juniorXp: true },
  });
  return rows.map((row, i) => ({
    place: i + 1,
    me: row.id === student.id,
    name: rankingName(row),
    xp: row.juniorXp,
    rank: rankFor(row.juniorXp).rank.title,
  }));
}
