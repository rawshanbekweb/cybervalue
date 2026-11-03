import { test } from "node:test";
import assert from "node:assert/strict";
import { EMAIL, SIGNS, signsRight } from "../src/lib/manipulation/tools";
import { LESSONS } from "../src/lib/manipulation/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("five of the eight email parts are warning signs", () => {
  assert.equal(EMAIL.length, 8);
  assert.deepEqual(SIGNS, [0, 1, 4, 5, 6]);
  assert.ok(signsRight([6, 5, 4, 1, 0]));
  // A personal greeting alone isn't a sign.
  assert.ok(!signsRight([...SIGNS, 2]));
  assert.ok(!signsRight(SIGNS.slice(1)));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.manipulation.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("manipulation-1");
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
