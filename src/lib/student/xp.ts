// Student motivation: XP, ranks, badges and weekly activity, worked out from
// what the student has already done. Pure, so the student page, the ranking
// and the teacher's class panel all agree, and tests can pin the rules.
import type { Text } from "../network/ip";
import { CHECKPOINT_META } from "../checkpoints/meta";
import { isEntranceExam } from "./levels";

export type XpMaterial = { id: string; slug: string; kind: string };
export type XpInput = {
  // Materials visible to the student.
  materials: XpMaterial[];
  progress: { materialId: string; completedAt: Date }[];
  submissions: {
    materialId: string;
    score: number | null;
    maxScore: number | null;
    createdAt: Date;
  }[];
  checkpoints: {
    checkpoint: string;
    score: number;
    total: number;
    createdAt: Date;
  }[];
  // Completed lessons in the open labs, synced from the browser.
  labs?: { lab: string; lessons: number[] }[];
  // XP carried over from Academy Junior.
  bonus?: number;
};

export const XP = {
  read: 20, // a lesson or lab marked complete
  practice: 30, // a practice answer handed in
  challenge: 100, // a personal lab solved
  // Tests give their best percent (up to 100) and checkpoints 60% of theirs.
  checkpointShare: 0.6,
  labLesson: 5, // each lesson finished in an open lab
} as const;

export const RANKS: readonly { xp: number; title: Text }[] = [
  { xp: 0, title: { uz: "Stajyor", en: "Trainee" } },
  { xp: 150, title: { uz: "Kuzatuvchi", en: "Observer" } },
  { xp: 400, title: { uz: "Tahlilchi", en: "Analyst" } },
  { xp: 800, title: { uz: "Himoyachi", en: "Defender" } },
  { xp: 1400, title: { uz: "Tahdid ovchisi", en: "Threat hunter" } },
  { xp: 2200, title: { uz: "Mutaxassis", en: "Specialist" } },
  { xp: 3200, title: { uz: "Ekspert", en: "Expert" } },
];

export function rankOf(xp: number) {
  let index = 0;
  RANKS.forEach((rank, i) => {
    if (xp >= rank.xp) index = i;
  });
  const next = RANKS[index + 1] ?? null;
  return {
    index,
    rank: RANKS[index],
    next,
    progress: next ? (xp - RANKS[index].xp) / (next.xp - RANKS[index].xp) : 1,
  };
}

export type BadgeIcon =
  | "footprints"
  | "layers"
  | "target"
  | "clipboard"
  | "flag"
  | "swords"
  | "check"
  | "shield"
  | "door"
  | "flame"
  | "half"
  | "crown";

type Facts = {
  done: number;
  available: number;
  perfect: boolean;
  tests: number;
  challenges: number;
  checkpointsPassed: number;
  entranceDone: boolean;
  streakWeeks: number;
};

