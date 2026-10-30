import { test } from "node:test";
import assert from "node:assert/strict";
import { DRIFTED, drifted, driftRight, ROWS } from "../src/lib/baseline/tools";
import { LESSONS } from "../src/lib/baseline/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("four of the seven settings have drifted from the baseline", () => {
  assert.equal(ROWS.length, 7);
  assert.deepEqual(DRIFTED, [
    "sshd: PasswordAuthentication",
    "ufw status",
    "kernel",
    "auditd",
  ]);
  assert.ok(!drifted(ROWS[0]));
  assert.ok(driftRight([...DRIFTED].reverse()));
  assert.ok(!driftRight(DRIFTED.slice(0, 3)));
  assert.ok(!driftRight([...DRIFTED, "/etc/shadow"]));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.baseline.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("baseline-1");
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
