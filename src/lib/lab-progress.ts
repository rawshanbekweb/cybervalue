// Lesson progress of the four track labs, kept in the browser and, for a
// signed-in student, mirrored on the server so it follows them between
// devices and shows on their page. Each lab stores { "<lesson id>": true }.

export const LAB_PROGRESS = {
  network: { key: "cybervalue:network:progress:v1", total: 17 },
  linux: { key: "cybervalue:linux:progress:v1", total: 16 },
  html: { key: "htmldars:progress:v1", total: 12 },
  security: { key: "sabaq:progress:v1", total: 36 },
  http: { key: "cybervalue:http:progress:v1", total: 10 },
  httpbasics: { key: "cybervalue:http-basics:progress:v1", total: 9 },
  https: { key: "cybervalue:https:progress:v1", total: 9 },
  bash: { key: "cybervalue:bash:progress:v1", total: 9 },
} as const;

export type LabId = keyof typeof LAB_PROGRESS;

// Names and pages of the labs, for the student page and assignments.
export const LAB_META: {
  id: LabId;
  title: { uz: string; en: string };
  href: string;
}[] = [
  {
    id: "network",
    title: { uz: "IP manzillash laboratoriyasi", en: "IP addressing lab" },
    href: "/akademiya/network-basics",
  },
  {
    id: "linux",
    title: { uz: "Linux asoslari laboratoriyasi", en: "Linux foundations lab" },
    href: "/akademiya/linux-basics",
  },
  {
    id: "html",
    title: { uz: "HTML asoslari", en: "HTML Basics" },
    href: "/akademiya/html-basics",
  },
  {
    id: "security",
    title: { uz: "Veb-xavfsizlik laboratoriyasi", en: "Web Security Lab" },
    href: "/akademiya/web-security-lab",
  },
  {
    id: "httpbasics",
    title: { uz: "HTTP asoslari", en: "HTTP basics" },
    href: "/akademiya/http-basics",
  },
  {
    id: "https",
    title: { uz: "HTTPS va TLS", en: "HTTPS and TLS" },
    href: "/akademiya/https",
  },
  {
    id: "bash",
    title: { uz: "Bash asoslari", en: "Bash basics" },
    href: "/akademiya/bash",
  },
  {
    id: "http",
    title: {
      uz: "HTTP chuqurroq (Intermediate)",
      en: "HTTP in depth (Intermediate)",
    },
    href: "/akademiya/http",
  },
];

export const isLabId = (value: unknown): value is LabId =>
  typeof value === "string" && Object.hasOwn(LAB_PROGRESS, value);

/** Completed lesson numbers (1…total) from a stored record or a list. */
export function lessonList(raw: unknown, total: number): number[] {
  const ids = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? Object.entries(raw)
          .filter(([, done]) => done === true)
          .map(([id]) => Number(id))
      : [];
  return [
    ...new Set(
      ids.filter(
        (id): id is number => Number.isInteger(id) && id >= 1 && id <= total,
      ),
    ),
  ].sort((a, b) => a - b);
}

export const toRecord = (lessons: number[]) =>
  Object.fromEntries(lessons.map((id) => [String(id), true]));
