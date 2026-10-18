import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";

type Scope = { owner: boolean; groups: string[] };
const ALL: Scope = { owner: true, groups: [] };
const inGroups = (scope: Scope) =>
  scope.owner ? {} : { group: { in: scope.groups } };

const DAY = 86_400_000;

/** Counts behind the sidebar badges; cheap enough for every admin page. */
export async function adminBadges(db: PrismaClient, scope: Scope = ALL) {
  const [reviews, errors] = await Promise.all([
    db.studentSubmission.count({
      where: {
        reviewedAt: null,
        material: { kind: "PRACTICE" },
        ...(scope.owner ? {} : { student: inGroups(scope) }),
      },
    }),
    scope.owner ? db.errorEvent.count({ where: { resolvedAt: null } }) : 0,
  ]);
  return { reviews, errors };
}

/** What the dashboard shows: today's work first, then the numbers. */
export async function adminOverview(
  db: PrismaClient,
  scope: Scope = ALL,
  now = Date.now(),
) {
  const people = inGroups(scope);
  // A teacher's assignments: their groups' ones (never the all-groups ones).
  const work = inGroups(scope);
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
    kids,
    kidsActive,
  ] = await Promise.all([
    adminBadges(db, scope),
    db.studentSubmission.findMany({
      where: {
        reviewedAt: null,
        material: { kind: "PRACTICE" },
        ...(scope.owner ? {} : { student: people }),
      },
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
      where: { dueAt: { gte: new Date(now), lt: ahead }, ...work },
      orderBy: { dueAt: "asc" },
      take: 5,
      select: { id: true, title: true, group: true, dueAt: true },
    }),
    db.studentAssignment.count({
      where: { dueAt: { gte: week, lt: new Date(now) }, ...work },
    }),
    db.student.count({ where: { active: true, ...people } }),
    db.student.count({
      where: { active: true, lastLoginAt: { gte: day }, ...people },
    }),
    db.student.count({
      where: { active: true, lastLoginAt: { gte: week }, ...people },
    }),
    db.studentSubmission.count({
      where: {
        createdAt: { gte: week },
        ...(scope.owner ? {} : { student: people }),
      },
    }),
    db.juniorMember.aggregate({
      where: { active: true, ...people },
      _count: true,
      _avg: { xp: true },
    }),
    db.juniorMember.count({
      where: { active: true, lastActiveAt: { gte: week }, ...people },
    }),
    scope.owner ? db.telegramChat.count() : 0,
    db.liveGame.count({ where: { state: { not: "finished" } } }),
    db.kidsMember.count({ where: { active: true, ...people } }),
    db.kidsMember.count({
      where: { active: true, lastActiveAt: { gte: week }, ...people },
    }),
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
    kids,
    kidsActive,
  };
}
