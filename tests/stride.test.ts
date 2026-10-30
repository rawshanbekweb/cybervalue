import { test } from "node:test";
import assert from "node:assert/strict";
import {
  boundaryRight,
  CROSSING,
  crosses,
  FLOWS,
  NODES,
  STRIDE,
  strideRight,
  THREATS,
} from "../src/lib/stride/tools";
import { LESSONS } from "../src/lib/stride/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("the flows that cross a boundary are the ones between zones", () => {
  assert.deepEqual(CROSSING, [1, 2, 3, 6]);
  for (const f of FLOWS) {
    assert.ok(NODES.some((n) => n.id === f.from));
    assert.ok(NODES.some((n) => n.id === f.to));
  }
  assert.ok(!crosses(FLOWS[3]));
  assert.ok(boundaryRight([6, 3, 2, 1]));
  assert.ok(!boundaryRight([1, 2, 3]));
  assert.ok(!boundaryRight([1, 2, 3, 4, 6]));
});

test("every STRIDE letter has exactly one threat", () => {
  for (const l of STRIDE)
    assert.equal(THREATS.filter((th) => th.letter === l).length, 1, l);
  const calls = Object.fromEntries(THREATS.map((th) => [th.id, th.letter]));
  assert.ok(strideRight(calls));
  assert.ok(!strideRight({ ...calls, admin: "D" }));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.stride.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("stride-1");
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
