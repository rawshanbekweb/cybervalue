import { test } from "node:test";
import assert from "node:assert/strict";
import {
  alerts,
  contentMatches,
  contentScore,
  contentSolved,
  normalize,
  peak,
  precision,
  SOURCES,
  thresholdSolved,
  WINDOWS,
} from "../src/lib/ids/tools";
import { LESSONS } from "../src/lib/ids/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("http.uri decodes %xx and collapses slashes", () => {
  assert.equal(normalize("/a%2fb"), "/a/b");
  assert.equal(normalize("/a//b///c"), "/a/b/c");
  assert.equal(normalize("/bad%zz"), "/bad%zz");
});

test("only normalized and case-blind matching catches every attack", () => {
  const ok = [];
  for (const normalized of [false, true])
    for (const nocase of [false, true])
      if (contentSolved({ normalized, nocase }))
        ok.push({ normalized, nocase });
  assert.deepEqual(ok, [{ normalized: true, nocase: true }]);
  const raw = contentScore({ normalized: false, nocase: false });
  assert.equal(raw.caught.length, 1);
  assert.equal(raw.missed.length, 3);
  assert.equal(raw.noise.length, 0);
  assert.ok(
    contentMatches(
      { normalized: true, nocase: false },
      "GET /download?file=..%2f..%2fetc%2fpasswd",
    ),
  );
});

test("peaks count events inside a sliding window", () => {
  assert.equal(peak([0, 15, 40], 60), 3);
  assert.equal(peak([0, 15, 40], 10), 1);
  assert.equal(peak([0, 60, 120], 60), 1);
  assert.equal(peak([], 60), 0);
});

test("only a long window catches the slow bot without paging on typos", () => {
  const ok: string[] = [];
  for (const seconds of WINDOWS)
    for (let count = 1; count <= 20; count++)
      if (thresholdSolved({ count, seconds })) ok.push(`${count}/${seconds}`);
  assert.deepEqual(
    ok,
    [4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => `${c}/300`),
  );
  const slow = SOURCES.find((s) => s.id === "slow")!;
  assert.equal(alerts({ count: 5, seconds: 60 }, slow), false);
  assert.equal(alerts({ count: 5, seconds: 300 }, slow), true);
  // The lesson starts wrong.
  assert.ok(!thresholdSolved({ count: 3, seconds: 60 }));
});

test("a small false-positive rate buries rare attacks", () => {
  const p = precision(1_000_000, 10, 0.99, 0.001);
  assert.ok(p > 0.009 && p < 0.011);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.ids.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
  // The final quiz's content-rule question agrees with the matcher.
  const final = LESSONS[7].widget;
  if (final.type === "quiz") {
    const q = final.questions[0];
    const line = (i: number) => q.options[i].en;
    const raw = { normalized: false, nocase: false };
    assert.equal(contentMatches(raw, line(q.answer)), false);
    for (let i = 0; i < q.options.length; i++)
      if (i !== q.answer) assert.equal(contentMatches(raw, line(i)), true);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("ids-1");
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
