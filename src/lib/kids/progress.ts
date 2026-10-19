// A Kids member's saved state. It is re-validated on every read and write,
// and a code mission is only accepted when the code really passes its check.
import {
  ALL_MISSIONS,
  compile,
  GAME_IDS,
  GAMES,
  isGameId,
  MAX_XP,
  gameOpen,
  missionKey,
  passwordOpens,
  stageOf,
  stageOpen,
  type GameId,
} from "./games";
import type { Text } from "./lang";
import { tashkentDay } from "../admin/activity";
import {
  DAILY_XP,
  dailyPassed,
  dailyTask,
  nextDaily,
  type Daily,
} from "./extras";

export type KidsProgress = {
  /** Finished missions as "game:mission". */
  done: string[];
  /** Best score per game. */
  best: Record<GameId, number>;
  /** The last code the child ran per game, so they carry on where they were. */
  code: Record<GameId, string>;
  daily: Daily;
  /** Whether the first-visit tour of the game lab was shown. */
  tour: boolean;
};

const KEYS = new Set(ALL_MISSIONS.map((m) => missionKey(m.game, m.mission.id)));
const MAX_SCORE = 1_000_000;
export const MAX_CODE = 4000;

export const emptyKidsProgress = (): KidsProgress => ({
  done: [],
  best: Object.fromEntries(GAME_IDS.map((id) => [id, 0])) as Record<
    GameId,
    number
  >,
  code: Object.fromEntries(GAME_IDS.map((id) => [id, ""])) as Record<
    GameId,
    string
  >,
  daily: { last: "", streak: 0, record: 0, count: 0 },
  tour: false,
});

const count = (value: unknown, max: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(Math.max(Math.floor(value), 0), max)
    : 0;

export function restoreKidsProgress(raw: unknown): KidsProgress {
  const value =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const progress = emptyKidsProgress();
  if (Array.isArray(value.done))
    progress.done = [
      ...new Set(
        value.done.filter(
          (key): key is string => typeof key === "string" && KEYS.has(key),
        ),
      ),
    ];
  const best = (value.best ?? {}) as Record<string, unknown>;
  const code = (value.code ?? {}) as Record<string, unknown>;
  for (const id of GAME_IDS) {
    const score = best[id];
    if (typeof score === "number" && Number.isFinite(score))
      progress.best[id] = Math.min(Math.max(Math.floor(score), 0), MAX_SCORE);
    if (typeof code[id] === "string")
      progress.code[id] = (code[id] as string).slice(0, MAX_CODE);
  }
  const daily = (value.daily ?? {}) as Record<string, unknown>;
  if (typeof daily.last === "string" && /^\d{4}-\d{2}-\d{2}$/.test(daily.last))
    progress.daily = {
      last: daily.last,
      streak: count(daily.streak, 10_000),
      record: count(daily.record, 10_000),
      count: count(daily.count, 10_000),
    };
  progress.tour = value.tour === true;
  return progress;
}

export function kidsXp(progress: KidsProgress) {
  return (
    ALL_MISSIONS.filter((m) =>
      progress.done.includes(missionKey(m.game, m.mission.id)),
    ).reduce((sum, m) => sum + m.mission.xp, 0) +
    progress.daily.count * DAILY_XP
  );
}

export const LEVELS: { xp: number; title: Text }[] = [
  { xp: 0, title: { uz: "Yangi xaker", en: "New hacker" } },
  { xp: 40, title: { uz: "Kod izlovchi", en: "Code seeker" } },
  { xp: 100, title: { uz: "Chit ustasi", en: "Cheat master" } },
  { xp: 200, title: { uz: "O‘yin xakeri", en: "Game hacker" } },
  { xp: 360, title: { uz: "Bosh xaker", en: "Chief hacker" } },
  { xp: 600, title: { uz: "Kod sehrgari", en: "Code wizard" } },
  { xp: 900, title: { uz: "Kiber qahramon", en: "Cyber hero" } },
  { xp: MAX_XP, title: { uz: "Afsonaviy xaker", en: "Legendary hacker" } },
];

/** XP for the "Game hacker" certificate: the fourth level. */
export const CERTIFICATE_XP = 200;

export function kidsLevel(xp: number) {
  let index = 0;
  LEVELS.forEach((level, i) => {
    if (xp >= level.xp) index = i;
  });
  return { index, level: LEVELS[index], next: LEVELS[index + 1] ?? null };
}

export type Proof = {
  code?: string;
  cheat?: string;
  score?: number;
  password?: string;
};

/** Whether a mission is really complete with the given evidence. */
export function missionPassed(game: GameId, missionId: string, proof: Proof) {
  const mission = GAMES[game].missions.find((m) => m.id === missionId);
  if (!mission) return false;
  const check = mission.check;
  if (check.kind === "code")
    return (
      typeof proof.code === "string" &&
      proof.code.length <= MAX_CODE &&
      check.test(compile(GAMES[game], proof.code, true))
    );
  if (check.kind === "cheat") return proof.cheat === check.cheat;
  if (check.kind === "login")
    return (
      typeof proof.password === "string" &&
      proof.password.length <= 80 &&
      passwordOpens(GAMES[game], proof.password)
    );
  return (
    typeof proof.score === "number" &&
    proof.score >= check.score &&
    proof.score <= MAX_SCORE
  );
}

export type KidsUpdate = {
  game: unknown;
  code?: unknown;
  score?: unknown;
  mission?: unknown;
  cheat?: unknown;
  password?: unknown;
  /** True when the evidence is for today's daily task. */
  daily?: unknown;
  tour?: unknown;
};

/** Applies one update from the game lab; null when it is not acceptable. */
export function applyKidsUpdate(
  progress: KidsProgress,
  update: KidsUpdate,
  today = tashkentDay(Date.now()),
) {
  if (!isGameId(update.game)) return null;
  const game = update.game;
  if (!gameOpen(GAMES[game], new Set(progress.done))) return null;
  const next: KidsProgress = {
    done: [...progress.done],
    best: { ...progress.best },
    code: { ...progress.code },
    daily: { ...progress.daily },
    tour: progress.tour || update.tour === true,
  };
  const code =
    typeof update.code === "string" ? update.code.slice(0, MAX_CODE) : null;
  const score =
    typeof update.score === "number" && Number.isFinite(update.score)
      ? Math.min(Math.max(Math.floor(update.score), 0), MAX_SCORE)
      : null;
  if (code !== null) next.code[game] = code;
  if (score !== null) next.best[game] = Math.max(next.best[game], score);
  if (update.daily === true && next.daily.last !== today) {
    const task = dailyTask(today, new Set(next.done));
    const proof = {
      code: code ?? undefined,
      score: score ?? undefined,
      cheat: typeof update.cheat === "string" ? update.cheat : undefined,
    };
    if (task.game !== game || !dailyPassed(task, proof)) return null;
    next.daily = nextDaily(next.daily, today);
  }
  if (typeof update.mission === "string") {
    const proof: Proof = {
      code: code ?? undefined,
      score: score ?? undefined,
      cheat: typeof update.cheat === "string" ? update.cheat : undefined,
      password:
        typeof update.password === "string" ? update.password : undefined,
    };
    // A stage opens only once the stage before it is finished.
    const mission = GAMES[game].missions.find((m) => m.id === update.mission);
    if (
      !mission ||
      !stageOpen(GAMES[game], stageOf(mission), new Set(next.done))
    )
      return null;
    if (!missionPassed(game, update.mission, proof)) return null;
    const key = missionKey(game, update.mission);
    if (!next.done.includes(key)) next.done.push(key);
  }
  return next;
}
