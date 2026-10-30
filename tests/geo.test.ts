import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ANSWER,
  CLUES,
  earliest,
  HITS,
  ORIGIN,
  reverseRight,
  sceneRight,
} from "../src/lib/geo/tools";
import { LESSONS } from "../src/lib/geo/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("the original is the earliest hit, and the claim is judged old", () => {
  assert.equal(earliest().id, ORIGIN);
  assert.equal(new Set(HITS.map((h) => h.id)).size, HITS.length);
  assert.ok(reverseRight(ORIGIN, "old"));
  assert.ok(!reverseRight(ORIGIN, "today"));
  assert.ok(!reverseRight("today", "old"));
});

test("the scene needs three clues and the right city", () => {
  const ids = CLUES.map((c) => c.id);
  assert.ok(sceneRight(ids.slice(0, 3), ANSWER));
  assert.ok(!sceneRight(ids.slice(0, 2), ANSWER));
  assert.ok(!sceneRight(ids, "almaty"));
  assert.ok(sceneRight(["sign", "sign", "plate", "dome"], ANSWER));
  for (const c of CLUES) {
    assert.ok(c.x > 0 && c.x < 400 && c.y > 0 && c.y < 240, c.id);
  }
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.geo.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("geo-1");
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
