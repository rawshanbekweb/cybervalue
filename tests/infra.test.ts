import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CERTS,
  ctRight,
  dnsRight,
  DOMAIN,
  INTERNAL,
  QUESTIONS,
  RECORDS,
  subdomains,
} from "../src/lib/infra/tools";
import { LESSONS } from "../src/lib/infra/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("the DNS answers are backed by the records", () => {
  for (const q of QUESTIONS) assert.ok(q.options.includes(q.answer), q.id);
  assert.ok(RECORDS.some((r) => r.type === "MX" && r.value.includes("google")));
  assert.ok(
    RECORDS.some(
      (r) => r.name === `blog.${DOMAIN}` && r.value.includes("NXDOMAIN"),
    ),
  );
  const right = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.answer]));
  assert.ok(dnsRight(right));
  assert.ok(!dnsRight({ ...right, shop: "WordPress" }));
});

test("the certificate log yields unique names without wildcards", () => {
  const names = subdomains();
  assert.equal(new Set(names).size, names.length);
  assert.ok(!names.some((n) => n.startsWith("*.")));
  assert.equal(names.length, 9);
  for (const n of INTERNAL) assert.ok(names.includes(n));
  assert.ok(ctRight([...INTERNAL].reverse()));
  assert.ok(!ctRight([...INTERNAL, `vpn.${DOMAIN}`]));
  assert.ok(CERTS.length > names.length - 2);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.infra.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("infra-1");
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
