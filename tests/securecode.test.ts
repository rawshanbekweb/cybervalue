import { test } from "node:test";
import assert from "node:assert/strict";
import {
  allowlist,
  BYPASSES,
  bypassRight,
  denylist,
  FIXES,
  fixRight,
  LINES,
} from "../src/lib/securecode/tools";
import { LESSONS } from "../src/lib/securecode/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("the allowlist stops what gets past the denylist and keeps real names", () => {
  assert.deepEqual(BYPASSES, [
    "<ScRiPt>alert(1)</ScRiPt>",
    "<img src=x onerror=alert(1)>",
  ]);
  assert.ok(!denylist("<script>alert(1)</script>"));
  for (const name of ["Ali", "O'Brien", "Gulnora", "Jean-Luc"])
    assert.ok(allowlist(name), name);
  for (const bad of ["<b>", "a".repeat(41), "", "x; DROP TABLE"])
    assert.ok(!allowlist(bad), bad);
  assert.ok(bypassRight([...BYPASSES].reverse()));
  assert.ok(!bypassRight(BYPASSES.slice(0, 1)));
  assert.ok(!bypassRight([...BYPASSES, "Ali"]));
});

test("every fix is used once and the handler is fixed only when all are right", () => {
  assert.deepEqual([...LINES.map((l) => l.fix)].sort(), [...FIXES].sort());
  const calls = Object.fromEntries(LINES.map((l) => [l.no, l.fix]));
  assert.ok(fixRight(calls));
  assert.ok(!fixRight({ ...calls, 8: "generic" }));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.securecode.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("securecode-1");
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
