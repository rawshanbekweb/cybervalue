import "dotenv/config";
import { readFile, stat, realpath } from "node:fs/promises";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { contentSchema, type ContentInput } from "../src/lib/validation";
import { downloadFilePath } from "../src/lib/files";
import { env } from "../src/lib/env";

function details(input: ContentInput) {
  switch (input.kind) {
    case "PROJECT":
      return {
        project: {
          upsert: {
            create: input.project,
            update: {
              ...input.project,
              repositoryUrl: input.project.repositoryUrl ?? null,
              liveUrl: input.project.liveUrl ?? null,
            },
          },
        },
      };
    case "LAB":
      return { lab: { upsert: { create: input.lab, update: input.lab } } };
    case "RESEARCH":
      return {
        research: {
          upsert: { create: input.research, update: input.research },
        },
      };
    case "CTF": {
      const value = {
        ...input.ctf,
        eventDate: new Date(input.ctf.eventDate),
        location: input.ctf.location ?? null,
        placement: input.ctf.placement ?? null,
      };
      return { ctf: { upsert: { create: value, update: value } } };
    }
    case "RESOURCE":
      return {
        resource: {
          upsert: { create: input.resource, update: input.resource },
        },
      };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((arg) => !arg.startsWith("--"));
  if (!file)
    throw new Error(
      "Usage: npm run content:import -- path/to/entry.json [--validate-only]",
    );
  if ((await stat(file)).size > 1024 * 1024)
    throw new Error("Content files must be under 1 MiB");
  const parsed = contentSchema.safeParse(
    JSON.parse(await readFile(file, "utf8")),
  );
  if (!parsed.success) {
    // Print field paths and validation messages, never the source body or credentials.
    throw new Error(
      parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n"),
    );
  }
  const input = parsed.data;
  for (const image of input.images) {
    const path = resolve("public", image.path.slice(1));
    if (!(await stat(path)).isFile())
      throw new Error("Referenced image is missing");
  }
  if (input.kind === "RESOURCE") {
    const path = downloadFilePath(input.resource.filePath);
    if ((await realpath(path)) !== path)
      throw new Error("Resource symlinks are not allowed");
    const info = await stat(path);
    if (!info.isFile() || info.size > 20 * 1024 * 1024)
      throw new Error("Resource must be a file under 20 MiB");
  }
  if (args.includes("--validate-only")) {
    console.log("Content validation passed. Nothing was written.");
    return;
  }
  if (!env.DATABASE_URL)
    throw new Error("Set DATABASE_URL before importing content");
  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
    }),
    log: [],
  });
  try {
    await db.$transaction(async (tx) => {
      const existing = await tx.content.findUnique({
        where: { slug: input.slug },
      });
      if (existing && existing.kind !== input.kind)
        throw new Error("An existing slug cannot change content type");
      const related = await tx.content.findMany({
        where: { slug: { in: input.relatedSlugs } },
        select: { id: true },
      });
      if (related.length !== new Set(input.relatedSlugs).size)
        throw new Error("Import related entries before referencing them");
      const author = await tx.user.upsert({
        where: { id: "rawshanbek" },
        create: { id: "rawshanbek", name: "Rawshanbek Gayipbaev" },
        update: {},
      });
      const category = input.category
        ? await tx.category.upsert({
            where: { slug: input.category.slug },
            create: input.category,
            update: { name: input.category.name },
          })
        : null;
      const tags = [];
      for (const tag of input.tags)
        tags.push(
          await tx.tag.upsert({
            where: { slug: tag.slug },
            create: tag,
            update: { name: tag.name },
          }),
        );
      const base = {
        kind: input.kind,
        title: input.title,
        summary: input.summary,
        body: input.body,
        status: input.status,
        featured: input.featured,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
      };
      const record = await tx.content.upsert({
        where: { slug: input.slug },
        create: {
          ...base,
          slug: input.slug,
          authorId: author.id,
          categoryId: category?.id,
        },
        update: { ...base, categoryId: category?.id ?? null },
      });
      const update: Prisma.ContentUpdateInput = {
        ...details(input),
        tags: { set: tags.map((tag) => ({ id: tag.id })) },
        related: { set: related },
        images: {
          deleteMany: {},
          create: input.images.map((image, position) => ({
            ...image,
            position,
          })),
        },
      };
      await tx.content.update({ where: { id: record.id }, data: update });
    });
    console.log(
      `Imported ${input.kind.toLowerCase()} as ${input.status.toLowerCase()}. Static pages refresh through ISR; rebuild for immediate removal of previously public content.`,
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch((error: unknown) => {
  // Prisma errors may contain connection details or source text; do not serialize them.
  const message =
    error instanceof Error && !error.name.startsWith("Prisma")
      ? error.message
      : "Database operation failed. Check connectivity and migrations.";
  console.error(message);
  process.exitCode = 1;
});
