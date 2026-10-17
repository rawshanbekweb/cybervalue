import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";

const DAY = 86_400_000;

/** Counts behind the sidebar badges; cheap enough for every admin page. */
export async function adminBadges(db: PrismaClient) {
  const [reviews, errors] = await Promise.all([
    db.studentSubmission.count({
      where: { reviewedAt: null, material: { kind: "PRACTICE" } },
    }),
    db.errorEvent.count({ where: { resolvedAt: null } }),
  ]);
  return { reviews, errors };
}

/** What the dashboard shows: today's work first, then the numbers. */
export async function adminOverview(db: PrismaClient, now = Date.now()) {
  const day = new Date(now - DAY);
  const week = new Date(now - 7 * DAY);
  const ahead = new Date(now + 7 * DAY);
  const [
    badges,
    reviewList,
    upcoming,
    missed,
    students,
    activeToday,
    activeWeek,
    submissions,
    juniors,
    juniorsActive,
    telegram,
    live,
  ] = await Promise.all([
    adminBadges(db),
    db.studentSubmission.findMany({
      where: { reviewedAt: null, material: { kind: "PRACTICE" } },
      orderBy: { createdAt: "asc" },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        student: { select: { name: true, group: true } },
        material: { select: { id: true, title: true } },
      },
    }),
    db.studentAssignment.findMany({
      where: { dueAt: { gte: new Date(now), lt: ahead } },
      orderBy: { dueAt: "asc" },
      take: 5,
      select: { id: true, title: true, group: true, dueAt: true },
    }),
    db.studentAssignment.count({
      where: { dueAt: { gte: week, lt: new Date(now) } },
    }),
    db.student.count({ where: { active: true } }),
    db.student.count({ where: { active: true, lastLoginAt: { gte: day } } }),
    db.student.count({ where: { active: true, lastLoginAt: { gte: week } } }),
    db.studentSubmission.count({ where: { createdAt: { gte: week } } }),
    db.juniorMember.aggregate({
      where: { active: true },
      _count: true,
      _avg: { xp: true },
    }),
    db.juniorMember.count({
      where: { active: true, lastActiveAt: { gte: week } },
    }),
    db.telegramChat.count(),
    db.liveGame.count({ where: { state: { not: "finished" } } }),
  ]);
  return {
    ...badges,
    reviewList,
    upcoming,
    missed,
    students,
    activeToday,
    activeWeek,
    submissions,
    juniors: juniors._count,
    juniorXp: Math.round(juniors._avg.xp ?? 0),
    juniorsActive,
    telegram,
    live,
  };
}
