import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BINS,
  embedded,
  GUILTY,
  looksEmbedded,
  natural,
  pairSpread,
  PHOTO_A,
  PHOTO_B,
  THRESHOLD,
} from "../src/lib/steganalysis/tools";
import { LESSONS } from "../src/lib/steganalysis/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("embedding evens out the pairs and keeps their totals", () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    const base = natural(seed);
    assert.equal(base.length, BINS);
    assert.ok(pairSpread(base) > THRESHOLD, `seed ${seed}`);
    const e = embedded(base);
    assert.ok(pairSpread(e) < THRESHOLD, `seed ${seed}`);
    for (let i = 0; i + 1 < BINS; i += 2)
      assert.equal(e[i] + e[i + 1], base[i] + base[i + 1]);
  }
});

test("photo B is the one with the payload", () => {
  assert.equal(GUILTY, "b");
  assert.ok(!looksEmbedded(PHOTO_A));
  assert.ok(looksEmbedded(PHOTO_B));
  assert.equal(pairSpread([0, 0, 5, 5]), 0);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.steganalysis.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("steganalysis-1");
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
