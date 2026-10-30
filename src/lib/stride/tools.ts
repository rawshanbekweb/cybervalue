// Academy Intermediate · Threat modelling: a data-flow diagram of a school
// grades app split into trust zones, and six threats against it to sort into
// STRIDE. Simplified, but the zones, flows and categories are the ones a real
// threat model uses.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- Trust boundaries ------------------------------------------------------------------

export const ZONES = ["internet", "dmz", "internal"] as const;
export type Zone = (typeof ZONES)[number];

export type DfdNode = {
  id: string;
  name: Text;
  zone: Zone;
  x: number;
  y: number;
};

export const NODES: DfdNode[] = [
  {
    id: "student",
    name: t("O‘quvchi brauzeri", "Student browser"),
    zone: "internet",
    x: 60,
    y: 60,
  },
  {
    id: "teacher",
    name: t("O‘qituvchi brauzeri", "Teacher browser"),
    zone: "internet",
    x: 60,
    y: 170,
  },
  {
    id: "sms",
    name: t("SMS shlyuzi", "SMS gateway"),
    zone: "internet",
    x: 60,
    y: 260,
  },
  { id: "web", name: t("Veb-ilova", "Web app"), zone: "dmz", x: 220, y: 115 },
  {
    id: "api",
    name: t("Baholar API", "Grades API"),
    zone: "internal",
    x: 380,
    y: 115,
  },
  { id: "db", name: t("Baza", "Database"), zone: "internal", x: 380, y: 230 },
  {
    id: "log",
    name: t("Log serveri", "Log server"),
    zone: "internal",
    x: 500,
    y: 230,
  },
];

export type Flow = { id: number; from: string; to: string };

export const FLOWS: Flow[] = [
  { id: 1, from: "student", to: "web" },
  { id: 2, from: "teacher", to: "web" },
  { id: 3, from: "web", to: "api" },
  { id: 4, from: "api", to: "db" },
  { id: 5, from: "api", to: "log" },
  { id: 6, from: "api", to: "sms" },
];

const zoneOf = (id: string) => NODES.find((n) => n.id === id)?.zone;

/** A flow crosses a trust boundary when its ends sit in different zones. */
export const crosses = (f: Flow) => zoneOf(f.from) !== zoneOf(f.to);

export const CROSSING = FLOWS.filter(crosses).map((f) => f.id);

export const boundaryRight = (picked: Iterable<number>) => {
  const set = new Set(picked);
  return set.size === CROSSING.length && CROSSING.every((id) => set.has(id));
};

// --- STRIDE ----------------------------------------------------------------------------

export const STRIDE = ["S", "T", "R", "I", "D", "E"] as const;
export type Letter = (typeof STRIDE)[number];

export const STRIDE_NAMES: Record<Letter, string> = {
  S: "Spoofing",
  T: "Tampering",
  R: "Repudiation",
  I: "Information disclosure",
  D: "Denial of service",
  E: "Elevation of privilege",
};

export type Threat = { id: string; text: Text; letter: Letter };

export const THREATS: Threat[] = [
  {
    id: "steal",
    text: t(
      "Kimdir o‘g‘irlangan parol bilan o‘qituvchi bo‘lib kiradi",
      "Someone logs in as a teacher with a stolen password",
    ),
    letter: "S",
  },
  {
    id: "grade",
    text: t(
      "O‘quvchi so‘rov API’ga yetguncha undagi bahosini o‘zgartiradi",
      "A student changes their grade in the request before it reaches the API",
    ),
    letter: "T",
  },
  {
    id: "deny",
    text: t(
      "O‘qituvchi bahoni o‘zgartirganini inkor qiladi va hech narsa yozilmagan",
      "A teacher denies changing a grade, and nothing was logged",
    ),
    letter: "R",
  },
  {
    id: "phones",
    text: t(
      "API javobida barcha o‘quvchilarning telefon raqamlari qaytadi",
      "The API response includes every student’s phone number",
    ),
    letter: "I",
  },
  {
    id: "flood",
    text: t(
      "Bot sekundiga 10 000 ta login so‘rovi yuboradi va sayt to‘xtaydi",
      "A bot sends 10,000 login requests a second and the site stops",
    ),
    letter: "D",
  },
  {
    id: "admin",
    text: t(
      "O‘quvchi /api/admin/grades ni chaqiradi va u ishlaydi",
      "A student calls /api/admin/grades and it works",
    ),
    letter: "E",
  },
];

export type Calls = Partial<Record<string, Letter>>;

export const strideRight = (calls: Calls) =>
  THREATS.every((th) => calls[th.id] === th.letter);
