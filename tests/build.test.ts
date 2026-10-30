import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ARTIFACTS,
  PARTS,
  SECTIONS,
  sectionsRight,
  STAGES,
  stagesRight,
} from "../src/lib/build/tools";
import { LESSONS } from "../src/lib/build/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("each stage makes one file, in order", () => {
  assert.deepEqual(
    ARTIFACTS.map((a) => a.stage),
    [...STAGES],
  );
  const picks = Object.fromEntries(ARTIFACTS.map((a) => [a.file, a.stage]));
  assert.ok(stagesRight(picks));
  assert.ok(!stagesRight({ ...picks, "hello.o": "linker" }));
});

test("every section is used and the map has to be complete", () => {
  for (const s of SECTIONS)
    assert.ok(
      PARTS.some((p) => p.section === s),
      s,
    );
  const picks = Object.fromEntries(PARTS.map((p) => [p.code, p.section]));
  assert.ok(sectionsRight(picks));
  assert.ok(!sectionsRight({ ...picks, "char buffer[4096];": ".data" }));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.build.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("build-1");
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
