import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BASE,
  bits8,
  bitsToText,
  capacity,
  flip,
  flipRed,
  HEIGHT,
  HIDDEN,
  invisible,
  lowBits,
  MESSAGE,
  picture,
  plane,
  ROW,
  WIDTH,
  wordRight,
} from "../src/lib/lsb/tools";
import { LESSONS } from "../src/lib/lsb/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("flipping bit k moves the value by 2^k", () => {
  assert.equal(bits8(BASE[0]), "11001000");
  for (let k = 0; k < 8; k++) assert.equal(flipRed(k).change, 2 ** k);
  assert.equal(flip(200, 0), 201);
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7].filter(invisible), [0]);
});

test("the row's red LSBs spell the message", () => {
  assert.equal(ROW.length, MESSAGE.length * 8);
  assert.equal(bitsToText(lowBits(ROW)), MESSAGE);
  for (const p of ROW) for (const v of p) assert.ok(v >= 0 && v <= 255);
});

test("only blue bit 0 shows the hidden word", () => {
  const px = picture();
  assert.equal(px.length, WIDTH * HEIGHT);
  const blue0 = plane(px, "b", 0);
  const lit = blue0.filter(Boolean).length;
  assert.ok(lit > 50 && lit < 400, String(lit));
  // The word's planes differ from any other plane of the same channel.
  const red0 = plane(px, "r", 0);
  assert.notDeepEqual(blue0, red0);
  assert.ok(wordRight(HIDDEN.toLowerCase()));
  assert.ok(!wordRight("CV"));
});

test("capacity is pixels × channels ÷ 8", () => {
  assert.equal(capacity(100, 100), 3750);
  assert.equal(capacity(1920, 1080), 777_600);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.lsb.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("lsb-1");
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