export const STUDENT_BADGES: readonly {
  id: string;
  icon: BadgeIcon;
  title: Text;
  how: Text;
  earned: (f: Facts) => boolean;
}[] = [
  {
    id: "first",
    icon: "footprints",
    title: { uz: "Birinchi qadam", en: "First step" },
    how: { uz: "Bitta materialni tugating", en: "Finish one material" },
    earned: (f) => f.done >= 1,
  },
  {
    id: "five",
    icon: "layers",
    title: { uz: "Ritmda", en: "In the rhythm" },
    how: { uz: "5 ta materialni tugating", en: "Finish 5 materials" },
    earned: (f) => f.done >= 5,
  },
  {
    id: "entrance",
    icon: "door",
    title: { uz: "Eshik ochildi", en: "Through the door" },
    how: {
      uz: "Kirish sinovini to‘liq topshiring",
      en: "Complete the entrance exam",
    },
    earned: (f) => f.entranceDone,
  },
  {
    id: "tests",
    icon: "clipboard",
    title: { uz: "Sinovchi", en: "Test taker" },
    how: { uz: "3 ta testni topshiring", en: "Take 3 tests" },
    earned: (f) => f.tests >= 3,
  },
  {
    id: "perfect",
    icon: "target",
    title: { uz: "Mukammal natija", en: "Perfect score" },
    how: { uz: "Biror testda 100% oling", en: "Score 100% on a test" },
    earned: (f) => f.perfect,
  },
  {
    id: "flag",
    icon: "flag",
    title: { uz: "Birinchi flag", en: "First flag" },
    how: { uz: "Shaxsiy labni yeching", en: "Solve a personal lab" },
    earned: (f) => f.challenges >= 1,
  },
  {
    id: "ctf",
    icon: "swords",
    title: { uz: "CTF jangchisi", en: "CTF fighter" },
    how: { uz: "3 ta shaxsiy labni yeching", en: "Solve 3 personal labs" },
    earned: (f) => f.challenges >= 3,
  },
  {
    id: "checkpoint",
    icon: "check",
    title: { uz: "Nazoratdan o‘tdi", en: "Checkpoint cleared" },
    how: { uz: "Bitta lab nazoratidan o‘ting", en: "Pass one lab checkpoint" },
    earned: (f) => f.checkpointsPassed >= 1,
  },
  {
    id: "all-checkpoints",
    icon: "shield",
    title: { uz: "Laboratoriya ustasi", en: "Lab master" },
    how: {
      uz: "Barcha lab nazoratlaridan o‘ting",
      en: "Pass every lab checkpoint",
    },
    earned: (f) => f.checkpointsPassed >= CHECKPOINT_META.length,
  },
  {
    id: "streak",
    icon: "flame",
    title: { uz: "3 hafta ketma-ket", en: "3-week streak" },
    how: {
      uz: "3 hafta ketma-ket faol bo‘ling",
      en: "Be active 3 weeks in a row",
    },
    earned: (f) => f.streakWeeks >= 3,
  },
  {
    id: "half",
    icon: "half",
    title: { uz: "Yarim yo‘l", en: "Halfway" },
    how: {
      uz: "Materiallarning yarmini tugating",
      en: "Finish half of your materials",
    },
    earned: (f) => f.available > 0 && f.done * 2 >= f.available,
  },
  {
    id: "all",
    icon: "crown",
    title: { uz: "Hammasi bajarildi", en: "All done" },
    how: { uz: "Barcha materiallarni tugating", en: "Finish every material" },
    earned: (f) => f.available > 0 && f.done >= f.available,
  },
];

const DAY = 86_400_000;
// Weeks start on Monday, Tashkent time (UTC+5).
const TASHKENT = 5 * 3_600_000;
export const weekIndex = (time: number) =>
  Math.floor((time + TASHKENT - 4 * DAY) / (7 * DAY));
export const dayIndex = (time: number) => Math.floor((time + TASHKENT) / DAY);

export const WEEKLY_GOAL = 3;

