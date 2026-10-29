import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ACQUIRED,
  admissible,
  brokenLink,
  COPIES,
  CUSTODY,
  intact,
  problems,
  STEPS,
  type Acquisition,
} from "../src/lib/evidence/tools";
import { LESSONS } from "../src/lib/evidence/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

const all = (on: boolean) =>
  Object.fromEntries(STEPS.map((s) => [s, on])) as Acquisition;

test("an acquisition stands up only with every step", () => {
  assert.ok(admissible(all(true)));
  assert.equal(problems(all(false)).length, STEPS.length);
  for (const s of STEPS) {
    const missing = { ...all(true), [s]: false };
    assert.ok(!admissible(missing));
    assert.deepEqual(
      problems(missing).map((p) => p.step),
      [s],
    );
  }
});

test("copies are intact only when every character matches", () => {
  assert.match(ACQUIRED, /^[0-9a-f]{64}$/);
  assert.deepEqual(
    COPIES.map((c) => [c.name, intact(c)]),
    [
      ["lab-copy-1.img", true],
      ["lab-copy-2.img", false],
      ["court-copy.img", true],
      ["laptop-usb.img", false],
    ],
  );
  // The altered ones differ in exactly one character.
  for (const c of COPIES.filter((c) => !intact(c))) {
    assert.equal(c.hash.length, 64);
    const diff = [...c.hash].filter((ch, i) => ch !== ACQUIRED[i]).length;
    assert.equal(diff, 1);
  }
});

test("the chain breaks where a hand-over starts with someone new", () => {
  assert.equal(brokenLink(CUSTODY), "lab");
  const mended = CUSTODY.map((e) =>
    e.id === "lab" ? { ...e, from: CUSTODY[1].to } : e,
  );
  assert.equal(brokenLink(mended), null);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.evidence.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("evidence-1");
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
