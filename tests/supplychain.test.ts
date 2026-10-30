import { test } from "node:test";
import assert from "node:assert/strict";
import {
  advisoryFor,
  auditRight,
  compare,
  INSTALLS,
  LOCK,
  typoRight,
  VULNERABLE,
} from "../src/lib/supplychain/tools";
import { LESSONS } from "../src/lib/supplychain/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("versions compare by number, not as text", () => {
  assert.ok(compare("4.17.15", "4.17.21") < 0);
  assert.ok(compare("4.21.2", "4.20.0") > 0);
  assert.ok(compare("1.10.0", "1.9.9") > 0);
  assert.equal(compare("9.0.0", "9.0.0"), 0);
});

test("the affected packages are the ones older than their fix", () => {
  assert.deepEqual(VULNERABLE, ["lodash", "jsonwebtoken", "minimist"]);
  assert.ok(LOCK.some((d) => !d.direct && advisoryFor(d)));
  assert.ok(!advisoryFor(LOCK.find((d) => d.name === "express")!));
  assert.ok(auditRight(["minimist", "lodash", "jsonwebtoken"]));
  assert.ok(!auditRight(["lodash", "jsonwebtoken"]));
  assert.ok(!auditRight([...VULNERABLE, "express"]));
});

test("half the install commands are look-alikes", () => {
  assert.equal(INSTALLS.filter((p) => p.fake).length, 3);
  const calls = Object.fromEntries(INSTALLS.map((p, i) => [i, p.fake]));
  assert.ok(typoRight(calls));
  assert.ok(!typoRight({ ...calls, 0: true }));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.supplychain.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("supplychain-1");
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
