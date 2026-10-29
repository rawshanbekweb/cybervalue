import { test } from "node:test";
import assert from "node:assert/strict";
import {
  acrostic,
  acrosticRight,
  bitsOf,
  COVER,
  decodeBits,
  hideBits,
  message,
  ONE,
  POEMS,
  SECRET,
  ZERO,
} from "../src/lib/stego/tools";
import { LESSONS } from "../src/lib/stego/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("both poems spell their answer", () => {
  for (const lang of ["uz", "en"] as const) {
    assert.equal(acrostic(POEMS[lang].lines), POEMS[lang].answer);
    assert.ok(acrosticRight(lang, POEMS[lang].answer.toLowerCase()));
  }
  assert.ok(acrosticRight("en", "meet now"));
  assert.ok(!acrosticRight("en", "ERTAGA"));
});

test("zero-width bits round-trip and stay invisible", () => {
  assert.equal(ZERO.charCodeAt(0), 0x200b);
  assert.equal(ONE.charCodeAt(0), 0x200c);
  assert.equal(hideBits("1").length, 8);
  assert.equal(bitsOf(hideBits("1")), "00110001");
  assert.equal(decodeBits(bitsOf(hideBits("Salom"))), "Salom");
  for (const lang of ["uz", "en"] as const) {
    const m = message(lang);
    // Strip the invisible characters and the cover is untouched.
    assert.equal(m.replace(/[​‌]/g, ""), COVER[lang]);
    assert.equal(m.length, COVER[lang].length + SECRET.length * 8);
    assert.equal(decodeBits(bitsOf(m)), SECRET);
  }
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.stego.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("stego-1");
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
