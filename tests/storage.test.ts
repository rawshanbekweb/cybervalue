import { test } from "node:test";
import assert from "node:assert/strict";
import { BUCKETS, bucketsRight, RISKY } from "../src/lib/storage/tools";
import { LESSONS } from "../src/lib/storage/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("three of the five buckets leak data", () => {
  assert.equal(BUCKETS.length, 5);
  assert.deepEqual(RISKY, [
    "acme-db-backups",
    "acme-app-logs",
    "acme-dev-exports",
  ]);
  assert.ok(bucketsRight([...RISKY].reverse()));
  // Public website assets are fine; flagging them is wrong.
  assert.ok(!bucketsRight([...RISKY, "acme-website-assets"]));
  assert.ok(!bucketsRight(RISKY.slice(1)));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.storage.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("storage-1");
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
