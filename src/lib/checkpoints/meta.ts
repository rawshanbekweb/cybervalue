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
    id: "httpbasics-1",
    lab: { uz: "HTTP protokoli", en: "HTTP basics" },
    title: {
      uz: "Nazorat: so‘rov, javob, metod va holat kodi",
      en: "Checkpoint: requests, responses, methods and status codes",
    },
    covers: {
      uz: "Barcha darslardan 10 savol",
      en: "10 questions from every lesson",
    },
    href: "/akademiya/http-basics#checkpoints",
    pass: 70,
  },
  {
    id: "https-1",
    lab: { uz: "HTTPS va TLS", en: "HTTPS and TLS" },
    title: {
      uz: "Nazorat: shifrlash, TLS va sertifikatlar",
      en: "Checkpoint: encryption, TLS and certificates",
    },
    covers: {
      uz: "Barcha darslardan 10 savol",
      en: "10 questions from every lesson",
    },
    href: "/akademiya/https#checkpoints",
    pass: 70,
  },
  {
    id: "bash-1",
    lab: { uz: "Bash asoslari", en: "Bash basics" },
    title: {
      uz: "Nazorat: o‘zgaruvchi, sikl va skript",
      en: "Checkpoint: variables, loops and scripts",
    },
    covers: {
      uz: "Barcha darslardan 10 savol",
      en: "10 questions from every lesson",
    },
    href: "/akademiya/bash#checkpoints",
    pass: 70,
  },
  {
    id: "ssh-1",
    lab: { uz: "SSH", en: "SSH" },
    title: {
      uz: "Nazorat: SSH ulanish va kalitlar",
      en: "Checkpoint: SSH connections and keys",
    },
    covers: {
      uz: "Barcha darslardan 10 savol",
      en: "10 questions from every lesson",
    },
    href: "/akademiya/ssh#checkpoints",
    pass: 70,
  },
  {
    id: "crypto-1",
    lab: { uz: "Kriptografiya asoslari", en: "Cryptography basics" },
    title: {
      uz: "Nazorat: kodlash, hash, shifr va imzo",
      en: "Checkpoint: encoding, hashes, ciphers and signatures",
    },
    covers: {
      uz: "Barcha darslardan 10 savol",
      en: "10 questions from every lesson",
    },
    href: "/akademiya/crypto#checkpoints",
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
