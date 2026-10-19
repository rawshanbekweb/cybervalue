import "server-only";
import { randomBytes } from "node:crypto";
import type { PrismaClient } from "@/generated/prisma/client";
import { juniorRow } from "./junior/admin";
import { MISSIONS } from "./junior/content";
import { TOTAL_EXERCISES } from "./junior/cipher-content";
import { studentAssignments } from "./student/assignment-data";
import { visibleSince } from "./student/assignments";
import { loadStandings } from "./student/standing";
import { isReportToken } from "./report-token";
import { ALL_MISSIONS, GAMES } from "./kids/games";
import { kidsLevel, restoreKidsProgress } from "./kids/progress";
import { kidSummary } from "./kids/summary";
import { kidsToday } from "./kids/extras";

// Parent reports: a read-only page per learner at /report/<token>. The token
// is the only key, so it is long, random and can be replaced at any time.
export const newReportToken = () => randomBytes(18).toString("base64url");
export { isReportToken, reportPath } from "./report-token";

export async function studentReport(
  db: PrismaClient,
  token: string,
  now = Date.now(),
) {
  const student = await db.student.findUnique({
    where: { reportToken: token },
    select: {
      id: true,
      name: true,
      group: true,
      level: true,
      bonusXp: true,
      active: true,
      certificates: {
        where: { revokedAt: null },
        select: { title: true, issuedAt: true },
        orderBy: { issuedAt: "desc" },
      },
    },
  });
  if (!student?.active) return null;
  const [standings, assignments, tests] = await Promise.all([
    loadStandings(db, [student], now),
    studentAssignments(db, student, visibleSince(now), now),
    db.studentSubmission.findMany({
      where: {
        studentId: student.id,
        material: { kind: "QUIZ" },
        score: { not: null },
        createdAt: { gte: new Date(now - 30 * 86_400_000) },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        score: true,
        maxScore: true,
        createdAt: true,
        material: { select: { title: true } },
      },
    }),
  ]);
  return {
    kind: "student" as const,
    name: student.name,
    group: student.group,
    level: student.level,
    standing: standings.get(student.id)!,
    assignments,
    tests: tests.map((t) => ({
      title: t.material.title,
      percent: t.maxScore ? Math.round(((t.score ?? 0) / t.maxScore) * 100) : 0,
      at: t.createdAt,
    })),
    certificates: student.certificates,
  };
}

export async function juniorReport(
  db: PrismaClient,
  token: string,
  now = Date.now(),
) {
  const member = await db.juniorMember.findUnique({
    where: { reportToken: token },
  });
  if (!member?.active) return null;
  const row = juniorRow(member, now);
  return {
    kind: "junior" as const,
    name: member.name,
    group: member.group,
    xp: row.xp,
    rank: row.rank,
    missions: row.missions,
    missionTotal: MISSIONS.length,
    exercises: row.exercises,
    exerciseTotal: TOTAL_EXERCISES,
    story: row.story,
    daily: row.daily,
    streak: row.streak,
    badges: row.badges.length,
    lastActiveAt: row.lastActiveAt,
  };
}

export async function kidsReport(db: PrismaClient, token: string) {
  const member = await db.kidsMember.findUnique({
    where: { reportToken: token },
  });
  if (!member?.active) return null;
  const progress = restoreKidsProgress(member.progress);
  const summary = kidSummary(progress, kidsToday());
  return {
    kind: "kids" as const,
    name: member.name,
    group: member.group,
    xp: member.xp,
    level: kidsLevel(member.xp).level.title,
    games: summary.games.map((g) => ({
      title: GAMES[g.id].title,
      open: g.open,
      stage: g.stage,
      done: g.done,
      total: g.total,
      best: g.best,
    })),
    skills: summary.skills.map((s) => s.text),
    badges: summary.badges.length,
    badgeTotal: summary.badgeTotal,
    streak: summary.streak,
    missions: progress.done.length,
    missionTotal: ALL_MISSIONS.length,
    lastActiveAt: member.lastActiveAt,
  };
}

export type StudentReport = NonNullable<
  Awaited<ReturnType<typeof studentReport>>
>;
export type JuniorReport = NonNullable<
  Awaited<ReturnType<typeof juniorReport>>
>;
export type KidsReport = NonNullable<Awaited<ReturnType<typeof kidsReport>>>;

export async function findReport(db: PrismaClient, token: string) {
  if (!isReportToken(token)) return null;
  return (
    (await studentReport(db, token)) ??
    (await juniorReport(db, token)) ??
    (await kidsReport(db, token))
  );
}
