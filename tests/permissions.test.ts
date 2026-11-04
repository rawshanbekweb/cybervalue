import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EXCESSIVE,
  REQUESTS,
  requestsRight,
} from "../src/lib/permissions/tools";
import { LESSONS } from "../src/lib/permissions/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("four of the eight requests are more than the app needs", () => {
  assert.equal(REQUESTS.length, 8);
  assert.deepEqual(EXCESSIVE, [1, 3, 5, 7]);
  assert.ok(requestsRight([7, 5, 3, 1]));
  // A video call needs the camera.
  assert.ok(!requestsRight([...EXCESSIVE, 2]));
  assert.ok(!requestsRight(EXCESSIVE.slice(1)));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.permissions.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("permissions-1");
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
