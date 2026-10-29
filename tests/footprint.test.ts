import { test } from "node:test";
import assert from "node:assert/strict";
import { ACTIONS, auditRight, FINDINGS } from "../src/lib/footprint/tools";
import { LESSONS } from "../src/lib/footprint/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("every action is used twice and only the right calls pass", () => {
  for (const a of ACTIONS)
    assert.equal(FINDINGS.filter((f) => f.action === a).length, 2, a);
  const calls = Object.fromEntries(FINDINGS.map((f) => [f.id, f.action]));
  assert.ok(auditRight(calls));
  assert.ok(!auditRight({ ...calls, geotags: "keep" }));
  assert.ok(!auditRight({}));
  for (const f of FINDINGS) assert.notEqual(f.why.uz, f.why.en);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.footprint.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("footprint-1");
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
