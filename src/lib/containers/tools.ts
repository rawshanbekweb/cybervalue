// Academy Intermediate · Containers: an invented company's Dockerfile with
// four risky lines among eight. Each line carries the safer version.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export type Line = {
  code: string;
  risky: boolean;
  why: Text;
  fix?: string;
};

export const DOCKERFILE: Line[] = [
  {
    code: "FROM node:latest",
    risky: true,
    why: t(
      "“latest” har safar boshqa obraz bo‘lishi mumkin va katta, keraksiz paketlarga to‘la.",
      "“latest” can be a different image every build, and it is large and full of packages you don’t need.",
    ),
    fix: "FROM node:22-alpine@sha256:…",
  },
  {
    code: "WORKDIR /app",
    risky: false,
    why: t("Ishchi papkani belgilaydi.", "Sets the working directory."),
  },
  {
    code: "COPY . .",
    risky: true,
    why: t(
      ".dockerignore bo‘lmasa, .env, .git va kalitlar ham obrazga tushadi.",
      "Without a .dockerignore, .env, .git and keys end up in the image too.",
    ),
    fix: "COPY package*.json ./  # + .dockerignore",
  },
  {
    code: "RUN npm ci --omit=dev",
    risky: false,
    why: t(
      "Lock fayl bo‘yicha faqat kerakli paketlar.",
      "Only the packages needed, exactly as the lock file says.",
    ),
  },
  {
    code: "ENV API_KEY=sk_live_51Hx…",
    risky: true,
    why: t(
      "Sir obraz qatlamida qoladi: obrazni olgan har kim uni o‘qiydi.",
      "The secret stays in an image layer: anyone who pulls the image can read it.",
    ),
    fix: "# API_KEY is injected at runtime from the secret store",
  },
  {
    code: "EXPOSE 3000",
    risky: false,
    why: t(
      "Ilova qaysi portda tinglashini hujjatlaydi.",
      "Documents which port the app listens on.",
    ),
  },
  {
    code: "USER root",
    risky: true,
    why: t(
      "Ilovada zaiflik bo‘lsa, hujumchi konteyner ichida root bo‘ladi.",
      "If the app has a flaw, the attacker is root inside the container.",
    ),
    fix: "USER node",
  },
  {
    code: 'CMD ["node", "server.js"]',
    risky: false,
    why: t("Ilovani ishga tushiradi.", "Starts the app."),
  },
];

export const RISKY = DOCKERFILE.flatMap((l, i) => (l.risky ? [i] : []));

export const dockerfileRight = (picked: Iterable<number>) => {
  const set = new Set(picked);
  return set.size === RISKY.length && RISKY.every((i) => set.has(i));
};
