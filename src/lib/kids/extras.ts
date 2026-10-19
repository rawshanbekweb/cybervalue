// Academy Kids extras on top of the missions: the daily task with its streak,
// and badges. Pure, so the browser shows exactly what the server records.
import { tashkentDay } from "../admin/activity";
import {
  compile,
  GAME_IDS,
  gameOpen,
  GAMES,
  missionKey,
  stageOpen,
  type GameId,
} from "./games";
import type { Text } from "./lang";

export const DAILY_XP = 15;

export type Daily = {
  /** Tashkent date of the last daily task done, "" for never. */
  last: string;
  streak: number;
  /** The longest streak ever, so a streak badge is never taken away. */
  record: number;
  count: number;
};

export type DailyTask = {
  id: string;
  game: GameId;
  title: Text;
} & (
  | { kind: "score"; score: number }
  | { kind: "cheat"; cheat: string }
  | { kind: "code"; setting: string }
);

const SCORE: Record<GameId, number> = { kosmos: 120, robot: 80, ilon: 60 };

function tasksFor(id: GameId): DailyTask[] {
  const game = GAMES[id];
  const name = game.title;
  const numbers = Object.entries(game.schema).filter(
    ([, spec]) => spec.kind === "number",
  );
  return [
    {
      id: `${id}:score`,
      game: id,
      kind: "score",
      score: SCORE[id],
      title: {
        uz: `“${name.uz}” o‘yinida bitta o‘yinda ${SCORE[id]} ochko to‘plang.`,
        en: `Score ${SCORE[id]} points in one round of “${name.en}”.`,
      },
    },
    ...game.cheats.map((c): DailyTask => ({
      id: `${id}:cheat:${c.name}`,
      game: id,
      kind: "cheat",
      cheat: c.name,
      title: {
        uz: `“${name.uz}” o‘yinida terminal orqali ${c.name}() buyrug‘ini ishlating.`,
        en: `Use the ${c.name}() command in the terminal of “${name.en}”.`,
      },
    })),
    ...numbers.map(([setting, spec]): DailyTask => ({
      id: `${id}:code:${setting}`,
      game: id,
      kind: "code",
      setting,
      title: {
        uz: `“${name.uz}” kodida “${spec.label.uz}” (${setting}) qiymatini o‘zgartirib, ishga tushiring.`,
        en: `Change “${spec.label.en}” (${setting}) in the code of “${name.en}” and run it.`,
      },
    })),
  ];
}

