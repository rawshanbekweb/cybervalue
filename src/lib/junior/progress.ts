import { MISSION_IDS } from "./content";
import { restoreProgress, type Progress } from "./logic";
import { restoreCipherProgress, type CipherProgress } from "./cipher-content";
import { restoreStory } from "./story";
import { restoreEvents, type Events } from "./badges";
import { dayIndex, restoreDaily } from "./daily";
import { restoreCodename, xpFor } from "./rank";

// A Junior member's whole state, as stored on their account. Every part is
// re-validated whenever it is read or written, so neither a stale browser nor
// a hand-made request can store anything a real run could not produce.

export type JuniorProgress = {
  missions: Progress;
  ciphers: CipherProgress;
  story: boolean;
  events: Events;
  daily: number[];
  /** The codename and the last rank already celebrated. */
  agent: { name: string; rank: number };
};

export const PROGRESS_PARTS = [
  "missions",
  "ciphers",
  "story",
  "events",
  "daily",
  "agent",
] as const;
export type ProgressPart = (typeof PROGRESS_PARTS)[number];

// The daily puzzle started with this release; no solved day can be older.
const FIRST_DAY = dayIndex(Date.UTC(2026, 9, 16));

function restorePart(part: ProgressPart, raw: unknown, now: number) {
  switch (part) {
    case "missions":
      return restoreProgress(raw, MISSION_IDS);
    case "ciphers":
      return restoreCipherProgress(raw);
    case "story":
      return restoreStory(raw) || raw === true;
    case "events":
      return restoreEvents(raw);
    case "daily": {
      const today = dayIndex(now);
      return restoreDaily(Array.isArray(raw) ? { days: raw } : raw).filter(
        (day) => day >= FIRST_DAY && day <= today,
      );
    }
    case "agent": {
      const value =
        raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
      const rank =
        typeof value.rank === "number" && Number.isInteger(value.rank)
          ? Math.min(Math.max(value.rank, 0), 10)
          : 0;
      return { name: restoreCodename(value), rank };
    }
  }
}

export function restoreJuniorProgress(
  raw: unknown,
  now = Date.now(),
): JuniorProgress {
  const value =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  return Object.fromEntries(
    PROGRESS_PARTS.map((part) => [part, restorePart(part, value[part], now)]),
  ) as JuniorProgress;
}

/** Replaces one part, validated; unknown parts are refused. */
export function withPart(
  progress: JuniorProgress,
  part: string,
  value: unknown,
  now = Date.now(),
): JuniorProgress | null {
  if (!(PROGRESS_PARTS as readonly string[]).includes(part)) return null;
  return {
    ...progress,
    [part]: restorePart(part as ProgressPart, value, now),
  };
}

export function exercisesOf(progress: JuniorProgress) {
  return Object.values(progress.ciphers).reduce(
    (sum, list) => sum + (list?.length ?? 0),
    0,
  );
}

export function xpOf(progress: JuniorProgress) {
  return xpFor({
    missions: Object.keys(progress.missions).length,
    exercises: exercisesOf(progress),
    daily: progress.daily.length,
    story: progress.story,
  });
}

/** How a member is shown to classmates: codename, or first name and initial. */
export function rankingName(member: { name: string; codename: string }) {
  if (member.codename) return member.codename;
  const [first = "", second = ""] = member.name.trim().split(/\s+/);
  return second ? `${first} ${second[0]}.` : first;
}
