// Where a Junior member stands, in the words a teacher or a parent needs: the
// mission stage and cipher level they are on, and the skills each finished
// stage or level stands for.
import { CIPHERS, type CipherProgress } from "./cipher-content";
import { MISSIONS } from "./content";
import type { Progress, Text } from "./logic";
import {
  cipherLevelOpen,
  LEVEL_OPENS_AT,
  levelSolved,
  MISSION_STAGE,
  missionStageOpen,
  type Level,
  type Stage,
} from "./verify";

const STAGES: Stage[] = [1, 2, 3, 4];
const LEVELS: Level[] = [1, 2, 3];

/** The skill a finished mission stage stands for. */
export const MISSION_SKILLS: Record<Stage, Text> = {
  1: {
    uz: "Kuchli parol tuzadi va fishing xabarni taniydi",
    en: "Builds a strong password and spots a phishing message",
  },
  2: {
    uz: "Oddiy shifrni ochadi va internetda qoldirgan izini nazorat qiladi",
    en: "Breaks a simple cipher and watches the trail they leave online",
  },
  3: {
    uz: "CTF topshiriqlarini yechadi va etik xaker qoidalarini biladi",
    en: "Solves CTF tasks and knows the ethical hacker’s rules",
  },
  4: {
    uz: "Ilova ruxsatlarini tekshiradi va xavfli Wi-Fi tarmoqni taniydi",
    en: "Checks app permissions and recognises a risky Wi-Fi network",
  },
};

/** The skill a passed cipher level stands for. */
export const LEVEL_SKILLS: Record<Level, Text> = {
  1: {
    uz: "Klassik shifrlarni (Sezar, Atbash, Morze va boshqalar) qo‘lda ochadi",
    en: "Works classic ciphers (Caesar, Atbash, Morse and more) by hand",
  },
  2: {
    uz: "Chastota tahlili va kalitli Vijener shifri bilan ishlaydi",
    en: "Uses frequency analysis and the keyed Vigenère cipher",
  },
  3: {
    uz: "Enigma va ochiq kalit g‘oyasini tushunadi",
    en: "Understands the Enigma machine and the idea of public keys",
  },
};

export function juniorStages(missions: Progress, ciphers: CipherProgress) {
  const missionStages = STAGES.map((stage) => {
    const list = MISSIONS.filter((m) => MISSION_STAGE[m.id] === stage);
    const done = list.filter((m) => missions[m.id]).length;
    return {
      stage,
      done,
      total: list.length,
      open: missionStageOpen(stage, missions),
      finished: done === list.length,
    };
  });
  const levels = LEVELS.map((level) => {
    const total = CIPHERS.filter((c) => c.level === level).reduce(
      (n, c) => n + c.exercises.length,
      0,
    );
    const solved = levelSolved(level, ciphers);
    return {
      level,
      solved,
      total,
      open: cipherLevelOpen(level, ciphers),
      passed: solved >= Math.ceil(total * LEVEL_OPENS_AT),
    };
  });
  const skills = [
    ...missionStages
      .filter((s) => s.finished)
      .map((s) => ({ key: `m${s.stage}`, text: MISSION_SKILLS[s.stage] })),
    ...levels
      .filter((l) => l.passed)
      .map((l) => ({ key: `c${l.level}`, text: LEVEL_SKILLS[l.level] })),
  ];
  return {
    missionStages,
    levels,
    /** The stage being worked on, or null when every mission is done. */
    missionStage:
      missionStages.find((s) => s.open && !s.finished)?.stage ?? null,
    /** The first open cipher level not yet passed, or null when all are. */
    cipherLevel: levels.find((l) => l.open && !l.passed)?.level ?? null,
    skills,
  };
}

export type JuniorStages = ReturnType<typeof juniorStages>;