function hash(text: string) {
  let h = 7;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** Today's task, the same for a whole day, from the games the child has open. */
export function dailyTask(day: string, done: Set<string>): DailyTask {
  const pool = GAME_IDS.filter((id) => gameOpen(GAMES[id], done)).flatMap(
    tasksFor,
  );
  return pool[hash(day) % pool.length];
}

export type DailyProof = { code?: string; cheat?: string; score?: number };

export function dailyPassed(task: DailyTask, proof: DailyProof) {
  if (task.kind === "score")
    return typeof proof.score === "number" && proof.score >= task.score;
  if (task.kind === "cheat") return proof.cheat === task.cheat;
  return (
    typeof proof.code === "string" &&
    compile(GAMES[task.game], proof.code, true).changed.includes(task.setting)
  );
}

const previousDay = (day: string) =>
  tashkentDay(new Date(`${day}T12:00:00+05:00`).getTime() - 86_400_000);

/** The streak after doing today's task. */
export function nextDaily(daily: Daily, today: string): Daily {
  if (daily.last === today) return daily;
  const streak = daily.last === previousDay(today) ? daily.streak + 1 : 1;
  return {
    last: today,
    streak,
    record: Math.max(daily.record, streak),
    count: daily.count + 1,
  };
}

/** The streak as it stands today: it is lost once a whole day is missed. */
export const currentStreak = (daily: Daily, today: string) =>
  daily.last === today || daily.last === previousDay(today) ? daily.streak : 0;

export type BadgeId =
  | "first"
  | "rules"
  | "developer"
  | "passwords"
  | "terminal"
  | "record"
  | "streak3"
  | "streak7"
  | `master:${GameId}`;

export type Badge = { id: BadgeId; title: Text; about: Text };

type Facts = {
  done: Set<string>;
  best: Record<GameId, number>;
  daily: Daily;
};

const finished = (id: GameId, done: Set<string>) =>
  GAMES[id].missions.every((m) => done.has(missionKey(id, m.id)));

const BADGES: (Badge & { earned: (f: Facts) => boolean })[] = [
  {
    id: "first",
    title: { uz: "Birinchi xak", en: "First hack" },
    about: {
      uz: "Birinchi topshiriqni bajardingiz",
      en: "Finished a first mission",
    },
    earned: (f) => f.done.size > 0,
  },
  {
    id: "rules",
    title: { uz: "Qoida ustasi", en: "Rule maker" },
    about: {
      uz: "Bitta o‘yinda qoidalar bosqichini tugatdingiz",
      en: "Finished the rules stage of a game",
    },
    earned: (f) => GAME_IDS.some((id) => stageOpen(GAMES[id], 3, f.done)),
  },
  {
    id: "developer",
    title: { uz: "Dasturchi", en: "Developer" },
    about: {
      uz: "Parolni topib, dasturchi rejimiga kirdingiz",
      en: "Found a password and got into developer mode",
    },
    earned: (f) =>
      GAME_IDS.some((id) =>
        GAMES[id].missions.some(
          (m) => m.check.kind === "login" && f.done.has(missionKey(id, m.id)),
        ),
      ),
  },
  {
    id: "passwords",
    title: { uz: "Parol ovchisi", en: "Password hunter" },
    about: {
      uz: "Hamma o‘yinlarning parolini topdingiz",
      en: "Found the password of every game",
    },
    earned: (f) =>
      GAME_IDS.every((id) =>
        GAMES[id].missions.some(
          (m) => m.check.kind === "login" && f.done.has(missionKey(id, m.id)),
        ),
      ),
  },
  {
    id: "terminal",
    title: { uz: "Terminal sehrgari", en: "Terminal wizard" },
    about: {
      uz: "Hamma o‘yinlarda terminal buyrug‘ini topdingiz",
      en: "Used a terminal command in every game",
    },
    earned: (f) =>
      GAME_IDS.every((id) =>
        GAMES[id].missions.some(
          (m) => m.check.kind === "cheat" && f.done.has(missionKey(id, m.id)),
        ),
      ),
  },
  {
    id: "record",
    title: { uz: "Rekordchi", en: "Record breaker" },
    about: {
      uz: "Bitta o‘yinda 500 ochko to‘pladingiz",
      en: "Scored 500 points in one round",
    },
    earned: (f) => GAME_IDS.some((id) => f.best[id] >= 500),
  },
  {
    id: "streak3",
    title: { uz: "3 kun ketma-ket", en: "3 days in a row" },
    about: {
      uz: "Kun topshirig‘ini 3 kun ketma-ket bajardingiz",
      en: "Did the daily task 3 days in a row",
    },
    earned: (f) => f.daily.record >= 3,
  },
  {
    id: "streak7",
    title: { uz: "Bir hafta", en: "A whole week" },
    about: {
      uz: "Kun topshirig‘ini 7 kun ketma-ket bajardingiz",
      en: "Did the daily task 7 days in a row",
    },
    earned: (f) => f.daily.record >= 7,
  },
  ...GAME_IDS.map((id) => ({
    id: `master:${id}` as const,
    title: {
      uz: `${GAMES[id].title.uz} ustasi`,
      en: `${GAMES[id].title.en} master`,
    },
    about: {
      uz: "O‘yindagi hamma topshiriqlarni bajardingiz",
      en: "Finished every mission of the game",
    },
    earned: (f: Facts) => finished(id, f.done),
  })),
];

/** Every badge with whether the child has it. */
export function badges(facts: {
  done: string[];
  best: Record<GameId, number>;
  daily: Daily;
}) {
  const f: Facts = { ...facts, done: new Set(facts.done) };
  return BADGES.map(({ earned, ...badge }) => ({
    ...badge,
    earned: earned(f),
  }));
}

/** Today's date in Tashkent, the day the daily task belongs to. */
export const kidsToday = () => tashkentDay(Date.now());
