import type { Text } from "./logic";

// Junior's agent card: missions and solved cipher exercises earn XP, and XP
// earns a rank. It is a motivation aid only, worked out from saved progress.

export const MISSION_XP = 100;
export const EXERCISE_XP = 15;
export const DAILY_XP = 20;
export const STORY_XP = 100;

export function xpFor(stats: {
  missions: number;
  exercises: number;
  daily: number;
  story: boolean;
}) {
  return (
    stats.missions * MISSION_XP +
    stats.exercises * EXERCISE_XP +
    stats.daily * DAILY_XP +
    (stats.story ? STORY_XP : 0)
  );
}

export const RANKS: readonly { xp: number; title: Text }[] = [
  { xp: 0, title: { uz: "Yangi nomzod", en: "New recruit" } },
  { xp: 150, title: { uz: "Kursant", en: "Cadet" } },
  { xp: 350, title: { uz: "Himoyachi", en: "Defender" } },
  { xp: 600, title: { uz: "Kiber-agent", en: "Cyber agent" } },
  { xp: 900, title: { uz: "Shifr ustasi", en: "Cipher master" } },
  { xp: 1200, title: { uz: "Bosh agent", en: "Chief agent" } },
];

export function rankFor(xp: number) {
  let index = 0;
  RANKS.forEach((rank, i) => {
    if (xp >= rank.xp) index = i;
  });
  const next = RANKS[index + 1] ?? null;
  return {
    index,
    rank: RANKS[index],
    next,
    /** Share of the way to the next rank, 0–1 (1 at the top rank). */
    progress: next ? (xp - RANKS[index].xp) / (next.xp - RANKS[index].xp) : 1,
  };
}

const ADJECTIVES: Text[] = [
  { uz: "Tezkor", en: "Swift" },
  { uz: "Jasur", en: "Brave" },
  { uz: "Ziyrak", en: "Clever" },
  { uz: "Sokin", en: "Silent" },
  { uz: "Chaqqon", en: "Nimble" },
  { uz: "Hushyor", en: "Watchful" },
  { uz: "Oltin", en: "Golden" },
  { uz: "Yashil", en: "Green" },
];
const ANIMALS: Text[] = [
  { uz: "Burgut", en: "Eagle" },
  { uz: "Lochin", en: "Falcon" },
  { uz: "Bars", en: "Snow Leopard" },
  { uz: "Tulki", en: "Fox" },
  { uz: "Boyo‘g‘li", en: "Owl" },
  { uz: "Delfin", en: "Dolphin" },
  { uz: "Ayiq", en: "Bear" },
  { uz: "Qoplon", en: "Tiger" },
];

export function randomCodename(locale: "uz" | "en", random: () => number) {
  const adjective = ADJECTIVES[Math.floor(random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(random() * ANIMALS.length)];
  return `${adjective[locale]} ${animal[locale]}`;
}

/** A stored codename: trimmed plain text, at most 24 characters. */
export function restoreCodename(raw: unknown) {
  if (!raw || typeof raw !== "object") return "";
  const name = (raw as Record<string, unknown>).name;
  return typeof name === "string"
    ? name
        .replace(/[\u0000-\u001f<>]/g, "")
        .trim()
        .slice(0, 24)
    : "";
}
