// Academy Intermediate · Incident response: ranking incidents by severity,
// and containing ransomware without destroying the evidence or tipping off
// the attacker. Simplified, but in the spirit of NIST SP 800-61.
import type { Text } from "../network/ip";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- Severity ---------------------------------------------------------------------------

export type Incident = {
  id: string;
  what: Text;
  /** How bad it is if it runs its course: 1 (low) to 3 (high). */
  impact: 1 | 2 | 3;
  /** How fast it is getting worse: 1 (contained) to 3 (spreading now). */
  urgency: 1 | 2 | 3;
};

export const INCIDENTS: Incident[] = [
  {
    id: "laptop",
    what: t(
      "Xodim noutbukini taksida unutdi; disk BitLocker bilan shifrlangan",
      "An employee left a laptop in a taxi; its disk is BitLocker-encrypted",
    ),
    impact: 1,
    urgency: 1,
  },
  {
    id: "deface",
    what: t(
      "Kompaniya sayti bosh sahifasi almashtirilgan",
      "The company website’s front page has been replaced",
    ),
    impact: 2,
    urgency: 2,
  },
  {
    id: "exfil",
    what: t(
      "Mijozlar bazasidan noma’lum IP’ga ma’lumot ketmoqda",
      "Data is leaving the customer database for an unknown IP",
    ),
    impact: 3,
    urgency: 2,
  },
  {
    id: "ransom",
    what: t(
      "Ransomware fayl serverida tarqalmoqda, har daqiqada yangi papkalar shifrlanmoqda",
      "Ransomware is spreading on the file server, new folders encrypted every minute",
    ),
    impact: 3,
    urgency: 3,
  },
];

export const severity = (i: Incident) => i.impact * i.urgency;

/** The order the lesson starts from: the order the reports came in. */
export const QUEUE = ["laptop", "deface", "exfil", "ransom"];

export const triageSolved = (order: string[]) => {
  const s = order.map((id) => severity(INCIDENTS.find((i) => i.id === id)!));
  return s.every((v, i) => i === 0 || s[i - 1] >= v);
};

// --- Containment -------------------------------------------------------------------------

export const MOVES = [
  "isolate",
  "memory",
  "account",
  "poweroff",
  "reimage",
  "chat",
] as const;
export type Move = (typeof MOVES)[number];

export type Outcome = { good: boolean; why: Text };

export const OUTCOMES: Record<Move, Outcome> = {
  isolate: {
    good: true,
    why: t(
      "Zararlangan xostlar tarmoqdan uzildi — shifrlash boshqa serverlarga o‘tmaydi.",
      "Infected hosts cut off from the network — the encryption can’t reach other servers.",
    ),
  },
  memory: {
    good: true,
    why: t(
      "Bitta zararlangan xostning RAM’i olindi — kalitlar va zararli jarayon dalil sifatida saqlanadi.",
      "Memory captured from one infected host — keys and the malicious process are kept as evidence.",
    ),
  },
  account: {
    good: true,
    why: t(
      "Buzilgan domen hisobi bloklandi — hujumchi u bilan qayta kira olmaydi.",
      "The compromised domain account is disabled — the attacker can’t come back with it.",
    ),
  },
  poweroff: {
    good: false,
    why: t(
      "Hamma kompyuter o‘chirildi — RAM’dagi dalillar yo‘qoldi, butun kompaniya to‘xtadi.",
      "Every computer powered off — the evidence in memory is gone and the whole company stops.",
    ),
  },
  reimage: {
    good: false,
    why: t(
      "Zararlanganlar darhol qayta o‘rnatildi — hujumchi qanday kirganini endi bilib bo‘lmaydi, u yana qaytadi.",
      "Infected machines reinstalled at once — nobody can now learn how the attacker got in, so they come back.",
    ),
  },
  chat: {
    good: false,
    why: t(
      "Hodisa kompaniya chatida muhokama qilindi — hujumchi buzilgan hisob orqali buni o‘qiydi.",
      "The incident was discussed in the company chat — the attacker reads it through the hacked account.",
    ),
  },
};

export const containSolved = (picked: Move[]) =>
  MOVES.every((m) => picked.includes(m) === OUTCOMES[m].good);
