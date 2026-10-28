// Site-wide settings an admin controls without a deploy: the announcement
// banner, the home page headline, which sections are open and whether search
// engines may index the site. Stored as one JSON value; every read goes
// through `parseSiteConfig`, so a missing or damaged value falls back to the
// defaults field by field.

export type Bilingual = { uz: string; en: string };

export const SECTIONS = [
  // The directions, youngest first.
  { id: "kids", group: "main", label: "Academy Kids", href: "/kids" },
  {
    id: "junior",
    group: "main",
    label: "Academy Junior",
    href: "/junior",
  },
  { id: "academy", group: "main", label: "Academy labs", href: "/akademiya" },
  {
    id: "intermediate",
    group: "main",
    label: "Academy Intermediate",
    href: "/intermediate",
  },
  {
    id: "studentArea",
    group: "main",
    label: "Student portal",
    href: "/student",
  },
  {
    id: "scams",
    group: "main",
    label: "Scam simulator",
    href: "/firibgarlik",
  },
  // Labs inside the academy.
  {
    id: "network",
    group: "lab",
    label: "IP addressing lab",
    href: "/akademiya/network-basics",
  },
  {
    id: "linux",
    group: "lab",
    label: "Linux foundations lab",
    href: "/akademiya/linux-basics",
  },
  {
    id: "html",
    group: "lab",
    label: "HTML Basics",
    href: "/akademiya/html-basics",
  },
  {
    id: "security",
    group: "lab",
    label: "Web Security Lab",
    href: "/akademiya/web-security-lab",
  },
  {
    id: "httpbasics",
    group: "lab",
    label: "HTTP basics (animated)",
    href: "/akademiya/http-basics",
  },
  {
    id: "https",
    group: "lab",
    label: "HTTPS and TLS (animated)",
    href: "/akademiya/https",
  },
  {
    id: "bash",
    group: "lab",
    label: "Bash basics (animated)",
    href: "/akademiya/bash",
  },
  {
    id: "crypto",
    group: "lab",
    label: "Cryptography basics (animated)",
    href: "/akademiya/crypto",
  },
  {
    id: "ssh",
    group: "lab",
    label: "SSH (animated)",
    href: "/akademiya/ssh",
  },
  {
    id: "http",
    group: "lab",
    label: "HTTP in depth (Intermediate)",
    href: "/intermediate/http",
  },
  {
    id: "input",
    group: "lab",
    label: "Untrusted input (Intermediate)",
    href: "/intermediate/input",
  },
  {
    id: "browser",
    group: "lab",
    label: "Browser-side risks (Intermediate)",
    href: "/intermediate/browser",
  },
  {
    id: "access",
    group: "lab",
    label: "Access control (Intermediate)",
    href: "/intermediate/access",
  },
  {
    id: "api",
    group: "lab",
    label: "API security (Intermediate)",
    href: "/intermediate/api",
  },
  {
    id: "classic",
    group: "lab",
    label: "Classical ciphers (Intermediate)",
    href: "/intermediate/classic",
  },
  {
    id: "ctf",
    group: "lab",
    label: "00:17 CTF investigation",
    href: "/akademiya/ctf",
  },
  {
    id: "missions",
    group: "lab",
    label: "Investigation missions",
    href: "/akademiya/missions",
  },
  {
    id: "studio",
    group: "lab",
    label: "HTML & CSS project studio",
    href: "/akademiya/studio",
  },
  {
    id: "defend",
    group: "lab",
    label: "Build & Defend",
    href: "/akademiya/defend",
  },
  // The author's portfolio: projects, research, lab write-ups, CTF, resources.
  {
    id: "portfolio",
    group: "extra",
    label: "Portfolio and articles",
    href: "/work",
  },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export type SiteConfig = {
  announcement: { enabled: boolean; text: Bilingual; href: string };
  hero: { title: Bilingual; lead: Bilingual };
  sections: Record<SectionId, boolean>;
  // null follows the SITE_INDEXABLE environment variable.
  indexable: boolean | null;
  email: string;
};

const EMPTY: Bilingual = { uz: "", en: "" };

export const DEFAULT_CONFIG: SiteConfig = {
  announcement: { enabled: false, text: EMPTY, href: "" },
  hero: { title: EMPTY, lead: EMPTY },
  sections: Object.fromEntries(SECTIONS.map((s) => [s.id, true])) as Record<
    SectionId,
    boolean
  >,
  indexable: null,
  email: "",
};

const text = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const bilingual = (value: unknown, max: number): Bilingual => {
  const v = (value && typeof value === "object" ? value : {}) as Record<
    string,
    unknown
  >;
  return { uz: text(v.uz, max), en: text(v.en, max) };
};

// Internal paths, or https links.
export function safeHref(value: unknown) {
  const href = text(value, 300);
  if (/^\/(?!\/)[\w\-./#?=&%]*$/.test(href)) return href;
  try {
    const url = new URL(href);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

const EMAIL = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,190}\.[a-z]{2,}$/i;

export function parseSiteConfig(raw: unknown): SiteConfig {
  const v = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const a = (v.announcement ?? {}) as Record<string, unknown>;
  const h = (v.hero ?? {}) as Record<string, unknown>;
  const s = (v.sections ?? {}) as Record<string, unknown>;
  const email = text(v.email, 254);
  return {
    announcement: {
      enabled: a.enabled === true,
      text: bilingual(a.text, 200),
      href: safeHref(a.href),
    },
    hero: { title: bilingual(h.title, 80), lead: bilingual(h.lead, 300) },
    sections: Object.fromEntries(
      SECTIONS.map(({ id }) => [id, s[id] !== false]),
    ) as Record<SectionId, boolean>,
    indexable: typeof v.indexable === "boolean" ? v.indexable : null,
    email: EMAIL.test(email) ? email : "",
  };
}

/** The value in the visitor's language, or the other one when it is empty. */
export const pick = (value: Bilingual, locale: "uz" | "en") =>
  value[locale] || value[locale === "uz" ? "en" : "uz"];

/** The section a public path belongs to, if that section is switched off. */
export function closedSection(
  config: SiteConfig,
  path: string,
): SectionId | null {
  const portfolio = ["/work", "/research", "/labs", "/ctf", "/resources"];
  if (portfolio.some((p) => path === p || path.startsWith(`${p}/`)))
    return config.sections.portfolio ? null : "portfolio";
  const inside = (href: string) => path === href || path.startsWith(`${href}/`);
  const own = SECTIONS.filter(
    (s) => s.id !== "academy" && s.id !== "portfolio" && inside(s.href),
  );
  const section = own.sort((a, b) => b.href.length - a.href.length)[0];
  if (section) {
    if (!config.sections[section.id]) return section.id;
    // Labs also close with their level: the Academy, or Intermediate.
    const level = section.href.startsWith("/intermediate/")
      ? "intermediate"
      : "academy";
    if (section.group === "lab" && !config.sections[level]) return level;
    return null;
  }
  return path === "/akademiya" && !config.sections.academy ? "academy" : null;
}
