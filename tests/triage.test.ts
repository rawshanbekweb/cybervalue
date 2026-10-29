import { test } from "node:test";
import assert from "node:assert/strict";
import { ALERTS, allRight, right, VERDICTS } from "../src/lib/triage/tools";
import { LESSONS } from "../src/lib/triage/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("the queue has every kind of verdict and only the right calls clear it", () => {
  for (const v of VERDICTS)
    assert.ok(
      ALERTS.some((a) => a.verdict === v),
      v,
    );
  assert.equal(new Set(ALERTS.map((a) => a.id)).size, ALERTS.length);
  const answers = Object.fromEntries(ALERTS.map((a) => [a.id, a.verdict]));
  assert.ok(allRight(answers));
  assert.ok(!allRight({ ...answers, mimikatz: "close" }));
  assert.ok(!allRight({}));
  assert.ok(!right(ALERTS[0], undefined));
  for (const a of ALERTS) {
    assert.ok(a.context.length >= 2, a.id);
    assert.notEqual(a.why.uz, a.why.en);
  }
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.triage.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("triage-1");
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
