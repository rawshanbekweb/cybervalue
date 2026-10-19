import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { groupWhere, type Scope } from "@/lib/auth";
import { CHECKPOINT_META } from "@/lib/checkpoints/meta";
import { LAB_META } from "@/lib/lab-progress";
import {
  chartWindow,
  DAY,
  daily,
  dayStart,
  tashkentDay,
  weekly,
} from "./activity";

export type MemberKind = "junior" | "kids";

/**
 * Marks today as an active day for a Junior or Kids member. It never fails
 * the save that called it: history is a nice-to-have.
 */
export async function recordActivity(
  db: PrismaClient,
  kind: MemberKind,
  memberId: string,
  now = Date.now(),
) {
  const day = new Date(`${tashkentDay(now)}T00:00:00Z`);
  await db.activityDay
    .upsert({
      where: { kind_memberId_day: { kind, memberId, day } },
      create: { kind, memberId, day },
      update: { events: { increment: 1 } },
    })
    .catch(() => null);
}

const passMark = new Map(CHECKPOINT_META.map((c) => [c.id, c.pass]));
export const checkpointPassed = (c: {
  checkpoint: string;
  score: number;
  total: number;
}) =>
  c.total > 0 &&
  (c.score / c.total) * 100 >= (passMark.get(c.checkpoint) ?? 70);

type GroupStats = {
  name: string;
  students: number;
  members: number;
  active: number;
  completed: number | null;
  score: number | null;
  answers: number;
  xp: number | null;
};

const avg = (values: number[]) =>
  values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : null;

/** Everything the analytics page shows, for the people a scope can see. */
export async function loadAnalytics(
  db: PrismaClient,
  scope: Scope,
  now = Date.now(),
) {
  const { from, thisWeek } = chartWindow(now);
  const since = new Date(from);
  const where = groupWhere(scope);
  const [students, juniors, kids] = await Promise.all([
    db.student.findMany({
      where,
      select: {
        id: true,
        group: true,
        lastLoginAt: true,
        _count: { select: { progress: true } },
      },
    }),
    db.juniorMember.findMany({
      where,
      select: { id: true, group: true, xp: true, lastActiveAt: true },
    }),
    db.kidsMember.findMany({
      where,
      select: { id: true, group: true, xp: true, lastActiveAt: true },
    }),
  ]);
  const studentIds = students.map((s) => s.id);
  const memberIds = [...juniors, ...kids].map((m) => m.id);
  const mine = { studentId: { in: studentIds } };
  const [submissions, completions, checkpoints, days] = await Promise.all([
    db.studentSubmission.findMany({
      where: { ...mine, createdAt: { gte: since } },
      select: { studentId: true, createdAt: true, score: true, maxScore: true },
    }),
    db.studentProgress.findMany({
      where: { ...mine, completedAt: { gte: since } },
      select: { studentId: true, completedAt: true },
    }),
    db.studentCheckpoint.findMany({
      where: { ...mine, createdAt: { gte: since } },
      select: {
        studentId: true,
        createdAt: true,
        checkpoint: true,
        score: true,
        total: true,
      },
    }),
    db.activityDay.findMany({
      where: {
        memberId: { in: memberIds },
        day: { gte: dayStart(tashkentDay(from)) },
      },
      select: { memberId: true, day: true },
    }),
  ]);

  const work = [
    ...submissions.map((s) => ({ at: s.createdAt, who: s.studentId })),
    ...completions.map((c) => ({ at: c.completedAt, who: c.studentId })),
    ...checkpoints.map((c) => ({ at: c.createdAt, who: c.studentId })),
  ];
  // A day row is stored at UTC midnight of the Tashkent date; noon of that
  // date puts it safely inside the right Tashkent day and week.
  const memberDays = days.map((d) => ({
    at: d.day.getTime() + 7 * 3_600_000,
    who: d.memberId,
  }));
  const studentWeeks = weekly(
    [
      ...work,
      ...students.flatMap((s) =>
        s.lastLoginAt ? [{ at: s.lastLoginAt, who: s.id }] : [],
      ),
    ],
    from,
  );
  const memberWeeks = weekly(memberDays, from);
  const workWeeks = weekly(work, from);

  // The last 7 days against the 7 before them.
  const window = (start: number, end: number) => {
    const inside = (at: Date | number | null) => {
      if (!at) return false;
      const t = new Date(at).getTime();
      return t >= start && t < end;
    };
    const activeStudents = new Set([
      ...work.filter((e) => inside(e.at)).map((e) => e.who),
      ...students.filter((s) => inside(s.lastLoginAt)).map((s) => s.id),
    ]);
    const activeMembers = new Set([
      ...memberDays.filter((e) => inside(e.at)).map((e) => e.who),
      // Before day rows existed only the latest activity was kept.
      ...[...juniors, ...kids]
        .filter((m) => inside(m.lastActiveAt))
        .map((m) => m.id),
    ]);
    return {
      active: activeStudents.size + activeMembers.size,
      answers: submissions.filter((s) => inside(s.createdAt)).length,
      completed: completions.filter((c) => inside(c.completedAt)).length,
      passed: checkpoints.filter(
        (c) => inside(c.createdAt) && checkpointPassed(c),
      ).length,
    };
  };
  const current = window(now - 7 * DAY, now + 1);
  const previous = window(now - 14 * DAY, now - 7 * DAY);

  // Groups side by side; people without a group are left out.
  const month = now - 30 * DAY;
  const week = now - 7 * DAY;
  const activeIds = new Set([
    ...work.filter((e) => new Date(e.at).getTime() >= week).map((e) => e.who),
    ...students
      .filter((s) => s.lastLoginAt && s.lastLoginAt.getTime() >= week)
      .map((s) => s.id),
    ...memberDays.filter((e) => e.at >= week).map((e) => e.who),
    ...[...juniors, ...kids]
      .filter((m) => m.lastActiveAt && m.lastActiveAt.getTime() >= week)
      .map((m) => m.id),
  ]);
  const groupOf = new Map<string, string>([
    ...students.map((s) => [s.id, s.group] as const),
  ]);
  const names = [
    ...new Set(
      [...students, ...juniors, ...kids].map((p) => p.group).filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "uz", { numeric: true }));
  const groups: GroupStats[] = names.map((name) => {
    const s = students.filter((x) => x.group === name);
    const m = [...juniors, ...kids].filter((x) => x.group === name);
    const graded = submissions.filter(
      (x) =>
        groupOf.get(x.studentId) === name &&
        x.createdAt.getTime() >= month &&
        x.maxScore,
    );
    return {
      name,
      students: s.length,
      members: m.length,
      active: [...s, ...m].filter((p) => activeIds.has(p.id)).length,
      completed: s.length ? avg(s.map((x) => x._count.progress)) : null,
      score: avg(graded.map((x) => ((x.score ?? 0) / x.maxScore!) * 100)),
      answers: submissions.filter(
        (x) =>
          groupOf.get(x.studentId) === name && x.createdAt.getTime() >= month,
      ).length,
      xp: m.length ? avg(m.map((x) => x.xp)) : null,
    };
  });

  return {
    from,
    thisWeek,
    people: students.length + juniors.length + kids.length,
    current,
    previous,
    work: workWeeks.counts,
    activeStudents: studentWeeks.people.map((p) => p.size),
    activeMembers: memberWeeks.people.map((p) => p.size),
    groups,
  };
}

