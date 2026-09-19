import { env } from "./env";

export const site = {
  name: "CyberValue",
  person: "Rawshanbek Gayipbaev",
  url: env.SITE_URL.replace(/\/$/, ""),
  description:
    "Rawshanbek Gayipbaev’s cybersecurity and software development portfolio. Projects, controlled labs, research, and lessons from real practice.",
  indexable: env.SITE_INDEXABLE,
};
export const collections = {
  work: {
    kind: "PROJECT",
    title: "Work",
    eyebrow: "Built with intention",
    description:
      "Software projects and security work, documented from the problem to the lessons learned.",
    empty: "Good work deserves a proper case study.",
    detail:
      "Projects will appear here with architecture, security decisions, and evidence of what was built.",
    singular: "Project",
    number: "01",
  },
  research: {
    kind: "RESEARCH",
    title: "Research",
    eyebrow: "Notes from the investigation",
    description:
      "Observations, questions, and deeper thinking on application security and secure development.",
    empty: "Room for the next good question.",
    detail:
      "Original research will appear here with clear reasoning, supporting evidence, and sources.",
    singular: "Research",
    number: "02",
  },
  labs: {
    kind: "LAB",
    title: "Labs",
    eyebrow: "Theory meets practice",
    description:
      "Controlled security experiments. The method, the discovery, and what it takes to fix it.",
    empty: "Every finding starts with a question.",
    detail:
      "Authorized lab writeups will document the environment, methodology, impact, and remediation.",
    singular: "Lab",
    number: "03",
  },
  ctf: {
    kind: "CTF",
    title: "CTF",
    eyebrow: "Challenge. Solve. Reflect.",
    description:
      "A record of real competitions, challenge writeups, and lessons carried forward.",
    empty: "The scoreboard starts with showing up.",
    detail:
      "Verified competition participation and challenge writeups will be recorded here as they happen.",
    singular: "CTF",
    number: "04",
  },
  resources: {
    kind: "RESOURCE",
    title: "Resources",
    eyebrow: "Useful beyond the session",
    description:
      "Technical references and practical resources to keep close while building and investigating.",
    empty: "Useful things take care to make.",
    detail:
      "Downloadable references will appear here with a version, publication date, and related work.",
    singular: "Resource",
    number: "05",
  },
} as const;
export type Collection = keyof typeof collections;
export function isCollection(value: string): value is Collection {
  return Object.hasOwn(collections, value);
}
export function collectionFor(kind: string): Collection {
  return (
    (Object.entries(collections).find(
      ([, value]) => value.kind === kind,
    )?.[0] as Collection | undefined) ?? "work"
  );
}
export function contentUrl(entry: { kind: string; slug: string }) {
  return `/${collectionFor(entry.kind)}/${entry.slug}`;
}
export const navigation = [
  { href: "/", label: "Overview" },
  ...Object.entries(collections).map(([key, value]) => ({
    href: `/${key}`,
    label: value.title,
  })),
  { href: "/playground", label: "Playground" },
  { href: "/about", label: "About" },
];
export const configuredSocials = [
  { platform: "GitHub", url: env.GITHUB_URL },
  { platform: "LinkedIn", url: env.LINKEDIN_URL },
  { platform: "Telegram", url: env.TELEGRAM_URL },
  { platform: "Instagram", url: env.INSTAGRAM_URL },
].filter((item): item is { platform: string; url: string } => !!item.url);
