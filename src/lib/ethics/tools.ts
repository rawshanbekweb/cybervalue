// Academy Intermediate · OSINT ethics and law: a signed authorisation for an
// OSINT assessment of an invented company, and research actions to check
// against it — target, method and date all have to fit. Simplified, but the
// shape is that of a real rules-of-engagement letter.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export const LETTER = {
  client: "Sarbon Logistics LLC",
  from: "2026-11-02",
  to: "2026-11-13",
  inScope: [
    t(
      "sarbon-logistics.example va uning subdomenlari",
      "sarbon-logistics.example and its subdomains",
    ),
    t(
      "Kompaniyaning ochiq sahifalari va ijtimoiy tarmoq akkauntlari",
      "The company’s public pages and social media accounts",
    ),
    t(
      "Xodimlarning ochiq kasbiy profillari (lavozim, bo‘lim)",
      "Employees’ public professional profiles (role, department)",
    ),
  ],
  outOfScope: [
    t(
      "Xodimlarning shaxsiy hayoti, oilasi, uy manzili",
      "Employees’ private lives, families and home addresses",
    ),
    t(
      "Faol skanerlash va xodimlar bilan bog‘lanish",
      "Active scanning and contacting employees",
    ),
    t("Hamkor va mijoz kompaniyalar", "Partner and customer companies"),
  ],
};

export type Action = {
  id: string;
  date: string;
  what: Text;
  allowed: boolean;
  why: Text;
};

export const ACTIONS: Action[] = [
  {
    id: "subdomains",
    date: "2026-11-03",
    what: t(
      "Sertifikat jurnallaridan (crt.sh) sarbon-logistics.example subdomenlarini yig‘ish",
      "Collecting sarbon-logistics.example subdomains from certificate logs (crt.sh)",
    ),
    allowed: true,
    why: t(
      "Domen ruxsat etilgan, usul passiv, sana muddat ichida.",
      "The domain is in scope, the method is passive and the date is inside the window.",
    ),
  },
  {
    id: "roles",
    date: "2026-11-04",
    what: t(
      "LinkedIn’dan IT bo‘limi xodimlari lavozimlarini ro‘yxatga olish",
      "Listing IT staff job titles from LinkedIn",
    ),
    allowed: true,
    why: t(
      "Ochiq kasbiy ma’lumot — ruxsat etilgan doirada.",
      "Public professional information — inside the scope.",
    ),
  },
  {
    id: "early",
    date: "2026-10-30",
    what: t(
      "Kompaniyaning ochiq GitHub repolaridan sirlar qidirish",
      "Searching the company’s public GitHub repos for secrets",
    ),
    allowed: false,
    why: t(
      "Maqsad to‘g‘ri, lekin ruxsat 2 noyabrdan boshlanadi — muddatdan oldin ish ruxsatsiz.",
      "The target is right, but the authorisation starts on 2 November — work before it is unauthorised.",
    ),
  },
  {
    id: "home",
    date: "2026-11-05",
    what: t(
      "Bosh direktorning uy manzili va farzandlari maktabini aniqlash",
      "Finding the CEO’s home address and children’s school",
    ),
    allowed: false,
    why: t(
      "Shaxsiy hayot va oila ruxsatdan tashqarida — va bunday to‘plash zarar keltirishi mumkin.",
      "Private life and family are out of scope — and gathering this can cause real harm.",
    ),
  },
  {
    id: "scan",
    date: "2026-11-06",
    what: t(
      "vpn.sarbon-logistics.example’ni nmap bilan skanerlash",
      "Scanning vpn.sarbon-logistics.example with nmap",
    ),
    allowed: false,
    why: t(
      "Domen ruxsat etilgan, lekin faol skanerlash taqiqlangan — bu passiv OSINT emas.",
      "The domain is in scope, but active scanning is excluded — it isn’t passive OSINT.",
    ),
  },
  {
    id: "partner",
    date: "2026-11-07",
    what: t(
      "Sarbon’ning yuk tashuvchi hamkori saytidagi xodimlar ro‘yxatini yig‘ish",
      "Collecting the staff list from Sarbon’s haulage partner’s website",
    ),
    allowed: false,
    why: t(
      "Hamkor kompaniya mijoz emas — uning roziligi yo‘q.",
      "The partner isn’t the client — it never agreed to this.",
    ),
  },
  {
    id: "archive",
    date: "2026-11-10",
    what: t(
      "Wayback Machine’da sarbon-logistics.example’ning eski sahifalarini ko‘rish",
      "Reading old pages of sarbon-logistics.example on the Wayback Machine",
    ),
    allowed: true,
    why: t(
      "Ochiq arxiv, ruxsat etilgan domen, muddat ichida.",
      "A public archive, an in-scope domain, inside the window.",
    ),
  },
];

export type Calls = Partial<Record<string, boolean>>;

export const scopeRight = (calls: Calls) =>
  ACTIONS.every((a) => calls[a.id] === a.allowed);

/** Dates compare as ISO strings. */
export const inWindow = (date: string) =>
  date >= LETTER.from && date <= LETTER.to;
