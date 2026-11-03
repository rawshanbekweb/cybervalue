import { test } from "node:test";
import assert from "node:assert/strict";
import {
  customerShare,
  LAYERS,
  MODELS,
  splitRight,
} from "../src/lib/shared/tools";
import { LESSONS } from "../src/lib/shared/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("the customer's share shrinks from IaaS to SaaS but never reaches zero", () => {
  assert.deepEqual(MODELS.map(customerShare), [4, 3, 1]);
  const data = LAYERS.find((l) => l.id === "data")!;
  for (const m of MODELS) assert.equal(data.owner[m], "customer", m);
});

test("each split must be complete and right for its own model", () => {
  for (const m of MODELS) {
    const calls = Object.fromEntries(LAYERS.map((l) => [l.id, l.owner[m]]));
    assert.ok(splitRight(m, calls), m);
  }
  const iaas = Object.fromEntries(LAYERS.map((l) => [l.id, l.owner.iaas]));
  assert.ok(!splitRight("saas", iaas));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.shared.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("shared-1");
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
