// Competition rules for CTF Challenges that need no database: the phase of a
// competition, flag checking, dynamic challenge values and the standings.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const CATEGORIES = [
  "Crypto",
  "Web",
  "Forensics",
  "OSINT",
  "Stego",
  "Reverse",
  "Pwn",
  "Misc",
] as const;

export type EventTimes = {
  startsAt: Date;
  endsAt: Date;
  registrationEndsAt: Date | null;
  freezeAt: Date | null;
};

export type Phase = "upcoming" | "running" | "ended";

export function phaseOf(
  event: Pick<EventTimes, "startsAt" | "endsAt">,
  now = new Date(),
): Phase {
  if (now < event.startsAt) return "upcoming";
  if (now < event.endsAt) return "running";
  return "ended";
}

/** Registration stays open until registrationEndsAt, or the end. */
export function registrationOpen(event: EventTimes, now = new Date()) {
  return now < (event.registrationEndsAt ?? event.endsAt) && now < event.endsAt;
}

/** The scoreboard counts solves up to this time for the public (null: all). */
export function scoreboardCutoff(event: EventTimes, now = new Date()) {
  if (!event.freezeAt || now < event.freezeAt || now >= event.endsAt)
    return null;
  return event.freezeAt;
}

// Flags --------------------------------------------------------------------

export const newFlagSalt = () => randomBytes(16).toString("hex");

const normalizeFlag = (flag: string, caseSensitive: boolean) => {
  const trimmed = flag.normalize("NFC").trim();
  return caseSensitive ? trimmed : trimmed.toLowerCase();
};

export function flagDigest(salt: string, flag: string, caseSensitive: boolean) {
  return createHash("sha256")
    .update(`${salt}:${normalizeFlag(flag, caseSensitive)}`)
    .digest("hex");
}

export function flagMatches(
  challenge: { flagSalt: string; flagHash: string; caseSensitive: boolean },
  attempt: string,
) {
  const actual = Buffer.from(
    flagDigest(challenge.flagSalt, attempt, challenge.caseSensitive),
    "hex",
  );
  const expected = Buffer.from(challenge.flagHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** A digest of what was typed, to spot one wrong answer shared by teams. */
export const attemptDigest = (challengeId: string, attempt: string) =>
  createHash("sha256")
    .update(`${challengeId}:${attempt.normalize("NFC").trim()}`)
    .digest("hex");

// Scoring ------------------------------------------------------------------

export type ValueRule = {
  initialPoints: number;
  minimumPoints: number;
  decay: number;
};

/**
 * Dynamic value (the CTFd curve): the first solver's value falls along a
 * parabola to minimumPoints after `decay` solves and stays there. Every
 * entrant who solved the challenge gets its current value.
 */
export function challengeValue(rule: ValueRule, solves: number) {
  const { initialPoints: initial, minimumPoints: minimum } = rule;
  if (solves <= 1 || rule.decay <= 0 || minimum >= initial) return initial;
  const value =
    ((minimum - initial) / (rule.decay * rule.decay)) * (solves - 1) ** 2 +
    initial;
  return Math.max(minimum, Math.ceil(value));
}

export type Solve = { entrantId: string; challengeId: string; at: Date };
export type Unlock = { entrantId: string; cost: number; at: Date };
export type Standing = {
  entrantId: string;
  score: number;
  solved: number;
  lastSolveAt: Date | null;
  rank: number;
};

/**
 * Ranks entrants by score; a tie goes to the one who reached it first (the
 * earlier last solve). Only solves and hint costs up to `cutoff` count.
 */
export function standings(
  entrantIds: string[],
  challenges: Map<string, ValueRule>,
  solves: Solve[],
  unlocks: Unlock[],
  cutoff: Date | null = null,
): Standing[] {
  const counted = cutoff ? solves.filter((s) => s.at <= cutoff) : solves;
  const solveCount = new Map<string, number>();
  for (const s of counted)
    solveCount.set(s.challengeId, (solveCount.get(s.challengeId) ?? 0) + 1);
  const value = new Map(
    [...challenges].map(([id, rule]) => [
      id,
      challengeValue(rule, solveCount.get(id) ?? 0),
    ]),
  );
  const rows = new Map<string, Omit<Standing, "rank">>(
    entrantIds.map((id) => [
      id,
      { entrantId: id, score: 0, solved: 0, lastSolveAt: null },
    ]),
  );
  for (const s of counted) {
    const row = rows.get(s.entrantId);
    const points = value.get(s.challengeId);
    if (!row || points === undefined) continue;
    row.score += points;
    row.solved += 1;
    if (!row.lastSolveAt || s.at > row.lastSolveAt) row.lastSolveAt = s.at;
  }
  for (const u of unlocks) {
    if (cutoff && u.at > cutoff) continue;
    const row = rows.get(u.entrantId);
    if (row) row.score -= u.cost;
  }
  const sorted = [...rows.values()].sort(
    (a, b) =>
      b.score - a.score ||
      (a.lastSolveAt?.getTime() ?? Infinity) -
        (b.lastSolveAt?.getTime() ?? Infinity) ||
      a.entrantId.localeCompare(b.entrantId),
  );
  return sorted.map((row, i) => ({ ...row, rank: i + 1 }));
}

/** Slugs that would hide the area's own pages under /challenges/<slug>. */
export const RESERVED_SLUGS = new Set([
  "login",
  "register",
  "verify",
  "forgot",
  "reset",
  "account",
  "rules",
  "team",
  "files",
]);

export const slugPattern = /^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/;

// Times are entered and shown in Tashkent time (UTC+5, no daylight saving).
const LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
export function parseTashkent(value: string) {
  if (!LOCAL.test(value)) return null;
  const date = new Date(`${value}:00+05:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
export function tashkentInput(date: Date) {
  return new Date(date.getTime() + 5 * 3_600_000).toISOString().slice(0, 16);
}
