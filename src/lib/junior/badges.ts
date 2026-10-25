import type { Progress, Text } from "./logic";
import { CIPHERS, type CipherProgress } from "./cipher-content";
import { CASE_MISSION_IDS, MISSIONS } from "./content";
import { RANKS } from "./rank";

// Achievement badges for Junior. Most are worked out from progress the page
// already has; a few need small events (tapping SOS, sending a secret,
// opening every cipher), saved with the rest of the member's progress.

export type Events = { sos?: true; secret?: true; visited?: string[] };

export function restoreEvents(raw: unknown): Events {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const value = raw as Record<string, unknown>;
  const ids = CIPHERS.map((cipher) => cipher.id as string);
  const visited = Array.isArray(value.visited)
    ? [
        ...new Set(
          value.visited.filter(
            (id): id is string => typeof id === "string" && ids.includes(id),
          ),
        ),
      ]
    : [];
  return {
    ...(value.sos === true ? { sos: true as const } : {}),
    ...(value.secret === true ? { secret: true as const } : {}),
    ...(visited.length ? { visited } : {}),
  };
}

export type BadgeState = {
  missions: number;
  missionTotal: number;
  /** Which missions are finished. */
  done: Progress;
  phishing: boolean;
  ciphers: CipherProgress;
  story: boolean;
  events: Events;
  /** The longest run of daily puzzles, so the badge is never taken back. */
  streak: number;
  rank: number;
};

const all = (state: BadgeState, id: string) => {
  const cipher = CIPHERS.find((c) => c.id === id)!;
  return (state.ciphers[cipher.id]?.length ?? 0) === cipher.exercises.length;
};

export type BadgeIcon =
  | "rocket"
  | "fish"
  | "search"
  | "cap"
  | "scroll"
  | "chart"
  | "cog"
  | "radio"
  | "mail"
  | "flame"
  | "key"
  | "crown"
  | "shield";

export const BADGES: readonly {
  id: string;
  icon: BadgeIcon;
  title: Text;
  how: Text;
  earned: (state: BadgeState) => boolean;
}[] = [
  {
    id: "first",
    icon: "rocket",
    title: { uz: "Birinchi qadam", en: "First step" },
    how: { uz: "Bitta missiyani bajaring", en: "Finish one mission" },
    earned: (s) => s.missions >= 1,
  },
  {
    id: "phish",
    icon: "fish",
    title: { uz: "Fishing ovchisi", en: "Phish hunter" },
    how: {
      uz: "«Fishingni top» missiyasini bajaring",
      en: "Finish “Spot the phish”",
    },
    earned: (s) => s.phishing,
  },
  {
    id: "detective",
    icon: "search",
    title: { uz: "Detektiv", en: "Detective" },
    how: {
      uz: "Kiber-shtab hujumchisini fosh qiling",
      en: "Unmask the HQ attacker",
    },
    earned: (s) => s.story,
  },
  {
    id: "recruit",
    icon: "cap",
    title: { uz: "Junior bitiruvchisi", en: "Junior graduate" },
    how: {
      uz: "Kiber-shtab ishining 6 missiyasini bajaring",
      en: "Finish the 6 missions of the Cyber HQ case",
    },
    earned: (s) => CASE_MISSION_IDS.every((id) => s.done[id]),
  },
  {
    id: "defender",
    icon: "shield",
    title: { uz: "Raqamli himoyachi", en: "Digital defender" },
    how: {
      uz: "“Kundalik raqamli hayot” bosqichini tugating",
      en: "Finish the “Everyday digital life” stage",
    },
    earned: (s) =>
      MISSIONS.filter(
        (m) => !(CASE_MISSION_IDS as readonly string[]).includes(m.id),
      ).every((m) => s.done[m.id]),
  },
  {
    id: "historian",
    icon: "scroll",
    title: { uz: "Tarixchi", en: "Historian" },
    how: {
      uz: "Shifrlar xonasidagi barcha shifrlarni oching",
      en: "Open every cipher in the Cipher Room",
    },
    earned: (s) => (s.events.visited?.length ?? 0) === CIPHERS.length,
  },
  {
    id: "kindi",
    icon: "chart",
    title: { uz: "Al-Kindiy shogirdi", en: "Al-Kindi’s apprentice" },
    how: {
      uz: "Chastota tahlilining barcha mashqlarini yeching",
      en: "Solve every frequency-analysis exercise",
    },
    earned: (s) => all(s, "frequency"),
  },
  {
    id: "bletchley",
    icon: "cog",
    title: { uz: "Bletchli-Park", en: "Bletchley Park" },
    how: {
      uz: "Enigmaning barcha mashqlarini yeching",
      en: "Solve every Enigma exercise",
    },
    earned: (s) => all(s, "enigma"),
  },
  {
    id: "sos",
    icon: "radio",
    title: { uz: "Tezkor barmoqlar", en: "Fast fingers" },
    how: {
      uz: "Telegraf kalitida SOS yuboring",
      en: "Tap SOS on the telegraph key",
    },
    earned: (s) => Boolean(s.events.sos),
  },
  {
    id: "secret",
    icon: "mail",
    title: { uz: "Sir saqlovchi", en: "Secret keeper" },
    how: {
      uz: "Do‘stingizga shifrlangan xabar yuboring",
      en: "Send a friend an encrypted message",
    },
    earned: (s) => Boolean(s.events.secret),
  },
  {
    id: "streak",
    icon: "flame",
    title: { uz: "3 kunlik olov", en: "3-day streak" },
    how: {
      uz: "Kunlik topishmoqni 3 kun ketma-ket yeching",
      en: "Solve the daily puzzle 3 days in a row",
    },
    earned: (s) => s.streak >= 3,
  },
  {
    id: "master",
    icon: "key",
    title: { uz: "Shifr ustasi", en: "Cipher master" },
    how: {
      uz: "Shifrlar xonasidagi barcha mashqlarni yeching",
      en: "Solve every Cipher Room exercise",
    },
    earned: (s) => CIPHERS.every((c) => all(s, c.id)),
  },
  {
    id: "chief",
    icon: "crown",
    title: { uz: "Bosh agent", en: "Chief agent" },
    how: { uz: "Eng yuqori unvonga erishing", en: "Reach the top rank" },
    earned: (s) => s.rank === RANKS.length - 1,
  },
];
