import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { trashPeople } from "@/lib/trash";

const DAY = 86_400_000;

// What the clean-up page can remove. Each kind counts what would go, can name
// a few examples, and deletes exactly what it counted.
export type CleanupId =
  | "never"
  | "inactive"
  | "blocked"
  | "live"
  | "errors"
  | "assignments"
  | "sessions";

export type Cleanup = {
  id: CleanupId;
  title: string;
  detail: string;
  /** People are removed with their progress; the rest is housekeeping. */
  people: boolean;
};

export const CLEANUPS: Cleanup[] = [
  {
    id: "never",
    title: "Accounts that never signed in",
    detail:
      "Students, Junior and Kids members created more than 30 days ago whose code was never used. They go to the trash first.",
    people: true,
  },
  {
    id: "inactive",
    title: "Accounts inactive for 6 months",
    detail:
      "No sign-in and no activity for 180 days. They go to the trash with their answers and progress.",
    people: true,
  },
  {
    id: "blocked",
    title: "Blocked accounts",
    detail:
      "Accounts whose access you turned off. They go to the trash with all their progress.",
    people: true,
  },
  {
    id: "live",
    title: "Old live quiz games",
    detail:
      "Games finished more than 7 days ago, and games never started for a day.",
    people: false,
  },
  {
    id: "errors",
    title: "Resolved site errors",
    detail: "Errors you marked as resolved.",
    people: false,
  },
  {
    id: "assignments",
    title: "Old assignments",
    detail: "Assignments whose deadline passed more than 90 days ago.",
    people: false,
  },
  {
    id: "sessions",
    title: "Expired sign-ins",
    detail:
      "Sign-in records that no longer work. Nobody is signed out by this.",
    people: false,
  },
];

export const isCleanupId = (id: unknown): id is CleanupId =>
  CLEANUPS.some((c) => c.id === id);

function accountFilters(id: CleanupId, now: number) {
  const month = new Date(now - 30 * DAY);
  const half = new Date(now - 180 * DAY);
  if (id === "never")
    return {
      student: { lastLoginAt: null, createdAt: { lt: month } },
      member: { lastLoginAt: null, createdAt: { lt: month } },
    };
  if (id === "inactive")
    return {
      student: {
        createdAt: { lt: half },
        OR: [{ lastLoginAt: null }, { lastLoginAt: { lt: half } }],
      },
      member: {
        createdAt: { lt: half },
        AND: [
          { OR: [{ lastLoginAt: null }, { lastLoginAt: { lt: half } }] },
          { OR: [{ lastActiveAt: null }, { lastActiveAt: { lt: half } }] },
        ],
      },
    };
  return { student: { active: false }, member: { active: false } };
}

function liveFilter(now: number) {
  return {
    OR: [
      { state: "finished", createdAt: { lt: new Date(now - 7 * DAY) } },
      { state: "lobby", createdAt: { lt: new Date(now - DAY) } },
    ],
  };
}

/** How many items each clean-up would remove, and a few account names. */
export async function cleanupPreview(db: PrismaClient, now = Date.now()) {
  const result: Record<CleanupId, { count: number; names: string[] }> =
    {} as never;
  for (const c of CLEANUPS) {
    if (c.people) {
      const f = accountFilters(c.id, now);
      const select = { name: true };
      const [s, j, k] = await Promise.all([
        db.student.findMany({ where: f.student, select, take: 500 }),
        db.juniorMember.findMany({ where: f.member, select, take: 500 }),
        db.kidsMember.findMany({ where: f.member, select, take: 500 }),
      ]);
      const names = [...s, ...j, ...k].map((r) => r.name);
      result[c.id] = { count: names.length, names: names.slice(0, 8) };
      continue;
    }
    const count =
      c.id === "live"
        ? await db.liveGame.count({ where: liveFilter(now) })
        : c.id === "errors"
          ? await db.errorEvent.count({ where: { resolvedAt: { not: null } } })
          : c.id === "assignments"
            ? await db.studentAssignment.count({
                where: { dueAt: { lt: new Date(now - 90 * DAY) } },
              })
            : (
                await Promise.all([
                  db.session.count({
                    where: { expiresAt: { lt: new Date(now) } },
                  }),
                  db.studentSession.count({
                    where: { expiresAt: { lt: new Date(now) } },
                  }),
                  db.juniorSession.count({
                    where: { expiresAt: { lt: new Date(now) } },
                  }),
                  db.kidsSession.count({
                    where: { expiresAt: { lt: new Date(now) } },
                  }),
                ])
              ).reduce((a, b) => a + b, 0);
    result[c.id] = { count, names: [] };
  }
  return result;
}

/** Deletes one kind of clean-up; returns how many rows went. */
export async function runCleanup(
  db: PrismaClient,
  id: CleanupId,
  actorId: string | null = null,
  now = Date.now(),
) {
  const cleanup = CLEANUPS.find((c) => c.id === id)!;
  if (cleanup.people) {
    const f = accountFilters(id, now);
    const [students, juniors, kids] = await Promise.all([
      db.student.findMany({ where: f.student, select: { id: true } }),
      db.juniorMember.findMany({ where: f.member, select: { id: true } }),
      db.kidsMember.findMany({ where: f.member, select: { id: true } }),
    ]);
    // People go to the trash, so a clean-up can be undone for 30 days.
    return trashPeople(
      db,
      {
        students: students.map((r) => r.id),
        junior: juniors.map((r) => r.id),
        kids: kids.map((r) => r.id),
      },
      actorId,
    );
  }
  if (id === "live")
    return (await db.liveGame.deleteMany({ where: liveFilter(now) })).count;
  if (id === "errors")
    return (
      await db.errorEvent.deleteMany({ where: { resolvedAt: { not: null } } })
    ).count;
  if (id === "assignments")
    return (
      await db.studentAssignment.deleteMany({
        where: { dueAt: { lt: new Date(now - 90 * DAY) } },
      })
    ).count;
  const expired = { expiresAt: { lt: new Date(now) } };
  const counts = await db.$transaction([
    db.session.deleteMany({ where: expired }),
    db.studentSession.deleteMany({ where: expired }),
    db.juniorSession.deleteMany({ where: expired }),
    db.kidsSession.deleteMany({ where: expired }),
  ]);
  return counts.reduce((sum, r) => sum + r.count, 0);
}
