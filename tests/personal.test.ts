import { test } from "node:test";
import assert from "node:assert/strict";
import { HABITS, habitsRight, TO_FIX } from "../src/lib/personal/tools";
import { LESSONS } from "../src/lib/personal/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("four of the eight habits need fixing", () => {
  assert.equal(HABITS.length, 8);
  assert.deepEqual(TO_FIX, [0, 2, 3, 6]);
  assert.ok(habitsRight([6, 3, 2, 0]));
  // The password manager is a good habit.
  assert.ok(!habitsRight([...TO_FIX, 1]));
  assert.ok(!habitsRight(TO_FIX.slice(1)));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.personal.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("personal-1");
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
