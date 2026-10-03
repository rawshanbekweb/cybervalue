import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Entry } from "../src/lib/content-shared";
import {
  localizeEntry,
  translatedSlugsMatching,
} from "../src/lib/i18n/entries";
import { TRANSLATED_AT } from "../src/lib/i18n/entry-translations";

type Seed = {
  kind: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  project?: Record<string, unknown>;
  tags: { name: string; slug: string }[];
};
const seeds: Seed[] = JSON.parse(
  readFileSync("content/initial/entries.json", "utf8"),
);

function entryFrom(seed: Seed, updatedAt = new Date(TRANSLATED_AT - 1000)) {
  return {
    ...seed,
    updatedAt,
    category: {
      name: "Web Development and Security",
      slug: "web-development-security",
    },
    tags: seed.tags,
    project: seed.project ?? null,
    lab: null,
  } as unknown as Entry;
}

test("every seeded entry has an Uzbek title, summary and body that differ from the source", () => {
  for (const seed of seeds) {
    const uz = localizeEntry(entryFrom(seed), "uz");
    // The Uzbek-titled Linux guide keeps its authored title.
    if (seed.slug !== "linux-va-tarmoq-qollanma")
      assert.notEqual(uz.title, seed.title, `${seed.slug} title`);
    assert.notEqual(uz.summary, seed.summary, `${seed.slug} summary`);
    assert.notEqual(uz.body, seed.body, `${seed.slug} body`);
  }
});

test("project case study fields are all translated", () => {
  for (const seed of seeds.filter((s) => s.project)) {
    const uz = localizeEntry(entryFrom(seed), "uz");
    for (const [key, value] of Object.entries(seed.project!))
      if (typeof value === "string")
        assert.notEqual(
          (uz.project as unknown as Record<string, string>)[key],
          value,
          `${seed.slug} project.${key}`,
        );
  }
});

test("markdown links and code-like tokens survive translation", () => {
  for (const seed of seeds) {
    const uz = localizeEntry(entryFrom(seed), "uz");
    const links = (text: string) =>
      [...text.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
    assert.deepEqual(links(uz.body), links(seed.body), `${seed.slug} links`);
  }
});

test("the English view of the Uzbek-titled guide gets an English title", () => {
  const seed = seeds.find((s) => s.slug === "linux-va-tarmoq-qollanma")!;
  assert.match(
    localizeEntry(entryFrom(seed), "en").title,
    /^Linux and Networking/,
  );
});

test("an entry edited after translation keeps its authored text", () => {
  const seed = seeds[0];
  const edited = entryFrom(seed, new Date(TRANSLATED_AT + 60_000));
  const uz = localizeEntry(edited, "uz");
  assert.equal(uz.title, seed.title);
  assert.equal(uz.body, seed.body);
});

test("tag and category names are replaced only while they match the source", () => {
  const seed = seeds.find((s) => s.slug === "web-security-lab")!;
  const uz = localizeEntry(entryFrom(seed), "uz");
  assert.deepEqual(
    uz.tags.map((tag) => tag.name),
    ["Veb-xavfsizlik", "Laboratoriya"],
  );
  assert.equal(uz.category?.name, "Veb-dasturlash va xavfsizlik");

  const renamed = entryFrom({
    ...seed,
    tags: [{ name: "Web Security 2", slug: "web-security" }],
  });
  assert.equal(localizeEntry(renamed, "uz").tags[0].name, "Web Security 2");
  assert.equal(
    localizeEntry(entryFrom(seed), "en").tags[0].name,
    "Web security",
  );
});

test("searching in Uzbek finds entries whose stored text is English", () => {
  assert.ok(translatedSlugsMatching("xavfsizlik", "uz").length >= 3);
  assert.deepEqual(translatedSlugsMatching("xavfsizlik", "en"), []);
  assert.deepEqual(translatedSlugsMatching("zzzz-no-match", "uz"), []);
});
