import { z } from "zod";
import { BADGES } from "./badges";
import { CIPHERS, TOTAL_EXERCISES } from "./cipher-content";
import { MISSIONS } from "./content";
import { dayIndex, streak } from "./daily";
import { bestStreak } from "./verify";
import { exercisesOf, restoreJuniorProgress, xpOf } from "./progress";
import { rankFor } from "./rank";
import { juniorStages } from "./summary";
import { toCsv } from "../student/results";

// What a teacher sees about one member, worked out from their saved progress.
export function summarizeMember(raw: unknown, now = Date.now()) {
  const progress = restoreJuniorProgress(raw, now);
  const today = dayIndex(now);
  const xp = xpOf(progress);
  const { index, rank } = rankFor(xp);
  const missions = Object.keys(progress.missions).length;
  const days = streak(progress.daily, today);
  const badges = BADGES.filter((badge) =>
    badge.earned({
      missions,
      missionTotal: MISSIONS.length,
      done: progress.missions,
      phishing: Boolean(progress.missions.phishing),
      ciphers: progress.ciphers,
      story: progress.story,
      events: progress.events,
      streak: bestStreak(progress.daily),
      rank: index,
    }),
  ).map((badge) => badge.id);
  return {
    progress,
    xp,
    rank,
    rankIndex: index,
    missions,
    exercises: exercisesOf(progress),
    story: progress.story,
    daily: progress.daily.length,
    streak: days,
    badges,
    stages: juniorStages(progress.missions, progress.ciphers),
    ciphers: CIPHERS.map((cipher) => ({
      id: cipher.id,
      title: cipher.title,
      level: cipher.level,
      solved: progress.ciphers[cipher.id]?.length ?? 0,
      total: cipher.exercises.length,
    })),
  };
}

const groupName = z
  .string()
  .trim()
  .max(40)
  .regex(/^[\p{L}\p{N} ._-]*$/u);

// An empty date means the access never expires; a date ends at midnight
// Tashkent time (UTC+5).
const expiry = z
  .union([z.literal(""), z.iso.date()])
  .transform((value) =>
    value ? new Date(`${value}T23:59:59.999+05:00`) : null,
  );

export const juniorUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  group: groupName,
  note: z.string().trim().max(2000),
  active: z.boolean(),
  expiresAt: expiry,
});

export type JuniorRecord = {
  id: string;
  name: string;
  group: string;
  codename: string;
  active: boolean;
  expiresAt: Date | null;
  progress: unknown;
  lastLoginAt: Date | null;
  lastActiveAt: Date | null;
  createdAt: Date;
};

export type JuniorStatus = "active" | "blocked" | "expired";

export function statusOf(
  member: Pick<JuniorRecord, "active" | "expiresAt">,
  now = Date.now(),
): JuniorStatus {
  if (!member.active) return "blocked";
  if (member.expiresAt && member.expiresAt.getTime() <= now) return "expired";
  return "active";
}

/** One table row per member, with the numbers a teacher compares. */
export function juniorRow(member: JuniorRecord, now = Date.now()) {
  const summary = summarizeMember(member.progress, now);
  return {
    id: member.id,
    name: member.name,
    group: member.group,
    codename: member.codename,
    status: statusOf(member, now),
    lastLoginAt: member.lastLoginAt,
    lastActiveAt: member.lastActiveAt,
    createdAt: member.createdAt,
    ...summary,
  };
}

export type JuniorRow = ReturnType<typeof juniorRow>;

/** Group overview: members, how many were active lately, average XP. */
export function groupStats(rows: JuniorRow[], now = Date.now()) {
  const week = now - 7 * 86_400_000;
  const groups = new Map<
    string,
    { group: string; members: number; active: number; xp: number }
  >();
  for (const row of rows) {
    const entry = groups.get(row.group) ?? {
      group: row.group,
      members: 0,
      active: 0,
      xp: 0,
    };
    entry.members++;
    entry.xp += row.xp;
    if (row.lastActiveAt && row.lastActiveAt.getTime() >= week) entry.active++;
    groups.set(row.group, entry);
  }
  return [...groups.values()]
    .map((g) => ({ ...g, averageXp: Math.round(g.xp / g.members) }))
    .sort(
      (a, b) => b.averageXp - a.averageXp || a.group.localeCompare(b.group),
    );
}

const STATUS_LABEL: Record<JuniorStatus, string> = {
  active: "Active",
  blocked: "Blocked",
  expired: "Expired",
};

export function juniorCsv(
  rows: JuniorRow[],
  t: (source: string) => string,
  locale: "uz" | "en",
) {
  const day = (date: Date | null) =>
    date ? date.toISOString().slice(0, 10) : "";
  return toCsv([
    [
      t("Name"),
      t("Group"),
      t("Codename"),
      "Status",
      t("Rank"),
      "XP",
      t("Missions"),
      t("Exercises"),
      t("Case solved"),
      t("Daily puzzles"),
      t("Streak"),
      t("Badges"),
      ...CIPHERS.map((cipher) => cipher.title[locale]),
      t("Last sign-in"),
      t("Last activity"),
    ],
    ...rows.map((row) => [
      row.name,
      row.group,
      row.codename,
      t(STATUS_LABEL[row.status]),
      row.rank.title[locale],
      row.xp,
      `${row.missions}/${MISSIONS.length}`,
      `${row.exercises}/${TOTAL_EXERCISES}`,
      row.story ? t("Yes") : t("No"),
      row.daily,
      row.streak,
      row.badges.length,
      ...row.ciphers.map((c) => `${c.solved}/${c.total}`),
      day(row.lastLoginAt),
      day(row.lastActiveAt),
    ]),
  ]);
}
