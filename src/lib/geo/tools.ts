// Academy Intermediate · Images and location: reverse-image-search results
// for a "flood today" photo that is years old, and a drawn street scene whose
// clues place it in Tashkent. Simplified, but the clues are the ones
// geolocators really use; every name and number is invented.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- Reverse image search --------------------------------------------------------------

export type Hit = {
  id: string;
  site: string;
  date: string;
  caption: Text;
};

export const HITS: Hit[] = [
  {
    id: "today",
    site: "t.me/news_now_example",
    date: "2026-10-28",
    caption: t(
      "“Bugun shahar markazini suv bosdi!”",
      "“The city centre flooded today!”",
    ),
  },
  {
    id: "repost",
    site: "x.example/viral_daily",
    date: "2026-10-28",
    caption: t(
      "“Dahshat, hozirgina olingan surat”",
      "“Terrifying, photo taken just now”",
    ),
  },
  {
    id: "blog",
    site: "travel-blog.example",
    date: "2022-05-14",
    caption: t(
      "“Bahordagi kuchli yomg‘ir haqida eslatma”",
      "“A note on the heavy spring rain”",
    ),
  },
  {
    id: "origin",
    site: "photo-agency.example",
    date: "2019-04-02",
    caption: t(
      "“2019-yil aprel toshqini, fotograf: N. Rahimova”",
      "“April 2019 flood, photographer: N. Rahimova”",
    ),
  },
  {
    id: "stock",
    site: "stock-images.example",
    date: "2020-01-09",
    caption: t(
      "“Suv bosgan ko‘cha — litsenziyalangan surat”",
      "“Flooded street — licensed image”",
    ),
  },
];

export const ORIGIN = "origin";

export const earliest = (hits: Hit[] = HITS) =>
  [...hits].sort((a, b) => a.date.localeCompare(b.date))[0];

export const VERDICTS = ["today", "old"] as const;
export type Verdict = (typeof VERDICTS)[number];

export const reverseRight = (pick: string | null, verdict: Verdict | null) =>
  pick === ORIGIN && verdict === "old";

// --- The street scene ------------------------------------------------------------------

export type Clue = {
  id: string;
  label: Text;
  note: Text;
  /** Hotspot centre on the 400×240 drawing. */
  x: number;
  y: number;
};

export const CLUES: Clue[] = [
  {
    id: "sign",
    label: t("Do‘kon yozuvi", "The shop sign"),
    note: t(
      "“NON UYI” — o‘zbekcha, lotin yozuvida. Qozoq yoki turk tilida bunday yozilmaydi.",
      "“NON UYI” — Uzbek, in Latin script. Kazakh or Turkish wouldn’t spell it this way.",
    ),
    x: 168,
    y: 50,
  },
  {
    id: "plate",
    label: t("Mashina raqami", "The number plate"),
    note: t(
      "“01 A 123 BC” — O‘zbekiston raqami; 01 — Toshkent shahri kodi.",
      "“01 A 123 BC” — an Uzbek plate; 01 is the code for the city of Tashkent.",
    ),
    x: 186,
    y: 224,
  },
  {
    id: "traffic",
    label: t("Harakat yo‘nalishi", "Which side they drive on"),
    note: t(
      "Mashinalar o‘ng tomonda — Buyuk Britaniya, Yaponiya va boshqa chap tomonli davlatlar chiqib ketadi.",
      "Cars keep to the right — that rules out the UK, Japan and other left-driving countries.",
    ),
    x: 352,
    y: 224,
  },
  {
    id: "dome",
    label: t("Ko‘k gumbaz", "The blue dome"),
    note: t(
      "Ko‘k gumbaz Markaziy Osiyo me’morchiligiga xos — lekin bir o‘zi shaharni aytmaydi.",
      "A blue dome is typical of Central Asian architecture — but alone it doesn’t name the city.",
    ),
    x: 364,
    y: 40,
  },
];

export const CITIES = ["tashkent", "almaty", "istanbul", "baku"] as const;
export type City = (typeof CITIES)[number];
export const ANSWER: City = "tashkent";

export const CITY_NAMES: Record<City, Text> = {
  tashkent: t("Toshkent", "Tashkent"),
  almaty: t("Olmaota", "Almaty"),
  istanbul: t("Istanbul", "Istanbul"),
  baku: t("Boku", "Baku"),
};

/** Enough clues read, and the right city. */
export const sceneRight = (seen: Iterable<string>, city: City | null) =>
  new Set(seen).size >= 3 && city === ANSWER;
