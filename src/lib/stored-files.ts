import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import {
  inspectResourceFile,
  listResourceFiles,
  type ResourceFile,
} from "./resource-files";

export const storedFileSelect = {
  id: true,
  path: true,
  name: true,
  kind: true,
  mimeType: true,
  size: true,
  width: true,
  height: true,
  createdAt: true,
} satisfies Prisma.StoredFileSelect;
export type StoredFileInfo = Prisma.StoredFileGetPayload<{
  select: typeof storedFileSelect;
}>;

// Serialize file deletion, quota checks and content references across app instances.
export async function lockFileChanges(tx: Prisma.TransactionClient) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(21709121)`;
}

export async function resourceFileInfo(
  db: PrismaClient | Prisma.TransactionClient,
  path: string,
): Promise<ResourceFile> {
  const stored = await db.storedFile.findUnique({
    where: { path },
    select: { kind: true, size: true },
  });
  return stored
    ? {
        path,
        size: stored.size,
        status: stored.kind === "RESOURCE" ? "Available" : "Unavailable",
      }
    : inspectResourceFile(path);
}

export async function availableResourceFiles(
  db: PrismaClient | null,
): Promise<ResourceFile[]> {
  const [local, stored] = await Promise.all([
    listResourceFiles(),
    db
      ? db.storedFile.findMany({
          where: { kind: "RESOURCE" },
          select: { path: true, size: true, name: true },
          orderBy: { createdAt: "desc" },
        })
      : [],
  ]);
  return [
    ...stored.map((file) => ({ ...file, status: "Available" as const })),
    ...local.filter((file) => !stored.some((item) => item.path === file.path)),
  ];
}
