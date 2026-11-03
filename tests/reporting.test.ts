import { test } from "node:test";
import assert from "node:assert/strict";
import { BELONG, DETAILS, reportRight } from "../src/lib/reporting/tools";
import { LESSONS } from "../src/lib/reporting/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("five of the eight items belong in a first report", () => {
  assert.equal(DETAILS.length, 8);
  assert.deepEqual(BELONG, [0, 1, 2, 4, 6]);
  assert.ok(reportRight([6, 4, 2, 1, 0]));
  // A password never goes in a report.
  assert.ok(!reportRight([...BELONG, 3]));
  assert.ok(!reportRight(BELONG.slice(1)));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.reporting.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("reporting-1");
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
