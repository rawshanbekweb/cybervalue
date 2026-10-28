import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CAESAR_CIPHER,
  CAESAR_PLAIN,
  CAESAR_SHIFT,
  caesar,
  FREQ_CIPHER,
  FREQ_PLAIN,
  FREQ_SHIFT,
  keyUnderCrib,
  letterCounts,
  period,
  shiftBetween,
  topLetter,
  VIG_CIPHER,
  VIG_CRIB,
  VIG_KEY,
  VIG_PLAIN,
  vigenere,
} from "../src/lib/classical-ciphers/tools";
import { LESSONS } from "../src/lib/classical-ciphers/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("Caesar shifts letters only and undoes itself", () => {
  assert.equal(caesar("abc xyz", 3), "def abc");
  assert.equal(caesar("do‘st 1!", 1), "ep‘tu 1!");
  assert.equal(caesar(caesar("salom", 11), -11), "salom");
  assert.equal(caesar(CAESAR_CIPHER, -CAESAR_SHIFT), CAESAR_PLAIN);
  // Only the right shift reads as the message.
  const readable = Array.from({ length: 26 }, (_, n) => n).filter(
    (n) => caesar(CAESAR_CIPHER, -n) === CAESAR_PLAIN,
  );
  assert.deepEqual(readable, [CAESAR_SHIFT]);
});

test("in the frequency text “a” stands out, so its image gives the key", () => {
  const counts = letterCounts(FREQ_PLAIN);
  const sorted = [...counts].sort((a, b) => b - a);
  assert.equal(topLetter(FREQ_PLAIN), "a");
  // Clearly ahead of the next letter, not a near tie.
  assert.ok(sorted[0] >= sorted[1] * 1.5, `${sorted[0]} vs ${sorted[1]}`);
  assert.equal(shiftBetween("a", topLetter(FREQ_CIPHER)), FREQ_SHIFT);
  assert.equal(caesar(FREQ_CIPHER, -FREQ_SHIFT), FREQ_PLAIN);
});

test("Vigenère round-trips, and the known first word shows the key", () => {
  assert.equal(vigenere("aaaaaa", "kalit"), "kalitk");
  assert.equal(
    vigenere(vigenere("salom, do‘st!", "abc"), "abc", true),
    "salom, do‘st!",
  );
  assert.equal(vigenere("salom", ""), "salom");
  assert.equal(vigenere(VIG_CIPHER, VIG_KEY, true), VIG_PLAIN);
  assert.equal(keyUnderCrib(VIG_CIPHER, VIG_CRIB), VIG_KEY);
  assert.equal(period(keyUnderCrib(VIG_CIPHER, "salomdostim")), VIG_KEY);
  assert.equal(period("abab"), "ab");
  assert.equal(period("abc"), "abc");
  // A wrong key does not open it.
  assert.notEqual(vigenere(VIG_CIPHER, "kalim", true), VIG_PLAIN);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.classic.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("classic-1");
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
