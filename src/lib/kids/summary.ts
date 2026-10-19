// What a child has done, in the words a teacher or a parent needs: the stage
// they are on in every game, the skills each finished stage stands for, and
// their badges and streak.
import { badges, currentStreak } from "./extras";
import {
  GAME_IDS,
  gameOpen,
  GAMES,
  missionKey,
  stageOf,
  stageOpen,
  type GameId,
  type Stage,
} from "./games";
import type { Text } from "./lang";
import type { KidsProgress } from "./progress";

/** The skill a finished stage stands for, per game. */
export const SKILLS: Record<GameId, [Text, Text, Text]> = {
  kosmos: [
    {
      uz: "O‘yin sozlamalarini kod bilan o‘zgartiradi",
      en: "Changes game settings with code",
    },
    {
      uz: "“agar” bilan shartli qoidalar yozadi",
      en: "Writes rules with “if”",
    },
    {
      uz: "Fayldan parol topadi va hodisalar yozadi",
      en: "Finds a leaked password and writes event handlers",
    },
  ],
  robot: [
    {
      uz: "Fizika sozlamalarini (tortishish, sakrash) o‘zgartiradi",
      en: "Changes physics settings (gravity, jumps)",
    },
    {
      uz: "Bloklar, “va” va “aks_holda”ni ishlatadi",
      en: "Uses blocks, “and” and “otherwise”",
    },
    {
      uz: "Teskari yozilgan parolni ochadi, hodisalar yozadi",
      en: "Reads a reversed password and writes event handlers",
    },
  ],
  ilon: [
    {
      uz: "O‘yin qoidalarini kod bilan boshqaradi",
      en: "Controls game rules with code",
    },
    {
      uz: "Vaqt va ochkoga qarab qaror qiladigan kod yozadi",
      en: "Writes code that decides by time and score",
    },
    {
      uz: "Oddiy shifrni ochadi, hodisalar yozadi",
      en: "Breaks a simple cipher and writes event handlers",
    },
  ],
  qorovul: [
    {
      uz: "Uzun parol, 2 bosqichli kirish, firewall va yangilanishlarni biladi; fishingni taniydi",
      en: "Knows long passwords, two-step sign-in, firewalls and updates; spots phishing",
    },
    {
      uz: "Xavfga qarab himoyani o‘zgartiradigan qoidalar yozadi",
      en: "Writes rules that change defences when danger grows",
    },
    {
      uz: "Maxfiy savol nega zaif ekanini tushunadi, zaxiradan tiklashni yozadi",
      en: "Understands why secret questions are weak; writes a backup restore",
    },
  ],
  labirint: [
    {
      uz: "Buyruqlar ketma-ketligini tuzadi",
      en: "Plans a sequence of commands",
    },
    {
      uz: "Sikllar bilan qisqa kod yozadi",
      en: "Writes short code with loops",
    },
    {
      uz: "Shartlar va “toki” bilan algoritm yozadi",
      en: "Writes algorithms with conditions and while loops",
    },
  ],
  shifr: [
    {
      uz: "Sezar shifrini ochadi, “brute force”ni tushunadi",
      en: "Breaks Caesar ciphers and understands brute force",
    },
    {
      uz: "Bir nechta shifrni teskari tartibda ochadi",
      en: "Undoes several ciphers in reverse order",
    },
    {
      uz: "Kalitli (Vigenère) shifrni ochadi",
      en: "Decodes a keyed (Vigenère) cipher",
    },
  ],
};

export type GameSummary = {
  id: GameId;
  open: boolean;
  /** The stage being worked on, or null when every mission is done. */
  stage: Stage | null;
  done: number;
  total: number;
  /** Missions done per stage, and the stage's size. */
  stages: { stage: Stage; done: number; total: number; finished: boolean }[];
  best: number;
};

export function kidSummary(progress: KidsProgress, today: string) {
  const done = new Set(progress.done);
  const games: GameSummary[] = GAME_IDS.map((id) => {
    const game = GAMES[id];
    const stages = ([1, 2, 3] as Stage[]).map((stage) => {
      const list = game.missions.filter((m) => stageOf(m) === stage);
      const count = list.filter((m) => done.has(missionKey(id, m.id))).length;
      return {
        stage,
        done: count,
        total: list.length,
        finished: list.length > 0 && count === list.length,
      };
    });
    const working = stages.find(
      (s) => !s.finished && stageOpen(game, s.stage, done),
    );
    return {
      id,
      open: gameOpen(game, done),
      stage: working?.stage ?? null,
      done: stages.reduce((n, s) => n + s.done, 0),
      total: game.missions.length,
      stages,
      best: progress.best[id],
    };
  });
  const skills = games.flatMap((g) =>
    g.stages
      .filter((s) => s.finished)
      .map((s) => ({
        game: g.id,
        stage: s.stage,
        text: SKILLS[g.id][s.stage - 1],
      })),
  );
  const all = badges(progress);
  return {
    games,
    skills,
    badges: all.filter((b) => b.earned),
    badgeTotal: all.length,
    streak: currentStreak(progress.daily, today),
    record: progress.daily.record,
    dailyCount: progress.daily.count,
  };
}

export type KidSummary = ReturnType<typeof kidSummary>;
