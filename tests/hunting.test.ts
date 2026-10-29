import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HOST_COUNT,
  layerRight,
  MATRIX,
  OUTLIER,
  REPORT,
  stacked,
  stackRight,
  TASKS,
} from "../src/lib/hunting/tools";
import { LESSONS } from "../src/lib/hunting/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("the report's techniques are on the matrix, one tactic each", () => {
  const all = MATRIX.flatMap((tactic) =>
    tactic.techniques.map((tech) => ({ tactic: tactic.id, id: tech.id })),
  );
  assert.equal(new Set(all.map((x) => x.id)).size, all.length);
  const tactics = REPORT.map((id) => all.find((x) => x.id === id)?.tactic);
  assert.ok(tactics.every(Boolean));
  assert.equal(new Set(tactics).size, REPORT.length);
  assert.ok(layerRight([...REPORT].reverse()));
  assert.ok(!layerRight(REPORT.slice(1)));
  assert.ok(!layerRight([...REPORT, "T1190"]));
});

test("stacking puts the rogue task first", () => {
  const rows = stacked();
  assert.equal(rows[0].name, OUTLIER);
  assert.equal(rows[0].hosts, 1);
  assert.ok(rows.every((r) => r.hosts >= 1 && r.hosts <= HOST_COUNT));
  assert.equal(rows.length, TASKS.length);
  assert.ok(stackRight(OUTLIER));
  assert.ok(!stackRight("Zoom Updater"));
  assert.ok(!stackRight(null));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.hunting.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("hunting-1");
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
