// Academy Intermediate · Writing the report: putting a forensic report's
// sections in the order readers need them, and building one finding that
// holds up — with evidence and impact, and without guesses or secrets.
import type { Text } from "../network/ip";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- The outline --------------------------------------------------------------------------

export type Section = { id: string; title: Text; what: Text };

/** In the order a report presents them. */
export const SECTIONS: Section[] = [
  {
    id: "summary",
    title: t("Qisqacha xulosa", "Executive summary"),
    what: t(
      "Bir sahifa: nima bo‘ldi, qanday ta’sir qildi, nima qilindi, nima kerak.",
      "One page: what happened, the impact, what was done, what is needed.",
    ),
  },
  {
    id: "scope",
    title: t("Qamrov va usullar", "Scope and method"),
    what: t(
      "Nima tekshirildi, qaysi vositalar bilan va nima tekshirilmadi.",
      "What was examined, with which tools, and what was not.",
    ),
  },
  {
    id: "timeline",
    title: t("Xronologiya", "Timeline"),
    what: t(
      "Voqealar UTC vaqtida, manbasi bilan.",
      "The events in UTC, each with its source.",
    ),
  },
  {
    id: "findings",
    title: t("Topilmalar", "Findings"),
    what: t(
      "Har biri: nima, qayerda, dalil, ta’sir.",
      "Each one: what, where, the evidence, the impact.",
    ),
  },
  {
    id: "recommendations",
    title: t("Tavsiyalar", "Recommendations"),
    what: t(
      "Aniq harakatlar, mas’ul va muddat bilan.",
      "Concrete actions, with an owner and a date.",
    ),
  },
  {
    id: "appendix",
    title: t("Ilovalar", "Appendices"),
    what: t(
      "Xeshlar, saqlash zanjiri, to‘liq loglar va IOC ro‘yxati.",
      "Hashes, the chain of custody, full logs and the list of IOCs.",
    ),
  },
];

/** The order the draft came in. */
export const DRAFT = [
  "findings",
  "appendix",
  "timeline",
  "summary",
  "recommendations",
  "scope",
];

export const outlineSolved = (order: string[]) =>
  order.every((id, i) => SECTIONS[i].id === id);

// --- One finding ------------------------------------------------------------------------

export const PARTS = [
  "what",
  "evidence",
  "impact",
  "fix",
  "guess",
  "secret",
] as const;
export type Part = (typeof PARTS)[number];

export type Piece = { good: boolean; text: Text; why: Text };

export const PIECES: Record<Part, Piece> = {
  what: {
    good: true,
    text: t(
      "2026-10-03 02:13:55 UTC da 203.0.113.7 manzilidan web01 serveriga root sifatida parol bilan kirildi.",
      "On 2026-10-03 at 02:13:55 UTC, 203.0.113.7 logged in to web01 as root with a password.",
    ),
    why: t(
      "Nima, qachon (UTC), qayerda — aniq.",
      "What, when (UTC) and where — precisely.",
    ),
  },
  evidence: {
    good: true,
    text: t(
      "Dalil: E-03, /var/log/auth.log, 8-qator (SHA-256 2-ilovada).",
      "Evidence: E-03, /var/log/auth.log, line 8 (SHA-256 in Appendix 2).",
    ),
    why: t(
      "O‘quvchi har bir da’voni o‘zi tekshira oladi.",
      "The reader can check every claim for themselves.",
    ),
  },
  impact: {
    good: true,
    text: t(
      "Ta’sir: hujumchi server ustidan to‘liq nazoratga ega bo‘ldi va mijozlar bazasiga kira olgan.",
      "Impact: the attacker had full control of the server and could reach the customer database.",
    ),
    why: t(
      "Texnik bo‘lmagan o‘quvchi uchun “bu nima degani”.",
      "“What this means” for a non-technical reader.",
    ),
  },
  fix: {
    good: true,
    text: t(
      "Tavsiya: root’ga parol bilan kirishni o‘chirish (PermitRootLogin no) — mas’ul: IT, 10-noyabrgacha.",
      "Recommendation: turn off password logins for root (PermitRootLogin no) — owner: IT, by 10 November.",
    ),
    why: t(
      "Aniq harakat, mas’ul va muddat.",
      "A concrete action, an owner and a date.",
    ),
  },
  guess: {
    good: false,
    text: t(
      "Hujumchi, ehtimol, xorijiy davlat xakerlari guruhidan.",
      "The attacker is probably a foreign state hacking group.",
    ),
    why: t(
      "Dalilsiz taxmin — hisobotning ishonchliligini buzadi.",
      "A guess without evidence — it undermines the whole report.",
    ),
  },
  secret: {
    good: false,
    text: t(
      "Taxmin qilingan root paroli: Toshkent2026!",
      "The root password that was guessed: Toshkent2026!",
    ),
    why: t(
      "Hisobot ko‘p qo‘ldan o‘tadi — parollar va shaxsiy ma’lumotlar yashiriladi.",
      "A report passes through many hands — passwords and personal data are redacted.",
    ),
  },
};

export const findingSolved = (picked: Part[]) =>
  PARTS.every((p) => picked.includes(p) === PIECES[p].good);
