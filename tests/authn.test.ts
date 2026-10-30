import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CANDIDATES,
  check,
  policyRight,
  USERNAME,
} from "../src/lib/authn/tools";
import { LESSONS } from "../src/lib/authn/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("the policy checks length, the breached list and the username", () => {
  assert.equal(check("short1!", "x"), "short");
  assert.equal(check("Tashkent2024!", "x"), "blocked");
  assert.equal(check("Dilnoza-loves-tea", "dilnoza"), "username");
  assert.equal(check("correct horse battery staple", "dilnoza"), "ok");
  // Length counts characters, not bytes.
  assert.equal(check("olma-tog‘-daryo", "x"), "ok");
});

test("two candidates pass and every reason to reject appears", () => {
  const verdicts = CANDIDATES.map((p) => check(p, USERNAME));
  assert.equal(verdicts.filter((v) => v === "ok").length, 2);
  for (const v of ["short", "blocked", "username"] as const)
    assert.ok(verdicts.includes(v), v);
  const calls = Object.fromEntries(
    CANDIDATES.map((p) => [p, check(p, USERNAME) === "ok"]),
  );
  assert.ok(policyRight(calls));
  assert.ok(!policyRight({ ...calls, "P@ssw0rd": true }));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.authn.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("authn-1");
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
