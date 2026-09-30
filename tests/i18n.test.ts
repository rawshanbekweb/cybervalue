import { test } from "node:test";
import assert from "node:assert/strict";
import { createTranslator, resolveLocale } from "../src/lib/i18n";
import { HTML_LESSONS } from "../src/components/playground/html-basics/lessons.data";
import { CHALLENGES } from "../src/lib/ctf/catalog";

test("locale fallback, interpolation and unknown authored content remain predictable", () => {
  assert.equal(resolveLocale("en"), "en");
  for (const invalid of [null, undefined, "", "ru", "__proto__"])
    assert.equal(resolveLocale(invalid), "uz");
  assert.equal(
    createTranslator("uz")("Page {page} of {pages}", { page: 2, pages: 4 }),
    "2-sahifa / 4",
  );
  assert.equal(createTranslator("en")("Sukutdagi iz"), "A clue in the silence");
  assert.equal(createTranslator("uz")("My personal note"), "My personal note");
  assert.equal(createTranslator("uz")("toString"), "toString");
});

test("all HTML lesson instructions and checks have Uzbek translations", () => {
  const t = createTranslator("uz");
  for (const lesson of HTML_LESSONS) {
    for (const text of [
      lesson.title,
      lesson.intro,
      lesson.task,
      ...lesson.checks.map((check) => check.label),
    ]) {
      assert.notEqual(t(text), text, `Missing Uzbek translation: ${text}`);
    }
  }
});

test("all CTF narratives and hints have English translations without changing evidence", () => {
  const t = createTranslator("en");
  for (const challenge of CHALLENGES) {
    for (const text of [
      challenge.title,
      challenge.brief,
      challenge.objective,
      challenge.teaser,
      challenge.duration,
      ...challenge.hints,
    ]) {
      assert.notEqual(t(text), text, `Missing English translation: ${text}`);
    }
    for (const file of challenge.files)
      assert.equal(t(file.content), file.content);
  }
});
