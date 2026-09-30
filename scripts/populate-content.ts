import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { contentSchema } from "../src/lib/validation";
import { writeContent } from "../src/lib/content-write";
import { prepareUpload, MAX_STORAGE_BYTES } from "../src/lib/upload-validation";
import { lockFileChanges } from "../src/lib/stored-files";
import { env } from "../src/lib/env";

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => !["--validate-only", "--publish"].includes(arg)))
    throw new Error(
      "Usage: tsx scripts/populate-content.ts [--validate-only] [--publish]",
    );
  const source: unknown = JSON.parse(
    await readFile(resolve("content/initial/entries.json"), "utf8"),
  );
  if (!Array.isArray(source))
    throw new Error("Expected an array of content entries");
  const entries = source.map((value) => contentSchema.parse(value));
  if (new Set(entries.map((entry) => entry.slug)).size !== entries.length)
    throw new Error("Duplicate content slug");
  const seen = new Set<string>();
  const resources = new Map<
    string,
    Awaited<ReturnType<typeof prepareUpload>>
  >();
  for (const entry of entries) {
    if (entry.relatedSlugs.some((slug) => !seen.has(slug)))
      throw new Error(`Related content must precede ${entry.slug}`);
    seen.add(entry.slug);
    if (entry.kind === "RESOURCE") {
      const filename = entry.resource.filePath.slice("/downloads/".length);
      const bytes = await readFile(
        resolve("content/initial/resources", filename),
      );
      resources.set(
        entry.slug,
        await prepareUpload(filename, "RESOURCE", bytes),
      );
    }
  }
  console.log(
    `Validated ${entries.length} entries and ${resources.size} downloadable files.`,
  );
  if (args.includes("--validate-only")) return;
  if (!env.DATABASE_URL)
    throw new Error("Set DATABASE_URL before importing content");
  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: env.DATABASE_URL,
      connectionTimeoutMillis: 15000,
    }),
    transactionOptions: { maxWait: 10000, timeout: 60000 },
    log: [],
  });
  try {
    const author = await db.user.upsert({
      where: { id: "rawshanbek" },
      create: { id: "rawshanbek", name: "Rawshanbek Gayipbaev" },
      update: {},
    });
    let created = 0;
    let skipped = 0;
    for (const entry of entries) {
      if (
        await db.content.findUnique({
          where: { slug: entry.slug },
          select: { id: true },
        })
      ) {
        console.log(`Preserved existing: ${entry.slug}`);
        skipped++;
        continue;
      }
      const resource = resources.get(entry.slug);
      let storedId: string | undefined;
      try {
        if (resource && entry.kind === "RESOURCE") {
          const stored = await db.$transaction(async (tx) => {
            await lockFileChanges(tx);
            const total = await tx.storedFile.aggregate({
              _sum: { size: true },
            });
            if ((total._sum.size ?? 0) + resource.size > MAX_STORAGE_BYTES)
              throw new Error("File library quota exceeded");
            return tx.storedFile.create({
              data: { ...resource, kind: "RESOURCE" },
            });
          });
          storedId = stored.id;
          entry.resource.filePath = stored.path;
        }
        const input = contentSchema.parse({
          ...entry,
          status: args.includes("--publish") ? "PUBLISHED" : "DRAFT",
          publishedAt: args.includes("--publish")
            ? new Date().toISOString()
            : undefined,
        });
        await writeContent(db, input, author.id, { mode: "create" });
        created++;
        console.log(`Created ${input.status}: ${entry.slug}`);
      } catch (error) {
        if (storedId)
          await db.$transaction(async (tx) => {
            await lockFileChanges(tx);
            const references = await tx.resource.count({
              where: { filePath: resource!.path },
            });
            if (!references)
              await tx.storedFile.delete({ where: { id: storedId } });
          });
        throw error;
      }
    }
    console.log(`Finished: ${created} created, ${skipped} preserved.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error && !error.name.startsWith("Prisma")
      ? error.message
      : "Database operation failed. Check connectivity and migrations.",
  );
  process.exitCode = 1;
});
