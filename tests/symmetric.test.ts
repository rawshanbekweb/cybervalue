import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bytes,
  ctr,
  encrypt,
  encryptBlock,
  encryptPicture,
  KEY,
  MSG_A,
  MSG_B,
  nonceReuse,
  PAYMENT,
  PICTURE,
  repeatedBlocks,
  tamper,
  text,
  xor,
} from "../src/lib/symmetric/tools";
import { LESSONS } from "../src/lib/symmetric/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("the toy block cipher depends on every input and on the key", () => {
  const block = [1, 2, 3, 4, 5, 6, 7, 8];
  const c = encryptBlock(block, KEY);
  assert.equal(c.length, 8);
  assert.deepEqual(encryptBlock(block, KEY), c);
  assert.notDeepEqual(encryptBlock([1, 2, 3, 4, 5, 6, 7, 9], KEY), c);
  assert.notDeepEqual(encryptBlock(block, "other"), c);
});

test("ECB repeats on repeated blocks; CBC and CTR do not", () => {
  const flat = PICTURE.flat();
  assert.ok(repeatedBlocks(encrypt(flat, KEY, "ecb")) > 10);
  assert.equal(repeatedBlocks(encrypt(flat, KEY, "cbc", 7)), 0);
  assert.equal(repeatedBlocks(encrypt(flat, KEY, "ctr", 7)), 0);
  const ecb = encryptPicture("ecb", KEY);
  // Rows that are the same in the picture stay the same encrypted.
  assert.deepEqual(ecb[0], ecb[1]);
  assert.notDeepEqual(
    encryptPicture("cbc", KEY)[2],
    encryptPicture("cbc", KEY)[3],
  );
  assert.equal(ecb.length, PICTURE.length);
});

test("CTR is its own inverse and a reused nonce leaks the other message", () => {
  const c = ctr(bytes(MSG_B), KEY, 3);
  assert.equal(text(ctr(c, KEY, 3)), MSG_B);
  assert.equal(MSG_A.length, MSG_B.length);
  const reused = nonceReuse(false);
  assert.ok(reused.leaked);
  assert.equal(reused.recovered, MSG_B);
  const fresh = nonceReuse(true);
  assert.ok(!fresh.leaked);
  assert.notEqual(fresh.recovered, MSG_B);
  assert.deepEqual(xor([1, 2], [3, 4]), [2, 6]);
});

test("without a tag the changed sum is accepted; with one it is refused", () => {
  const open = tamper(false);
  assert.ok(open.accepted);
  assert.equal(open.read, PAYMENT.replace("sum=1", "sum=9"));
  const sealed = tamper(true);
  assert.ok(!sealed.accepted);
  assert.equal(sealed.read, null);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.symmetric.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("symmetric-1");
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
