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
    href: "/playground/network-basics#checkpoints",
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
    href: "/playground/network-basics#checkpoints",
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
    href: "/playground/linux-basics#checkpoints",
    pass: 70,
  },
];

export const checkpointMeta = (id: string) =>
  CHECKPOINT_META.find((c) => c.id === id) ?? null;
