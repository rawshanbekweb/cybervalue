import { CASE_MISSION_IDS, MISSION_IDS } from "./content";
import { restoreProgress, type Progress } from "./logic";
import { restoreCipherProgress, type CipherProgress } from "./cipher-content";
import { restoreStory } from "./story";
import { restoreEvents, type Events } from "./badges";
import { dayIndex, restoreDaily } from "./daily";
import { restoreCodename, xpFor } from "./rank";
import { CIPHERS, type CipherId } from "./cipher-content";
import {
  cipherLevelOpen,
  dailyPassed,
  exercisePassed,
  MISSION_STAGE,
  missionPassed,
  missionStageOpen,
} from "./verify";
import type { MissionId } from "./content";

// A Junior member's whole state, as stored on their account. Every part is
// re-validated whenever it is read or written, so neither a stale browser nor
// a hand-made request can store anything a real run could not produce.

export type JuniorProgress = {
  missions: Progress;
  ciphers: CipherProgress;
  story: boolean;
  events: Events;
  daily: number[];
  /**
   * The codename, the last rank already celebrated, and whether the
   * first-visit tour was shown.
   */
  agent: { name: string; rank: number; tour: boolean };
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
      return { name: restoreCodename(value), rank, tour: value.tour === true };
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

/** What the browser sends with a step it claims: see ./verify.ts. */
export type JuniorProof = {
  missions?: Record<string, unknown>;
  answers?: Record<string, Record<string, unknown>>;
  daily?: unknown;
};

const proofRecord = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

/**
 * Saves one part, like withPart, but a new step is only accepted with
 * evidence that solves it and when its stage is open. Taking steps back (a
 * restart) needs nothing. Null when something claimed is not proven.
 */
export function applyJuniorPart(
  progress: JuniorProgress,
  part: string,
  value: unknown,
  rawProof: unknown,
  now = Date.now(),
): JuniorProgress | null {
  const next = withPart(progress, part, value, now);
  if (!next) return null;
  const proof = proofRecord(rawProof) as JuniorProof;
  if (part === "missions") {
    const added = (Object.keys(next.missions) as MissionId[]).filter(
      (id) => !progress.missions[id],
    );
    const evidence = proofRecord(proof.missions);
    for (const id of added)
      if (
        !missionStageOpen(MISSION_STAGE[id], progress.missions) ||
        !missionPassed(id, evidence[id])
      )
        return null;
    // The case is closed only with its missions done; a restart reopens it.
    next.story = next.story && CASE_DONE(next.missions);
  }
  if (part === "ciphers") {
    const answers = proofRecord(proof.answers);
    for (const cipher of CIPHERS) {
      const before = new Set(progress.ciphers[cipher.id] ?? []);
      const added = (next.ciphers[cipher.id] ?? []).filter(
        (i) => !before.has(i),
      );
      if (!added.length) continue;
      if (!cipherLevelOpen(cipher.level, progress.ciphers)) return null;
      const given = proofRecord(answers[cipher.id]);
      for (const index of added)
        if (!exercisePassed(cipher.id as CipherId, index, given[index]))
          return null;
    }
  }
  if (part === "daily") {
    const today = dayIndex(now);
    const added = next.daily.filter((day) => !progress.daily.includes(day));
    // Only today's puzzle can be solved, and only with its answer.
    if (added.some((day) => day !== today)) return null;
    if (added.length && !dailyPassed(today, proof.daily)) return null;
    // Solved days are never taken back.
    next.daily = [...new Set([...progress.daily, ...next.daily])];
  }
  if (part === "story" && next.story && !CASE_DONE(next.missions)) return null;
  return next;
}

const CASE_DONE = (missions: Progress) =>
  CASE_MISSION_IDS.every((id) => missions[id]);

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
