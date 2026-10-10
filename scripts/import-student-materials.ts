import "dotenv/config";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { createTranslator } from "../src/lib/i18n";
import {
  checkMaterial,
  type MaterialFormValues,
} from "../src/lib/student/admin";
import {
  flagFor,
  newChallengeSecret,
  renderArtifact,
  splitVariants,
} from "../src/lib/student/challenge";
import { env } from "../src/lib/env";

// Imports private student materials from a folder kept out of git (answer
// keys and CTF templates must not be public). Each subfolder is one material:
//   meta.json     slug, kind, title, summary, maxAttempts, groups, position,
//                 artifactName (personal labs)
//   body.md       optional Markdown shown to students
//   quiz.txt      QUIZ questions in the ?/-/+ format, with optional ">"
//                 explanation lines under each question
//   artifact.txt  CHALLENGE template with {{flag}} placeholders
//   explanation.md  optional Markdown shown once a student has answered
//                 (one part per artifact variant, split by === variant ===)
// Existing materials are matched by slug and updated; their flag secret is
// kept, so flags students already found stay valid.

const USAGE =
  "Usage: npm run student:import -- [folder] [--validate-only] [--publish] [--preview]";
const t = createTranslator("en");

async function optional(path: string) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}

async function loadFolder(dir: string) {
  const meta = JSON.parse(await readFile(join(dir, "meta.json"), "utf8"));
  const values: MaterialFormValues = {
    slug: String(meta.slug ?? ""),
    kind: meta.kind,
    title: String(meta.title ?? ""),
    summary: String(meta.summary ?? ""),
    body: (await optional(join(dir, "body.md"))).trim(),
    quizText: await optional(join(dir, "quiz.txt")),
    artifact: await optional(join(dir, "artifact.txt")),
    artifactName: String(meta.artifactName ?? ""),
    explanation: await optional(join(dir, "explanation.md")),
    maxAttempts: Number(meta.maxAttempts ?? 1),
    groups: String(meta.groups ?? ""),
    position: Number(meta.position ?? 0),
    published: false,
  };
  const checked = checkMaterial(values);
  if ("error" in checked)
    throw new Error(`${dir}: ${t(checked.error, checked.values)}`);
  return checked.data;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) return console.log(USAGE);
  const root =
    args.find((a) => !a.startsWith("--")) ?? "content/private/student";
  const folders = (await readdir(root, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => join(root, e.name))
    .sort();
  if (!folders.length) throw new Error(`No material folders in ${root}`);

  const materials = [];
  for (const dir of folders) {
    if (!(await stat(join(dir, "meta.json"))).isFile()) continue;
    materials.push(await loadFolder(dir));
  }
  const slugs = new Set(materials.map((m) => m.slug));
  if (slugs.size !== materials.length) throw new Error("Duplicate slugs");

  for (const m of materials) {
    const detail =
      m.kind === "QUIZ"
        ? `${m.quiz?.length} questions`
        : m.kind === "CHALLENGE"
          ? `${splitVariants(m.artifact).length} variants → ${m.artifactName}`
          : "";
    console.log(`✓ ${m.kind.padEnd(9)} ${m.slug}  ${detail}`);
  }

  // Shows what one sample student would download, with the flag to expect.
  if (args.includes("--preview")) {
    const secret = newChallengeSecret();
    for (const m of materials.filter((m) => m.kind === "CHALLENGE"))
      for (const id of ["preview-a", "preview-b", "preview-c", "preview-d"]) {
        const { text, variant } = renderArtifact(m.artifact, secret, {
          id,
          name: "Namuna O‘quvchi",
        });
        console.log(
          `\n----- ${m.slug} · ${id} · variant ${variant} · flag ${flagFor(secret, id)}\n${text}`,
        );
      }
  }

  if (args.includes("--validate-only") || args.includes("--preview")) {
    console.log("\nValidation passed. Nothing was written.");
    return;
  }
  if (!env.DATABASE_URL)
    throw new Error("Set DATABASE_URL before importing materials");
  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: env.DATABASE_URL,
      connectionTimeoutMillis: 15000,
    }),
    log: [],
  });
  const publish = args.includes("--publish");
  try {
    for (const { quiz, ...fields } of materials) {
      const data = { ...fields, quiz: quiz ?? Prisma.DbNull };
      const existing = await db.studentMaterial.findUnique({
        where: { slug: fields.slug },
        select: { id: true, secret: true, published: true },
      });
      const secret =
        fields.kind === "CHALLENGE"
          ? (existing?.secret ?? newChallengeSecret())
          : existing?.secret;
      const published = publish || (existing?.published ?? false);
      await db.studentMaterial.upsert({
        where: { slug: fields.slug },
        create: { ...data, secret, published },
        update: { ...data, secret, published },
      });
      console.log(
        `${existing ? "updated" : "created"}  ${fields.slug}  ${published ? "(visible)" : "(hidden)"}`,
      );
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
