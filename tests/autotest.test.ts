import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CHECKS,
  FINDINGS,
  PROBLEMS,
  pipelineRight,
  triageRight,
} from "../src/lib/autotest/tools";
import { LESSONS } from "../src/lib/autotest/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("half the findings are real and triage needs every call right", () => {
  assert.equal(FINDINGS.filter((f) => f.real).length, 3);
  const calls = Object.fromEntries(FINDINGS.map((f) => [f.id, f.real]));
  assert.ok(triageRight(calls));
  assert.ok(!triageRight({ ...calls, fixture: true }));
  assert.ok(!triageRight({ ...calls, exec: undefined }));
});

test("every check catches at least one problem", () => {
  for (const check of CHECKS)
    assert.ok(
      PROBLEMS.some((p) => p.check === check),
      check,
    );
  const picks = Object.fromEntries(PROBLEMS.map((p) => [p.id, p.check]));
  assert.ok(pipelineRight(picks));
  assert.ok(!pipelineRight({ ...picks, header: "sast" }));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.autotest.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("autotest-1");
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
