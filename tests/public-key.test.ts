import { test } from "node:test";
import assert from "node:assert/strict";
import {
  decryptRsa,
  encryptRsa,
  eveSearch,
  exchange,
  factor,
  GROUPS,
  middle,
  modInverse,
  modPow,
  PRIMES,
  rsaKey,
} from "../src/lib/public-key/tools";
import { LESSONS } from "../src/lib/public-key/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("modular arithmetic", () => {
  assert.equal(modPow(5n, 6n, 23n), 8n);
  assert.equal(modPow(2n, 10n, 1000n), 24n);
  assert.equal(modInverse(17n, 3120n), 2753n);
  assert.equal(modInverse(2n, 4n), null);
});

test("both sides of Diffie–Hellman get one key; Eve breaks only the small groups", () => {
  for (const g of GROUPS) {
    const x = exchange(g.id);
    assert.equal(x.aliceKey, x.bobKey, g.id);
  }
  assert.equal(eveSearch("p23", exchange("p23").A).found, 6n);
  assert.equal(eveSearch("p2087", exchange("p2087").A).found, 1234n);
  assert.equal(eveSearch("p61", exchange("p61").A).found, null);
});

test("every RSA key from the offered primes works and factors", () => {
  for (const p of PRIMES)
    for (const q of PRIMES) {
      const key = rsaKey(p, q);
      if (p === q) {
        assert.equal(key, null);
        continue;
      }
      assert.ok(key, `${p}×${q}`);
      assert.equal((key.e * key.d) % key.phi, 1n);
      assert.equal(decryptRsa(encryptRsa(42n, key), key), 42n);
      const f = factor(key.n)!;
      assert.equal(f[0] * f[1], key.n);
    }
  assert.deepEqual(rsaKey(61n, 53n), {
    n: 3233n,
    e: 17n,
    d: 2753n,
    phi: 3120n,
  });
});

test("Mallory reads both sides unless Bob's value is signed", () => {
  const open = middle(false);
  assert.ok(open.readsAlice && open.readsBob);
  assert.notEqual(open.aliceKey, open.bobKey);
  assert.ok(!open.stopped);
  assert.ok(middle(true).stopped);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.pubkey.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("pubkey-1");
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
