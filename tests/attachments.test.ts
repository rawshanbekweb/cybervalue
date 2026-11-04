import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ATTACHMENTS,
  attachmentsRight,
  RISKY,
} from "../src/lib/attachments/tools";
import { LESSONS } from "../src/lib/attachments/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("four of the eight attachments should not be opened", () => {
  assert.equal(ATTACHMENTS.length, 8);
  assert.deepEqual(RISKY, [1, 3, 5, 7]);
  assert.ok(attachmentsRight([7, 5, 3, 1]));
  // A .docx in Protected View is fine.
  assert.ok(!attachmentsRight([...RISKY, 4]));
  assert.ok(!attachmentsRight(RISKY.slice(1)));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.attachments.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("attachments-1");
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
