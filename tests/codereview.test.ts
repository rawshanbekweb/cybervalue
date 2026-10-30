import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DIFF,
  FLAGGED,
  LEVELS,
  RATED,
  ratingRight,
  reviewRight,
} from "../src/lib/codereview/tools";
import { LESSONS } from "../src/lib/codereview/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("four of the ten diff lines have a problem", () => {
  assert.equal(DIFF.length, 10);
  assert.deepEqual(FLAGGED, [2, 5, 6, 8]);
  assert.ok(reviewRight([8, 6, 5, 2]));
  assert.ok(!reviewRight([2, 5, 6]));
  assert.ok(!reviewRight([...FLAGGED, 1]));
});

test("the findings use every level once", () => {
  assert.deepEqual(
    RATED.map((f) => f.level),
    [...LEVELS],
  );
  const ratings = Object.fromEntries(RATED.map((f) => [f.id, f.level]));
  assert.ok(ratingRight(ratings));
  assert.ok(!ratingRight({ ...ratings, idor: "low" }));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.codereview.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("codereview-1");
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
