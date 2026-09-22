import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, truncate, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseAdminQuery, adminPageHref } from "../src/lib/admin-query";
import {
  inspectResourceFile,
  listResourceFiles,
  MAX_RESOURCE_BYTES,
} from "../src/lib/resource-files";
import { writeContent, setContentStatus } from "../src/lib/content-write";
import { contentSchema } from "../src/lib/validation";
import type { PrismaClient, Prisma } from "../src/generated/prisma/client";

test("admin filters tolerate malformed query strings and retain valid filters", () => {
  assert.deepEqual(
    parseAdminQuery({
      q: ["a", "b"],
      status: "DELETED",
      page: "-2",
      sort: "bad",
    }),
    { q: "", status: "", page: 1, sort: "updated" },
  );
  const query = parseAdminQuery({
    q: "  security & web  ",
    status: "DRAFT",
    sort: "title",
    page: "2",
  });
  const url = new URL(
    adminPageHref("resources", query, 3),
    "https://example.test",
  );
  assert.equal(url.searchParams.get("q"), "security & web");
  assert.equal(url.searchParams.get("status"), "DRAFT");
  assert.equal(url.searchParams.get("sort"), "title");
  assert.equal(url.searchParams.get("page"), "3");
  assert.equal(parseAdminQuery({ page: "1000000000" }).page, 1);
});

test("resource inventory checks file existence, allowed names, directories and size boundary", async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), "cv-resource-test-"));
  t.after(() => rm(cwd, { recursive: true, force: true }));
  assert.deepEqual(await listResourceFiles(cwd), []);
  const directory = join(cwd, "content/private/downloads");
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "guide.pdf"), "test file");
  await writeFile(join(directory, "unsafe.exe"), "ignored");
  await mkdir(join(directory, "folder.pdf"));
  await writeFile(join(directory, "large.zip"), "");
  await truncate(join(directory, "large.zip"), MAX_RESOURCE_BYTES);
  assert.equal(
    (await inspectResourceFile("/downloads/large.zip", cwd)).status,
    "Available",
  );
  await truncate(join(directory, "large.zip"), MAX_RESOURCE_BYTES + 1);
  assert.equal(
    (await inspectResourceFile("/downloads/large.zip", cwd)).status,
    "Too large",
  );
  assert.equal(
    (await inspectResourceFile("/downloads/missing.pdf", cwd)).status,
    "Missing",
  );
  assert.equal(
    (await inspectResourceFile("/downloads/folder.pdf", cwd)).status,
    "Unavailable",
  );
  assert.equal(
    (await inspectResourceFile("/downloads/../secret.txt", cwd)).status,
    "Unavailable",
  );
  const files = await listResourceFiles(cwd);
  assert.equal(files.length, 3);
  assert.equal(
    files.find((file) => file.path === "/downloads/guide.pdf")?.size,
    9,
  );
});

const input = contentSchema.parse({
  kind: "RESEARCH",
  slug: "existing-entry",
  title: "Existing research",
  summary: "A research summary long enough for validation.",
  body: "Research body",
  research: {},
});

function existingDb(existing: { id: string; kind: string } | null) {
  return {
    $transaction: async (
      callback: (tx: Prisma.TransactionClient) => Promise<unknown>,
    ) =>
      callback({
        content: { findUnique: async () => existing },
      } as unknown as Prisma.TransactionClient),
  } as unknown as PrismaClient;
}

test("creating with an existing slug cannot overwrite an entry", async () => {
  await assert.rejects(
    writeContent(existingDb({ id: "one", kind: "RESEARCH" }), input, "owner", {
      mode: "create",
    }),
    /slug already exists/,
  );
});

test("editing a deleted entry or a different slug cannot recreate or overwrite content", async () => {
  await assert.rejects(
    writeContent(existingDb(null), input, "owner", { mode: "edit", id: "one" }),
    /no longer exists/,
  );
  await assert.rejects(
    writeContent(existingDb({ id: "two", kind: "RESEARCH" }), input, "owner", {
      mode: "edit",
      id: "one",
    }),
    /no longer exists/,
  );
});

test("publishing a resource without a file or an unauthorized lab is rejected before a write", async () => {
  const db = {
    content: {
      findUniqueOrThrow: async () => ({
        resource: null,
        lab: { authorized: false },
      }),
    },
  } as unknown as PrismaClient;
  await assert.rejects(
    setContentStatus(db, "one", "PUBLISHED", "RESOURCE"),
    /available resource file/,
  );
  await assert.rejects(
    setContentStatus(db, "one", "PUBLISHED", "LAB"),
    /Only authorized labs/,
  );
});
