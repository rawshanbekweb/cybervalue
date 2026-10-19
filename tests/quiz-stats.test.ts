import { test } from "node:test";
import assert from "node:assert/strict";
import {
  answerReview,
  hardest,
  questionStats,
} from "../src/lib/student/quiz-stats";

const quiz = [
  { prompt: "Default HTTPS port?", options: ["80", "443", "22"], answer: 1 },
  { prompt: "Gateway?", options: ["Router", "Switch"], answer: 0 },
];

test("per-question results count wrong, blank and the favourite trap", () => {
  const { counted, skipped, stats } = questionStats(quiz, [
    [1, 0],
    [0, 0],
    [0, null],
    [2, 1],
    [1], // saved before a question was added
    null,
  ]);
  assert.equal(counted, 4);
  assert.equal(skipped, 2);
  assert.deepEqual(stats[0].picks, [2, 1, 1]);
  assert.equal(stats[0].correct, 1);
  assert.equal(stats[0].wrongPercent, 75);
  assert.deepEqual(stats[0].trap, { label: "80", count: 2 });
  assert.equal(stats[1].blank, 1);
  assert.equal(stats[1].wrongPercent, 50);
  assert.deepEqual(
    hardest(stats).map((s) => s.index),
    [0, 1],
  );
});

test("no attempts means no percentages and no hardest list", () => {
  const { counted, stats } = questionStats(quiz, []);
  assert.equal(counted, 0);
  assert.equal(stats[0].wrongPercent, 0);
  assert.equal(stats[0].trap, null);
  assert.deepEqual(hardest(stats), []);
});

test("one attempt reads back question by question", () => {
  assert.deepEqual(answerReview(quiz, [1, null]), [
    {
      prompt: "Default HTTPS port?",
      chosen: "443",
      answer: "443",
      right: true,
    },
    { prompt: "Gateway?", chosen: null, answer: "Router", right: false },
  ]);
  // Saved before the questions changed: nothing lines up.
  assert.equal(answerReview(quiz, [1]), null);
  assert.equal(answerReview(quiz, null), null);
});
