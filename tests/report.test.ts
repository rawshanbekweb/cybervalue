import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DRAFT,
  findingSolved,
  outlineSolved,
  PARTS,
  PIECES,
  SECTIONS,
} from "../src/lib/report/tools";
import { LESSONS } from "../src/lib/report/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("the outline must follow the section order", () => {
  assert.deepEqual([...DRAFT].sort(), SECTIONS.map((s) => s.id).sort());
  assert.ok(!outlineSolved(DRAFT));
  assert.ok(outlineSolved(SECTIONS.map((s) => s.id)));
});

test("a finding needs the four good parts and neither bad one", () => {
  const good = PARTS.filter((p) => PIECES[p].good);
  assert.deepEqual(good, ["what", "evidence", "impact", "fix"]);
  assert.ok(findingSolved(good));
  assert.ok(!findingSolved([...good, "guess"]));
  assert.ok(!findingSolved([...good, "secret"]));
  assert.ok(!findingSolved(good.slice(1)));
  // The good "what" piece gives its time in UTC.
  assert.match(PIECES.what.text.en, /UTC/);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.report.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("report-1");
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
