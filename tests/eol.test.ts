import { test } from "node:test";
import assert from "node:assert/strict";
import { END_OF_LIFE, INVENTORY, inventoryRight } from "../src/lib/eol/tools";
import { LESSONS } from "../src/lib/eol/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("four of the eight inventory items are out of support", () => {
  assert.equal(INVENTORY.length, 8);
  assert.deepEqual(END_OF_LIFE, [1, 3, 5, 7]);
  assert.ok(inventoryRight([7, 5, 3, 1]));
  // Ubuntu 24.04 LTS is still supported.
  assert.ok(!inventoryRight([...END_OF_LIFE, 2]));
  assert.ok(!inventoryRight(END_OF_LIFE.slice(1)));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.eol.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("eol-1");
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
