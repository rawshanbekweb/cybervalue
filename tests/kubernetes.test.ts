import { test } from "node:test";
import assert from "node:assert/strict";
import { SETTINGS, settingsRight } from "../src/lib/kubernetes/tools";
import { LESSONS } from "../src/lib/kubernetes/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("four of the eight settings are risky", () => {
  assert.equal(SETTINGS.length, 8);
  const risky = SETTINGS.flatMap((s, i) => (s.risky ? [i] : []));
  assert.deepEqual(risky, [1, 3, 5, 7]);
  const calls = Object.fromEntries(SETTINGS.map((s, i) => [i, s.risky]));
  assert.ok(settingsRight(calls));
  assert.ok(!settingsRight({ ...calls, 0: true }));
  // Every setting must be called.
  const partial: Record<number, boolean> = { ...calls };
  delete partial[7];
  assert.ok(!settingsRight(partial));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.kubernetes.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("kubernetes-1");
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
