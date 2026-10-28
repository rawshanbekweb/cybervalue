import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ACCOUNT,
  FIELDS,
  LIMITS,
  limitOutcome,
  limitRight,
  NEEDED,
  patchMe,
  respond,
  responseRight,
  triesProtected,
  validateOrder,
} from "../src/lib/api-security/tools";
import { LESSONS } from "../src/lib/api-security/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("the reply is right only with exactly the needed fields", () => {
  assert.ok(!responseRight(FIELDS));
  assert.ok(responseRight([...NEEDED]));
  assert.ok(responseRight(["avatar", "id", "name"]));
  assert.ok(!responseRight(["id", "name"]));
  assert.ok(!responseRight([...NEEDED, "email"]));
  assert.deepEqual(Object.keys(respond(["name", "id"])), ["id", "name"]);
});

test("without an allowlist any field is copied; with it only name and bio", () => {
  const body = '{"name": "Vali", "role": "admin", "balance": 1000000}';
  const open = patchMe(body, false);
  assert.ok(open.ok && open.escalated);
  assert.ok(open.ok && open.account.role === "admin");
  const safe = patchMe(body, true);
  assert.ok(safe.ok && !safe.escalated);
  assert.ok(safe.ok && safe.account.name === "Vali");
  assert.ok(safe.ok && safe.account.role === ACCOUNT.role);
  assert.deepEqual(safe.ok && safe.ignored, ["role", "balance"]);
  // A value of the wrong type and unknown fields are never copied.
  const odd = patchMe('{"balance": "999", "isAdmin": true}', false);
  assert.ok(odd.ok && !odd.escalated);
  assert.deepEqual(odd.ok && odd.ignored, ["balance", "isAdmin"]);
  assert.equal(patchMe("{", true).ok, false);
  assert.equal(patchMe("[1]", true).ok, false);
  assert.equal(patchMe("null", true).ok, false);
  assert.ok(triesProtected('{"role": "admin"}'));
  assert.ok(!triesProtected('{"name": "Ali"}'));
  assert.ok(!triesProtected("{"));
  // The base account is never changed in place.
  assert.equal(ACCOUNT.role, "student");
});

test("the order schema checks type, range and extra fields", () => {
  assert.deepEqual(validateOrder({ quantity: 3 }), []);
  assert.deepEqual(validateOrder({ quantity: 10, coupon: "YOZ25" }), []);
  for (const bad of [
    { quantity: 0 },
    { quantity: 11 },
    { quantity: 2.5 },
    { quantity: "3" },
    { quantity: 2, price: 0 },
    { quantity: 2, coupon: "x".repeat(21) },
    {},
    [],
    null,
  ])
    assert.notDeepEqual(validateOrder(bad), [], JSON.stringify(bad));
});

test("only a per-account limit of a few tries is both slow and kind", () => {
  const right = LIMITS.flatMap((limit) =>
    (["ip", "account"] as const)
      .filter((key) => limitRight(limit, key))
      .map((key) => `${limit}/${key}`),
  );
  assert.deepEqual(right, ["5/account"]);
  assert.equal(limitOutcome(null, "account").perMinute, 3000);
  assert.equal(limitOutcome(5, "ip").perMinute, 250);
  assert.equal(limitOutcome(5, "account").perMinute, 5);
  assert.ok(limitOutcome(1, "account").userBlocked);
  assert.ok(!limitOutcome(5, "account").userBlocked);
});

test("the curriculum is numbered, the schema sort agrees, quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.api.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
    if (lesson.id === 3 && w.type === "sort")
      for (const item of w.items)
        assert.equal(
          validateOrder(JSON.parse(item.label.en)).length === 0,
          item.bucket === "pass",
          item.label.en,
        );
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("api-1");
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
