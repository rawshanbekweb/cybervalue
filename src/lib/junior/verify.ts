// What a Junior member must show before the server records a step: the
// answers to a mission, a cipher exercise or today's puzzle. The same checks
// run in the browser, so an honest member never notices them; a hand-made
// request that claims a step without solving it is refused.
//
// Missions and ciphers also open in three stages, each after the one before.
import { MISSIONS, type MissionId } from "./content";
import {
  CTF_FLAGS,
  CIPHER_ANSWER,
  ETHICS,
  FOOTPRINT,
  PHISHING,
  PHISHING_PASS,
} from "./content";
import { CIPHERS, type CipherId, type CipherProgress } from "./cipher-content";
import { sameAnswer } from "./ciphers";
import { puzzleFor } from "./daily";
import { normalizeAnswer, type Progress } from "./logic";

export type Stage = 1 | 2 | 3;

/** Missions in pairs: the basics, reading clues, then thinking like a pro. */
export const MISSION_STAGE: Record<MissionId, Stage> = {
  password: 1,
  phishing: 1,
  cipher: 2,
  footprint: 2,
  ctf: 3,
  ethics: 3,
};

export type MissionEvidence =
  // The password itself never leaves the browser, so this one is taken on
  // trust: the lesson is precisely that a password is not sent anywhere.
  | { mission: "password" }
  | { mission: "phishing"; answers: Record<string, boolean> }
  | { mission: "cipher"; answer: string }
  | { mission: "footprint"; marked: Record<string, boolean> }
  | { mission: "ctf"; flags: Record<string, string> }
  | { mission: "ethics"; answers: Record<string, boolean> };

const record = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

/** Whether the evidence solves the mission, checked like the panel does. */
export function missionPassed(id: MissionId, raw: unknown) {
  const evidence = record(raw);
  if (evidence.mission !== id) return false;
  switch (id) {
    case "password":
      return true;
    case "phishing": {
      const answers = record(evidence.answers);
      return (
        PHISHING.filter((item) => answers[item.id] === item.phishing).length >=
        PHISHING_PASS
      );
    }
    case "cipher":
      return (
        typeof evidence.answer === "string" &&
        normalizeAnswer(evidence.answer) === CIPHER_ANSWER
      );
    case "footprint": {
      const marked = record(evidence.marked);
      return FOOTPRINT.every((item) => Boolean(marked[item.id]) === item.risky);
    }
    case "ctf": {
      const flags = record(evidence.flags);
      return CTF_FLAGS.every(
        (flag) =>
          typeof flags[flag.id] === "string" &&
          normalizeAnswer(flags[flag.id] as string) ===
            normalizeAnswer(flag.flag),
      );
    }
    case "ethics": {
      const answers = record(evidence.answers);
      return ETHICS.every((item) => answers[item.id] === item.allowed);
    }
  }
}

/**
 * A mission stage is open once every mission of the stage before is done,
 * or when the member already finished something in it.
 */
export function missionStageOpen(stage: Stage, missions: Progress) {
  const inStage = (s: Stage) =>
    MISSIONS.filter((m) => MISSION_STAGE[m.id] === s);
  if (stage === 1 || inStage(stage).some((m) => missions[m.id])) return true;
  return inStage((stage - 1) as Stage).every((m) => missions[m.id]);
}

/** Share of a cipher level's exercises that opens the next level. */
export const LEVEL_OPENS_AT = 0.6;

const levelExercises = (level: number) =>
  CIPHERS.filter((c) => c.level === level).reduce(
    (n, c) => n + c.exercises.length,
    0,
  );

export function levelSolved(level: number, ciphers: CipherProgress) {
  return CIPHERS.filter((c) => c.level === level).reduce(
    (n, c) => n + (ciphers[c.id]?.length ?? 0),
    0,
  );
}

/**
 * Cipher level 1 is always open; a higher level opens once 60% of the
 * level below is solved, or when the member already solved something in it.
 */
export function cipherLevelOpen(level: number, ciphers: CipherProgress) {
  if (level <= 1) return true;
  if (CIPHERS.some((c) => c.level === level && ciphers[c.id]?.length))
    return true;
  return (
    levelSolved(level - 1, ciphers) >=
    Math.ceil(levelExercises(level - 1) * LEVEL_OPENS_AT)
  );
}

/** How many more exercises of the level below open this level. */
export function exercisesToOpen(level: number, ciphers: CipherProgress) {
  return Math.max(
    0,
    Math.ceil(levelExercises(level - 1) * LEVEL_OPENS_AT) -
      levelSolved(level - 1, ciphers),
  );
}

export function exercisePassed(cipher: CipherId, index: number, raw: unknown) {
  const exercise = CIPHERS.find((c) => c.id === cipher)?.exercises[index];
  return (
    exercise !== undefined &&
    typeof raw === "string" &&
    raw.length <= 200 &&
    sameAnswer(exercise.format, raw, exercise.answer)
  );
}

/** Today's puzzle, answered in either language. */
export function dailyPassed(day: number, raw: unknown) {
  if (typeof raw !== "string" || raw.length > 200) return false;
  return (["uz", "en"] as const).some((locale) => {
    const puzzle = puzzleFor(day, locale);
    return sameAnswer(puzzle.format, raw, puzzle.answer);
  });
}

/** The longest run of consecutive solved days. */
export function bestStreak(days: readonly number[]) {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  sorted.forEach((day, i) => {
    run = i > 0 && sorted[i - 1] === day - 1 ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
}
