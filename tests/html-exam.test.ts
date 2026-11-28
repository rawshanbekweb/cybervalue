import test from "node:test";
import assert from "node:assert/strict";
import {
  buildExam,
  examSubject,
  gradeExam,
  isTopicExam,
  publicQuestions,
} from "../src/lib/domain-exam/build";
import { HTML_EXAM } from "../src/lib/domain-exam/html-exam";

test("the HTML exam has 30 well-formed questions up to forms", () => {
  const exam = examSubject("html-forms");
  assert.ok(exam && isTopicExam(exam));
  assert.equal(HTML_EXAM.questions.length, 30);
  assert.deepEqual(
    HTML_EXAM.modules.map(
      (_, t) => HTML_EXAM.questions.filter((q) => q.topic === t).length,
    ),
    [8, 7, 7, 8],
  );
  for (const q of HTML_EXAM.questions) {
    assert.ok(q.answer >= 0 && q.answer < q.options.length, q.ask.en);
    assert.ok(q.ask.uz && q.explain.uz && q.explain.en, q.ask.en);
    assert.equal(new Set(q.options.map((o) => o.en)).size, q.options.length);
  }
  const built = buildExam(exam, 4);
  const right = Object.fromEntries(built.map((q) => [q.id, q.answer]));
  assert.equal(gradeExam(exam, 4, right).percent, 100);
});

test("twelve questions show a rendered page, and it reaches the browser", () => {
  const shown = HTML_EXAM.questions.filter((q) => q.preview);
  assert.equal(shown.length, 12);
  // "Which code made this page?": the right option is exactly that page.
  for (const q of shown.filter((q) => q.ask.en.startsWith("The browser")))
    assert.equal(q.options[q.answer].en, q.preview);
  // The previews are static markup: no scripts, handlers or remote files.
  for (const q of shown)
    assert.doesNotMatch(q.preview!, /<script|\son\w+=|https?:/i);
  const exam = examSubject("html-forms")!;
  const pub = publicQuestions(buildExam(exam, 9));
  assert.equal(pub.filter((q) => q.preview).length, 12);
  assert.ok(!("answer" in pub[0]));
  const result = gradeExam(exam, 9, {});
  assert.equal(result.items.filter((i) => i.preview).length, 12);
});
