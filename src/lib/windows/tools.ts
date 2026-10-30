// Academy Intermediate · Windows basics: the access list of a payroll share
// with two entries too many, and five Security log events to name. The
// share and accounts are invented; the event IDs are Windows' own.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- The access list -------------------------------------------------------------------

export type Ace = { who: string; right: Text; risky: boolean; why: Text };

/** The NTFS permissions of D:\Payroll, which only HR should open. */
export const ACL: Ace[] = [
  {
    who: "BUILTIN\\Administrators",
    right: t("To‘liq nazorat", "Full control"),
    risky: false,
    why: t(
      "Administratorlar tizimni boshqaradi.",
      "Administrators run the system.",
    ),
  },
  {
    who: "NT AUTHORITY\\SYSTEM",
    right: t("To‘liq nazorat", "Full control"),
    risky: false,
    why: t(
      "Operatsion tizim xizmatlari uchun kerak.",
      "The operating system’s own services need it.",
    ),
  },
  {
    who: "CORP\\HR-Payroll",
    right: t("O‘zgartirish", "Modify"),
    risky: false,
    why: t(
      "Aynan shu jamoa ish haqi bilan ishlaydi.",
      "This is the team that does payroll.",
    ),
  },
  {
    who: "Everyone",
    right: t("To‘liq nazorat", "Full control"),
    risky: true,
    why: t(
      "Har kim o‘qiydi, o‘zgartiradi va huquqlarni ham qayta yozadi.",
      "Anyone can read, change and even rewrite the permissions.",
    ),
  },
  {
    who: "CORP\\Domain Users",
    right: t("O‘qish", "Read"),
    risky: true,
    why: t(
      "Kompaniyadagi har bir xodim hammaning maoshini ko‘radi.",
      "Every employee could see everyone’s salary.",
    ),
  },
  {
    who: "BUILTIN\\Backup Operators",
    right: t("O‘qish", "Read"),
    risky: false,
    why: t(
      "Zaxira nusxa olish uchun o‘qish kerak.",
      "Backups need to read the files.",
    ),
  },
];

export const RISKY_ACES = ACL.filter((a) => a.risky).map((a) => a.who);

export const aclRight = (picked: Iterable<string>) => {
  const set = new Set(picked);
  return set.size === RISKY_ACES.length && RISKY_ACES.every((w) => set.has(w));
};

// --- Security log ----------------------------------------------------------------------

export const MEANINGS = [
  "logon",
  "failed",
  "created",
  "group",
  "cleared",
] as const;
export type Meaning = (typeof MEANINGS)[number];

export const MEANING_NAMES: Record<Meaning, Text> = {
  logon: t("Muvaffaqiyatli kirish", "A successful logon"),
  failed: t("Muvaffaqiyatsiz kirish", "A failed logon"),
  created: t("Yangi foydalanuvchi yaratildi", "A user account was created"),
  group: t(
    "Himoyalangan guruhga a’zo qo‘shildi",
    "A member was added to a security group",
  ),
  cleared: t("Audit logi tozalandi", "The audit log was cleared"),
};

export type LogEvent = { id: number; line: string; meaning: Meaning };

/** One night on a file server, oldest first. */
export const EVENTS: LogEvent[] = [
  {
    id: 4625,
    line: "02:11 · Account: admin · Source: 203.0.113.50",
    meaning: "failed",
  },
  {
    id: 4624,
    line: "02:14 · Account: svc-backup · Logon type 10",
    meaning: "logon",
  },
  { id: 4720, line: "02:16 · New account: helpdesk2", meaning: "created" },
  { id: 4732, line: "02:16 · helpdesk2 → Administrators", meaning: "group" },
  {
    id: 1102,
    line: "02:19 · Subject: svc-backup · Log: Security",
    meaning: "cleared",
  },
];

export type Picks = Partial<Record<number, Meaning>>;

export const eventsRight = (picks: Picks) =>
  EVENTS.every((e) => picks[e.id] === e.meaning);
