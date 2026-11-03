import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DOCKERFILE,
  dockerfileRight,
  RISKY,
} from "../src/lib/containers/tools";
import { LESSONS } from "../src/lib/containers/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("four of the eight Dockerfile lines are risky", () => {
  assert.equal(DOCKERFILE.length, 8);
  assert.deepEqual(RISKY, [0, 2, 4, 6]);
  assert.ok(dockerfileRight([6, 4, 2, 0]));
  // WORKDIR is harmless; flagging it is wrong.
  assert.ok(!dockerfileRight([...RISKY, 1]));
  assert.ok(!dockerfileRight(RISKY.slice(1)));
  for (const line of DOCKERFILE) if (line.risky) assert.ok(line.fix);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.containers.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("containers-1");
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
