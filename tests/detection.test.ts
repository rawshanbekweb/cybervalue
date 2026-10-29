import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY,
  EVENTS,
  exe,
  holds,
  matches,
  perfect,
  score,
  sigma,
} from "../src/lib/detection/tools";
import { LESSONS } from "../src/lib/detection/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

const rule = (on: Partial<typeof EMPTY>) => ({ ...EMPTY, ...on });

test("only powershell + -enc, minus the automation account, is perfect", () => {
  const winners = [];
  for (const image of [false, true])
    for (const enc of [false, true])
      for (const office of [false, true])
        for (const filter of [false, true])
          if (perfect({ image, enc, office, filter }))
            winners.push({ image, enc, office, filter });
  assert.deepEqual(winners, [
    { image: true, enc: true, office: false, filter: true },
  ]);
  assert.equal(EVENTS.filter((e) => e.bad).length, 3);
});

test("each wrong choice costs something visible", () => {
  assert.deepEqual(score(EMPTY), { tp: 0, fp: 0, fn: 3 });
  assert.deepEqual(score(rule({ image: true, enc: true })), {
    tp: 3,
    fp: 2,
    fn: 0,
  });
  assert.deepEqual(score(rule({ enc: true, filter: true })), {
    tp: 3,
    fp: 1,
    fn: 0,
  });
  assert.deepEqual(
    score(rule({ image: true, enc: true, office: true, filter: true })),
    { tp: 1, fp: 0, fn: 2 },
  );
  assert.ok(holds("enc", EVENTS[7]));
  assert.ok(!matches(rule({ image: true, filter: true }), EVENTS[2]));
});

test("the rule prints as Sigma YAML", () => {
  const y = sigma(rule({ image: true, enc: true, filter: true }));
  assert.match(y, /Image\|endswith: '\\powershell\.exe'/);
  assert.match(y, /condition: selection and not filter/);
  assert.match(sigma(EMPTY), /condition: selection$/m);
  assert.equal(exe("C:\\Windows\\explorer.exe"), "explorer.exe");
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.detection.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("detection-1");
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
