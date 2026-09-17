import "dotenv/config";
import { readFile, stat, realpath } from "node:fs/promises";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { contentSchema } from "../src/lib/validation";
import { writeContent } from "../src/lib/content-write";
import { downloadFilePath } from "../src/lib/files";
import { env } from "../src/lib/env";

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
    const author = await db.user.upsert({
      where: { id: "rawshanbek" },
      create: { id: "rawshanbek", name: "Rawshanbek Gayipbaev" },
      update: {},
    });
    await writeContent(db, input, author.id);
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