export function standing(input: XpInput, now = Date.now()) {
  const kind = new Map(input.materials.map((m) => [m.id, m.kind]));
  const visible = (id: string) => kind.has(id);
  const progress = input.progress.filter((p) => visible(p.materialId));
  const submissions = input.submissions.filter((s) => visible(s.materialId));

  const solved = new Set(progress.map((p) => p.materialId));
  // Same notion of "done" as the student page: a practice or test counts once
  // handed in, a personal lab once solved.
  const done = new Set(solved);
  for (const s of submissions)
    if (kind.get(s.materialId) !== "CHALLENGE") done.add(s.materialId);

  const best = new Map<string, number>();
  for (const s of submissions)
    if (kind.get(s.materialId) === "QUIZ" && s.score !== null && s.maxScore)
      best.set(
        s.materialId,
        Math.max(
          best.get(s.materialId) ?? 0,
          Math.round((s.score / s.maxScore) * 100),
        ),
      );

  const checkpointBest = new Map<string, number>();
  for (const c of input.checkpoints)
    checkpointBest.set(
      c.checkpoint,
      Math.max(
        checkpointBest.get(c.checkpoint) ?? 0,
        Math.round((c.score / c.total) * 100),
      ),
    );

  let xp = 0;
  for (const id of done) {
    const k = kind.get(id);
    if (k === "LESSON" || k === "LAB") xp += XP.read;
    else if (k === "PRACTICE") xp += XP.practice;
    else if (k === "CHALLENGE") xp += solved.has(id) ? XP.challenge : 0;
  }
  for (const percent of best.values()) xp += percent;
  for (const percent of checkpointBest.values())
    xp += Math.round(percent * XP.checkpointShare);
  const labs = Object.fromEntries(
    (input.labs ?? []).map((l) => [l.lab, new Set(l.lessons).size]),
  );
  for (const count of Object.values(labs)) xp += count * XP.labLesson;
  xp += Math.max(0, input.bonus ?? 0);

  const challenges = input.materials.filter(
    (m) => m.kind === "CHALLENGE" && solved.has(m.id),
  ).length;
  const entrance = input.materials.filter((m) => isEntranceExam(m.slug));
  const passed = CHECKPOINT_META.filter(
    (c) => (checkpointBest.get(c.id) ?? 0) >= c.pass,
  ).length;

  // Activity: every completion, submission and checkpoint attempt.
  const times = [
    ...progress.map((p) => p.completedAt.getTime()),
    ...submissions.map((s) => s.createdAt.getTime()),
    ...input.checkpoints.map((c) => c.createdAt.getTime()),
  ].filter((t) => t <= now);
  const thisWeek = weekIndex(now);
  const weeks = new Set(times.map(weekIndex));
  // A streak still counts while this week is not over yet.
  let streakWeeks = 0;
  for (let w = weeks.has(thisWeek) ? thisWeek : thisWeek - 1; weeks.has(w); w--)
    streakWeeks++;
  const today = dayIndex(now);
  const days = Array.from({ length: 14 }, (_, i) => {
    const day = today - 13 + i;
    return times.filter((t) => dayIndex(t) === day).length;
  });

  const facts: Facts = {
    done: done.size,
    available: input.materials.length,
    perfect: [...best.values()].some((p) => p === 100),
    tests: best.size,
    challenges,
    checkpointsPassed: passed,
    entranceDone: entrance.length > 0 && entrance.every((m) => done.has(m.id)),
    streakWeeks,
  };
  const last = times.length ? Math.max(...times) : null;
  return {
    xp,
    ...rankOf(xp),
    done: done.size,
    available: input.materials.length,
    tests: [...best.values()],
    average: best.size
      ? Math.round([...best.values()].reduce((a, b) => a + b, 0) / best.size)
      : null,
    checkpoints: Object.fromEntries(checkpointBest),
    labs: labs as Record<string, number>,
    checkpointsPassed: passed,
    badges: STUDENT_BADGES.filter((b) => b.earned(facts)).map((b) => b.id),
    week: times.filter((t) => weekIndex(t) === thisWeek).length,
    streakWeeks,
    days,
    lastActive: last === null ? null : new Date(last),
  };
}

export type Standing = ReturnType<typeof standing>;
export type WeeklyStanding = Standing & { weekXp: number; lastWeekXp: number };

/** First name and initial, as shown to classmates. */
export function publicName(name: string) {
  const [first, second] = name.trim().split(/\s+/);
  return second ? `${first} ${second[0]}.` : first;
}

// Monday 00:00 in Tashkent of the week `time` falls in.
export const weekStart = (time: number) =>
  weekIndex(time) * 7 * DAY + 4 * DAY - TASHKENT;

// XP from materials, tests, personal labs and checkpoints recorded before
// `until`. Lab lessons have no dates and the Junior bonus is not earned in a
// week, so both are left out.
function earnedBefore(input: XpInput, until: number) {
  const before = (date: Date) => date.getTime() < until;
  return standing({
    materials: input.materials,
    progress: input.progress.filter((p) => before(p.completedAt)),
    submissions: input.submissions.filter((s) => before(s.createdAt)),
    checkpoints: input.checkpoints.filter((c) => before(c.createdAt)),
  }).xp;
}

/** XP earned this week and last week, for the "Hero of the week". */
export function weeklyXp(input: XpInput, now = Date.now()) {
  const thisWeek = weekStart(now);
  const lastWeek = thisWeek - 7 * DAY;
  const total = earnedBefore(input, Infinity);
  const beforeThis = earnedBefore(input, thisWeek);
  return {
    week: total - beforeThis,
    lastWeek: beforeThis - earnedBefore(input, lastWeek),
  };
}

/** The top of a week: highest XP first, ties by name, zero scores left out. */
export function heroes<T extends { name: string; xp: number }>(
  rows: T[],
  limit = 3,
) {
  return rows
    .filter((r) => r.xp > 0)
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name))
    .slice(0, limit);
}
