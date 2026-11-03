import { test } from "node:test";
import assert from "node:assert/strict";
import {
  evaluate,
  POLICY,
  policyRight,
  REQUESTS,
  type Statement,
} from "../src/lib/iam/tools";
import { LESSONS } from "../src/lib/iam/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("default deny, allow and an explicit deny that wins", () => {
  const policy: Statement[] = [
    { effect: "Allow", action: "s3:*", resource: "arn:aws:s3:::b/*" },
    { effect: "Deny", action: "s3:DeleteObject", resource: "arn:aws:s3:::b/*" },
  ];
  assert.equal(evaluate(policy, "s3:GetObject", "arn:aws:s3:::b/x"), "allow");
  assert.equal(
    evaluate(policy, "s3:DeleteObject", "arn:aws:s3:::b/x"),
    "explicit",
  );
  assert.equal(
    evaluate(policy, "s3:GetObject", "arn:aws:s3:::other/x"),
    "implicit",
  );
  // The bucket itself isn't matched by bucket/*.
  assert.equal(evaluate(policy, "s3:ListBucket", "arn:aws:s3:::b"), "implicit");
});

test("the reporter's six requests cover all three outcomes", () => {
  const out = REQUESTS.map((r) => evaluate(POLICY, r.action, r.resource));
  assert.deepEqual(out, [
    "allow",
    "explicit",
    "implicit",
    "allow",
    "implicit",
    "implicit",
  ]);
  const calls = Object.fromEntries(out.map((d, i) => [i, d === "allow"]));
  assert.ok(policyRight(calls));
  assert.ok(!policyRight({ ...calls, 1: true }));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.iam.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("iam-1");
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
