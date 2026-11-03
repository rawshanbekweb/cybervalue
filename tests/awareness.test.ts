import { test } from "node:test";
import assert from "node:assert/strict";
import { BACKFIRES, PLAN, planRight } from "../src/lib/awareness/tools";
import { LESSONS } from "../src/lib/awareness/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("four of the eight plan choices backfire", () => {
  assert.equal(PLAN.length, 8);
  assert.deepEqual(BACKFIRES, [1, 3, 4, 7]);
  assert.ok(planRight([7, 4, 3, 1]));
  // A Report button helps.
  assert.ok(!planRight([...BACKFIRES, 6]));
  assert.ok(!planRight(BACKFIRES.slice(1)));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.awareness.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("awareness-1");
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
