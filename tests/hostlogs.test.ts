import { test } from "node:test";
import assert from "node:assert/strict";
import { EVENTS, eventsRight, SUSPICIOUS } from "../src/lib/hostlogs/tools";
import { LESSONS } from "../src/lib/hostlogs/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("four of the eight log events need investigating", () => {
  assert.equal(EVENTS.length, 8);
  assert.deepEqual(SUSPICIOUS, [1, 3, 5, 7]);
  assert.ok(eventsRight([7, 5, 3, 1]));
  // The nightly backup is routine.
  assert.ok(!eventsRight([...SUSPICIOUS, 2]));
  assert.ok(!eventsRight(SUSPICIOUS.slice(1)));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.hostlogs.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("hostlogs-1");
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