export type HistoryItem = {
  at: Date;
  kind: "answer" | "completed" | "checkpoint" | "certificate" | "lab";
  title: string;
  detail: string;
};

/** A student's last 12 weeks by day, and their recent events, newest first. */
export async function studentHistory(
  db: PrismaClient,
  id: string,
  locale: "uz" | "en",
  now = Date.now(),
) {
  const { from } = chartWindow(now);
  const since = new Date(from);
  const [submissions, completions, checkpoints, certificates, labs] =
    await Promise.all([
      db.studentSubmission.findMany({
        where: { studentId: id },
        orderBy: { createdAt: "desc" },
        take: 300,
        select: {
          createdAt: true,
          score: true,
          maxScore: true,
          material: { select: { title: true } },
        },
      }),
      db.studentProgress.findMany({
        where: { studentId: id },
        orderBy: { completedAt: "desc" },
        take: 300,
        select: { completedAt: true, material: { select: { title: true } } },
      }),
      db.studentCheckpoint.findMany({
        where: { studentId: id },
        orderBy: { createdAt: "desc" },
        take: 300,
        select: { createdAt: true, checkpoint: true, score: true, total: true },
      }),
      db.studentCertificate.findMany({
        where: { studentId: id },
        orderBy: { issuedAt: "desc" },
        take: 20,
        select: { issuedAt: true, title: true },
      }),
      db.studentLabProgress.findMany({
        where: { studentId: id },
        select: { updatedAt: true, lab: true, lessons: true },
      }),
    ]);
  const titles = new Map(CHECKPOINT_META.map((c) => [c.id, c.title[locale]]));
  const labNames = new Map(
    LAB_META.map((l) => [l.id as string, l.title[locale]]),
  );
  const items: HistoryItem[] = [
    ...submissions.map((s) => ({
      at: s.createdAt,
      kind: "answer" as const,
      title: s.material.title,
      detail: s.maxScore ? `${s.score ?? 0}/${s.maxScore}` : "",
    })),
    ...completions.map((c) => ({
      at: c.completedAt,
      kind: "completed" as const,
      title: c.material.title,
      detail: "",
    })),
    ...checkpoints.map((c) => ({
      at: c.createdAt,
      kind: "checkpoint" as const,
      title: titles.get(c.checkpoint) ?? c.checkpoint,
      detail: `${c.score}/${c.total}`,
    })),
    ...certificates.map((c) => ({
      at: c.issuedAt,
      kind: "certificate" as const,
      title: c.title,
      detail: "",
    })),
    ...labs.map((l) => ({
      at: l.updatedAt,
      kind: "lab" as const,
      title: labNames.get(l.lab) ?? l.lab,
      detail: String(l.lessons.length),
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());
  return {
    from,
    days: daily(
      items
        .filter((i) => i.kind !== "certificate" && i.at >= since)
        .map((i) => i.at),
      from,
    ),
    items: items.slice(0, 40),
  };
}

/** A Junior or Kids member's active days over the last 12 weeks. */
export async function memberDays(
  db: PrismaClient,
  kind: MemberKind,
  memberId: string,
  now = Date.now(),
) {
  const { from } = chartWindow(now);
  const rows = await db.activityDay.findMany({
    where: { kind, memberId, day: { gte: dayStart(tashkentDay(from)) } },
    select: { day: true, events: true },
  });
  const counts = Array<number>(84).fill(0);
  for (const r of rows) {
    const i = Math.floor((r.day.getTime() + 7 * 3_600_000 - from) / DAY);
    if (i >= 0 && i < counts.length) counts[i] += r.events;
  }
  return { from, days: counts };
}
