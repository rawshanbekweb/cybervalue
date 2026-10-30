import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ACTIONS,
  ENTRIES,
  permsRight,
  RISKY,
  SERVICES,
  servicesRight,
} from "../src/lib/hardening/tools";
import { LESSONS } from "../src/lib/hardening/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("three of the seven entries are risky", () => {
  assert.equal(ENTRIES.length, 7);
  assert.deepEqual(RISKY, [
    "/etc/shadow",
    "/usr/local/bin/backup",
    "/etc/cron.daily/cleanup",
  ]);
  assert.ok(permsRight([...RISKY].reverse()));
  assert.ok(!permsRight(RISKY.slice(1)));
  assert.ok(!permsRight([...RISKY, "/tmp"]));
});

test("every action is used twice and only the right plan passes", () => {
  for (const a of ACTIONS)
    assert.equal(SERVICES.filter((s) => s.action === a).length, 2, a);
  const picks = Object.fromEntries(SERVICES.map((s) => [s.name, s.action]));
  assert.ok(servicesRight(picks));
  assert.ok(!servicesRight({ ...picks, "redis-server": "public" }));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.hardening.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("hardening-1");
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
