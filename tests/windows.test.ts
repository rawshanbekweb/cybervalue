import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ACL,
  aclRight,
  EVENTS,
  eventsRight,
  MEANINGS,
  RISKY_ACES,
} from "../src/lib/windows/tools";
import { LESSONS } from "../src/lib/windows/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("two of the six access entries are too broad", () => {
  assert.equal(ACL.length, 6);
  assert.deepEqual(RISKY_ACES, ["Everyone", "CORP\\Domain Users"]);
  assert.ok(aclRight([...RISKY_ACES].reverse()));
  assert.ok(!aclRight(["Everyone"]));
  assert.ok(!aclRight([...RISKY_ACES, "CORP\\HR-Payroll"]));
});

test("each event has its own meaning and a log line that doesn't give it away", () => {
  assert.deepEqual(
    [...EVENTS.map((e) => e.meaning)].sort(),
    [...MEANINGS].sort(),
  );
  for (const e of EVENTS) assert.ok(!/cleared|created|failed/i.test(e.line));
  const picks = Object.fromEntries(EVENTS.map((e) => [e.id, e.meaning]));
  assert.ok(eventsRight(picks));
  assert.ok(!eventsRight({ ...picks, 1102: "logon" }));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.windows.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("windows-1");
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
