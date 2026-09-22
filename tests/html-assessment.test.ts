import { test } from "node:test";
import assert from "node:assert/strict";
import {
  challengeFor,
  questionsFor,
} from "../src/lib/html-assessment/challenge";
import { gradeAttempt } from "../src/lib/html-assessment/grading";
import { draftSchema } from "../src/lib/html-assessment/contract";
import { completedHtml } from "./fixtures/html-assessment";

for (const variant of [0, 1, 2]) {
  test(`variant ${variant + 1} accepts a complete semantic solution and rotated quiz answers`, () => {
    const code = completedHtml(variant);
    const answers = Object.fromEntries(
      questionsFor(variant).map((q) => [q.id, q.correct]),
    );
    const grade = gradeAttempt(variant, { code, answers });
    assert.equal(grade.total, 90, JSON.stringify(grade));
    assert.equal(grade.practical.length, 12);
    assert.equal(challengeFor(variant).questions.length, 6);
    assert.ok(challengeFor(variant).questions.every((q) => !("correct" in q)));
    assert.ok(
      gradeAttempt(variant, {
        code: challengeFor(variant).starter,
        answers: {},
      }).practicalScore < 30,
    );
  });
}

test("grader checks relationships and values, not the presence of tag-shaped text", () => {
  const code = completedHtml(0);
  const grade = (value: string) =>
    gradeAttempt(0, { code: value, answers: {} });
  assert.equal(
    grade(code.replace('for="email"', 'for="wrong"')).practical[7].points,
    0,
  );
  assert.equal(
    grade(code.replace('href="#signup"', 'href="#missing"')).practical[3]
      .points,
    0,
  );
  assert.equal(grade(code.replace("09:00", "18:00")).practical[6].points, 0);
  assert.equal(
    grade(code.replace('id="email"', 'id="name"')).practical[3].points,
    0,
  );
  assert.equal(
    grade(
      code.replace(/&lt;input&gt; &amp; &lt;label&gt;/, "<input> & <label>"),
    ).practical[10].points,
    0,
  );
  assert.equal(
    grade(
      `<!DOCTYPE html><html><head></head><body><!-- ${code} --></body></html>`,
    ).practical[7].points,
    0,
  );
  assert.equal(grade(`<template>${code}</template>`).practicalScore, 0);
});

test("forbidden active content zeroes only the practical section", () => {
  const answers = Object.fromEntries(
    questionsFor(0).map((q) => [q.id, q.correct]),
  );
  for (const injection of [
    "<script>alert(1)</script>",
    "<style>body{display:none}</style>",
    '<iframe src="https://example.com"></iframe>',
    "<p hidden>Secret</p>",
    '<img src="/icon.svg" onerror="alert(1)">',
    '<meta http-equiv="refresh" content="0;url=https://example.com">',
  ]) {
    const result = gradeAttempt(0, {
      code: completedHtml(0).replace("</body>", `${injection}</body>`),
      answers,
    });
    assert.equal(result.practicalScore, 0, injection);
    assert.equal(result.quizScore, 30);
    assert.ok(result.restrictions.length);
  }
});

test("draft validation rejects forged scores, oversized answers and invalid revisions", () => {
  const draft = {
    revision: 0,
    code: "",
    answers: {},
    explanations: ["", ""],
    signals: { hidden: 0, paste: 0, fullscreen: 0 },
  };
  assert.ok(draftSchema.safeParse(draft).success);
  for (const change of [
    { autoScore: 100 },
    { revision: -1 },
    { code: "x".repeat(24001) },
    { explanations: ["x".repeat(1601), ""] },
    { answers: { label: 4 } },
    { signals: { hidden: -1, paste: 0, fullscreen: 0 } },
  ])
    assert.equal(draftSchema.safeParse({ ...draft, ...change }).success, false);
});
