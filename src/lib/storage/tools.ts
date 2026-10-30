// Academy Intermediate · Storage and secrets: five storage buckets of an
// invented company, three of them exposing data they shouldn't. A public
// bucket is fine only when its contents are meant for everyone.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export type Bucket = {
  name: string;
  holds: Text;
  access: string;
  risky: boolean;
  why: Text;
};

export const BUCKETS: Bucket[] = [
  {
    name: "acme-website-assets",
    holds: t(
      "Sayt rasmlari, CSS va shriftlar",
      "The site’s images, CSS and fonts",
    ),
    access: "public read",
    risky: false,
    why: t(
      "Bular baribir har bir tashrifchiga yuboriladi: ochiq bo‘lishi kerak.",
      "Every visitor downloads these anyway: public is right.",
    ),
  },
  {
    name: "acme-db-backups",
    holds: t(
      "Har kungi ma’lumotlar bazasi zaxiralari",
      "Daily database backups",
    ),
    access: "public read",
    risky: true,
    why: t(
      "Butun bazaning nusxasi internetda hammaga ochiq.",
      "A copy of the whole database is open to the internet.",
    ),
  },
  {
    name: "acme-hr-documents",
    holds: t(
      "Shartnomalar va pasport nusxalari",
      "Contracts and passport scans",
    ),
    access: "private · SSE-KMS · versioning",
    risky: false,
    why: t(
      "Yopiq, shifrlangan va o‘chirilgan versiyalar qayta tiklanadi.",
      "Private, encrypted, and deleted versions can be restored.",
    ),
  },
  {
    name: "acme-app-logs",
    holds: t(
      "Ilova loglari (email va IP manzillar bilan)",
      "App logs (with emails and IPs)",
    ),
    access: "public list",
    risky: true,
    why: t(
      "Har kim fayllar ro‘yxatini ko‘rib, shaxsiy ma’lumotli loglarni yuklab oladi.",
      "Anyone can list the files and download logs full of personal data.",
    ),
  },
  {
    name: "acme-dev-exports",
    holds: t(
      "Dasturchilar sinov uchun olgan mijozlar eksporti",
      "Customer exports a developer took for testing",
    ),
    access: 'policy: Principal "*"',
    risky: true,
    why: t(
      "Bucket siyosati hammaga (Principal *) ruxsat beradi — va unda haqiqiy mijozlar ma’lumoti bor.",
      "The bucket policy allows everyone (Principal *) — and it holds real customer data.",
    ),
  },
];

export const RISKY = BUCKETS.filter((b) => b.risky).map((b) => b.name);

export const bucketsRight = (picked: Iterable<string>) => {
  const set = new Set(picked);
  return set.size === RISKY.length && RISKY.every((n) => set.has(n));
};
