import { test } from "node:test";
import assert from "node:assert/strict";
import { DOCS, found, parse, search, TARGET } from "../src/lib/search/tools";
import { LESSONS } from "../src/lib/search/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("the parser understands the operators", () => {
  assert.deepEqual(
    parse('site:Example.org filetype:PDF intitle:index "price list" -draft x'),
    {
      site: "example.org",
      filetype: "pdf",
      intitle: ["index"],
      phrases: ["price list"],
      words: ["x"],
      exclude: ["draft"],
    },
  );
  assert.equal(parse("ext:docx").filetype, "docx");
});

test("narrowing the search leaves the one target", () => {
  assert.deepEqual(search(""), []);
  assert.equal(search('"price list"').length, 8);
  assert.equal(
    search('site:sarbon-logistics.example filetype:pdf "price list"').length,
    2,
  );
  assert.ok(
    found('site:sarbon-logistics.example filetype:pdf "price list" -draft'),
  );
  assert.ok(found("intitle:internal filetype:pdf"));
  assert.ok(!found("filetype:pdf"));
  assert.ok(DOCS.some((d) => d.url === TARGET));
  // site: takes subdomains in, other domains out.
  assert.ok(
    search("site:sarbon-logistics.example backup").some((d) =>
      d.url.startsWith("https://cdn."),
    ),
  );
  assert.equal(search("site:logistics.example").length, 0);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.search.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("search-1");
  assert.ok(checkpoint);
  const questions = questionsFor(checkpoint, 7);
  assert.equal(questions.length, 10);
  assert.equal(
    grade(
      questions,
      questions.map((q) => q.answer),
    ).percent,
    100,
  );
});
