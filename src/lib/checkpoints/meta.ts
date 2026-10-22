import type { Text } from "../network/ip";

// What the lab pages, the student page and the admin show about each
// checkpoint. The questions themselves live in questions.ts (server side).
export type CheckpointMeta = {
  id: string;
  lab: Text;
  title: Text;
  covers: Text;
  href: string;
  // Percent needed to pass.
  pass: number;
  /** Set for checkpoints of the Intermediate level. */
  level?: "intermediate";
};

export const CHECKPOINT_META: readonly CheckpointMeta[] = [
  {
    id: "network-1",
    lab: { uz: "IP manzillash laboratoriyasi", en: "IP addressing lab" },
    title: {
      uz: "Nazorat: IP, mask va gateway",
      en: "Checkpoint: IP, mask and gateway",
    },
    covers: { uz: "1–6-darslar · 12 savol", en: "Lessons 1–6 · 12 questions" },
    href: "/akademiya/network-basics#checkpoints",
    pass: 70,
  },
  {
    id: "network-2",
    lab: { uz: "IP manzillash laboratoriyasi", en: "IP addressing lab" },
    title: {
      uz: "Nazorat: manzillar qayerdan keladi",
      en: "Checkpoint: where addresses come from",
    },
    covers: {
      uz: "7–12-darslar · 10 savol",
      en: "Lessons 7–12 · 10 questions",
    },
    href: "/akademiya/network-basics#checkpoints",
    pass: 70,
  },
  {
    id: "linux-1",
    lab: { uz: "Linux laboratoriyasi", en: "Linux lab" },
    title: { uz: "Nazorat: Linux asoslari", en: "Checkpoint: Linux basics" },
    covers: {
      uz: "Barcha darslardan 10 savol",
      en: "10 questions from every lesson",
    },
    href: "/akademiya/linux-basics#checkpoints",
    pass: 70,
  },
  {
    id: "html-1",
    lab: { uz: "HTML asoslari", en: "HTML Basics" },
    title: { uz: "Nazorat: HTML asoslari", en: "Checkpoint: HTML basics" },
    covers: {
      uz: "Barcha 12 darsdan 10 savol",
      en: "10 questions from all 12 lessons",
    },
    href: "/akademiya/html-basics#checkpoints",
    pass: 70,
  },
  {
    id: "security-1",
    lab: { uz: "Veb-xavfsizlik laboratoriyasi", en: "Web Security Lab" },
    title: {
      uz: "Nazorat: veb-xavfsizlik asoslari",
      en: "Checkpoint: web security basics",
    },
    covers: {
      uz: "HTTP, auth, SQLi, XSS, IDOR · 12 savol",
      en: "HTTP, auth, SQLi, XSS, IDOR · 12 questions",
    },
    href: "/akademiya/web-security-lab#checkpoints",
    pass: 70,
  },
  {
    id: "http-1",
    level: "intermediate",
    lab: { uz: "HTTP chuqurroq", en: "HTTP in depth" },
    title: {
      uz: "Nazorat: HTTP, cookie, CORS va sarlavhalar",
      en: "Checkpoint: HTTP, cookies, CORS and headers",
    },
    covers: {
      uz: "1–10-darslar · 12 savol",
      en: "Lessons 1–10 · 12 questions",
    },
    href: "/intermediate/http#checkpoints",
    pass: 70,
  },
  {
    id: "input-1",
    level: "intermediate",
    lab: { uz: "Kiritilgan ma’lumot xavfi", en: "Untrusted input" },
    title: {
      uz: "Nazorat: inyeksiya, tekshiruv va kodlash",
      en: "Checkpoint: injection, validation and encoding",
    },
    covers: {
      uz: "1–9-darslar · 10 savol",
      en: "Lessons 1–9 · 10 questions",
    },
    href: "/intermediate/input#checkpoints",
    pass: 70,
  },
];

export const checkpointMeta = (id: string) =>
  CHECKPOINT_META.find((c) => c.id === id) ?? null;

/** The beginner-level checkpoints, which the "every checkpoint" awards count. */
export const BEGINNER_CHECKPOINTS = CHECKPOINT_META.filter((c) => !c.level);
