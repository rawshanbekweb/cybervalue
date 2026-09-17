import type { Prisma } from "@/generated/prisma/client";

export const include = {
  tags: true,
  category: true,
  author: true,
  project: true,
  lab: true,
  research: true,
  ctf: true,
  resource: true,
  images: { orderBy: { position: "asc" as const } },
} satisfies Prisma.ContentInclude;
export type Entry = Prisma.ContentGetPayload<{ include: typeof include }>;
