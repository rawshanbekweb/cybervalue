import { test } from "node:test";
import assert from "node:assert/strict";
import { ACTIONS, inWindow, LETTER, scopeRight } from "../src/lib/ethics/tools";
import { LESSONS } from "../src/lib/ethics/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("only in-window actions can be allowed, and the calls are checked", () => {
  for (const a of ACTIONS) if (a.allowed) assert.ok(inWindow(a.date), a.id);
  assert.ok(!inWindow("2026-10-30"));
  assert.ok(inWindow(LETTER.from) && inWindow(LETTER.to));
  assert.equal(ACTIONS.filter((a) => a.allowed).length, 3);
  const calls = Object.fromEntries(ACTIONS.map((a) => [a.id, a.allowed]));
  assert.ok(scopeRight(calls));
  assert.ok(!scopeRight({ ...calls, scan: true }));
  assert.ok(!scopeRight({}));
  for (const a of ACTIONS) assert.notEqual(a.why.uz, a.why.en);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.ethics.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("ethics-1");
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
