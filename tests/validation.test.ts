import { test } from "node:test";
import assert from "node:assert/strict";
import {
  contentSchema,
  filterSchema,
  isPublished,
  safeJsonLd,
  httpsUrl,
  slugSchema,
  resourcePath,
  imagePath,
} from "../src/lib/validation";
import { downloadFilePath } from "../src/lib/files";
import { allowRequest } from "../src/lib/rate-limit";
const entry = {
  kind: "RESEARCH",
  slug: "authorization-review",
  title: "Authorization review",
  summary: "A documented investigation of authorization boundaries.",
  body: "Evidence and methodology belong here.",
  research: { references: [] },
};
test("content defaults to draft and requires a publication date", () => {
  assert.equal(contentSchema.parse(entry).status, "DRAFT");
  assert.equal(
    contentSchema.safeParse({ ...entry, status: "PUBLISHED" }).success,
    false,
  );
  assert.equal(
    contentSchema.safeParse({
      ...entry,
      status: "PUBLISHED",
      publishedAt: "2025-01-01T00:00:00Z",
    }).success,
    true,
  );
});
test("rejects unknown fields, mismatched subtype, self-reference, unsafe links", () => {
  for (const changed of [
    { unexpected: true },
    { kind: "PROJECT" },
    { relatedSlugs: [entry.slug] },
    { research: { references: ["javascript:alert(1)"] } },
  ])
    assert.equal(
      contentSchema.safeParse({ ...entry, ...changed }).success,
      false,
    );
});
test("publication excludes drafts, archived, missing and future dates", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  for (const status of ["DRAFT", "ARCHIVED"])
    assert.equal(
      isPublished({ status, publishedAt: new Date("2025-01-01") }, now),
      false,
    );
  assert.equal(
    isPublished({ status: "PUBLISHED", publishedAt: null }, now),
    false,
  );
  assert.equal(
    isPublished(
      { status: "PUBLISHED", publishedAt: new Date("2027-01-01") },
      now,
    ),
    false,
  );
  assert.equal(
    isPublished({ status: "PUBLISHED", publishedAt: now }, now),
    true,
  );
});
test("slugs, resource paths and URLs reject traversal and executable schemes", () => {
  for (const slug of ["../admin", "Upper-case", "a/b", "a--b", ""])
    assert.equal(slugSchema.safeParse(slug).success, false);
  for (const path of [
    "/downloads/../secret.pdf",
    "/downloads/a..b.pdf",
    "/downloads/a.html",
    "/downloads/a.svg",
    "https://evil.test/a.pdf",
  ]) {
    assert.equal(resourcePath.safeParse(path).success, false);
    assert.throws(() => downloadFilePath(path));
  }
  assert.equal(
    resourcePath.safeParse("/downloads/reference-v1.pdf").success,
    true,
  );
  assert.equal(imagePath.safeParse("/images/injection.svg").success, false);
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,hi",
    "http://example.com",
    "https://user:secret@example.com",
  ])
    assert.equal(httpsUrl.safeParse(url).success, false);
});
test("filters bound query length, paging, arrays, and invalid dates", () => {
  for (const input of [
    { q: "a".repeat(121) },
    { page: -1 },
    { page: 1.1 },
    { page: 10001 },
    { q: ["one", "two"] },
    { year: "invalid" },
    { difficulty: "EXPERT" },
  ])
    assert.equal(filterSchema.safeParse(input).success, false);
  assert.equal(filterSchema.parse({ page: "2", q: "  test  " }).q, "test");
});
test("JSON-LD cannot close its script element", () => {
  const value = { title: "</script><script>alert(1)</script>" };
  assert.ok(!safeJsonLd(value).includes("<"));
  assert.deepEqual(JSON.parse(safeJsonLd(value)), value);
});
test("rate limit rejects bursts and expires buckets", () => {
  assert.equal(allowRequest("test", 100, 2, 1000), true);
  assert.equal(allowRequest("test", 101, 2, 1000), true);
  assert.equal(allowRequest("test", 102, 2, 1000), false);
  assert.equal(allowRequest("test", 1100, 2, 1000), true);
});
