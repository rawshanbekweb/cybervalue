import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import {
  COSTS,
  costOutcome,
  costRight,
  duration,
  FORGED,
  hmac,
  leak,
  sha256,
  stored,
  USERS,
  WEBHOOK,
  WEBHOOK_KEY,
  webhook,
} from "../src/lib/hashes/tools";
import { LESSONS } from "../src/lib/hashes/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("HMAC-SHA256 matches node:crypto, short and long keys alike", () => {
  for (const key of ["key", WEBHOOK_KEY, "k".repeat(100)])
    for (const message of ["", WEBHOOK, "o‘zbek"])
      assert.equal(
        hmac(key, message),
        createHmac("sha256", key).update(message).digest("hex"),
      );
});

test("without salt the table cracks and equal passwords show; with salt not", () => {
  const plain = leak(false);
  assert.equal(plain.cracked, 3);
  assert.equal(plain.shared, 2);
  const salted = leak(true);
  assert.equal(salted.cracked, 0);
  assert.equal(salted.shared, 0);
  const ali = USERS[0];
  assert.equal(
    stored(ali, true),
    createHash("sha256")
      .update(ali.salt + ali.password)
      .digest("hex"),
  );
  assert.equal(stored(ali, false), sha256(ali.password));
});

test("only bcrypt at a moderate cost is slow for attackers and quick for users", () => {
  assert.ok(!costRight({ algo: "sha256" }));
  const right = COSTS.filter((cost) => costRight({ algo: "bcrypt", cost }));
  assert.deepEqual(right, [8, 10, 12]);
  // Each step of cost doubles the work.
  const a = costOutcome({ algo: "bcrypt", cost: 10 });
  const b = costOutcome({ algo: "bcrypt", cost: 12 });
  assert.equal(b.loginMs, a.loginMs * 4);
  assert.equal(Math.round(b.seconds / a.seconds), 4);
  assert.equal(duration(90).unit.en, "minutes");
  assert.equal(duration(2 * 365 * 86400).n, 2);
  assert.equal(duration(0.0002).unit.en, "seconds");
});

test("a plain-hash webhook can be forged; an HMAC one cannot", () => {
  const plain = webhook(false);
  assert.ok(plain.genuine.accepted);
  assert.ok(plain.forged.accepted);
  assert.equal(plain.forged.body, FORGED);
  const signed = webhook(true);
  assert.ok(signed.genuine.accepted);
  assert.ok(!signed.forged.accepted);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.hashes.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("hashes-1");
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
