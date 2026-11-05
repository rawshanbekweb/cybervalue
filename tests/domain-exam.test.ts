import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EXAM_DOMAINS,
  buildExam,
  examDomain,
  gradeExam,
  publicQuestions,
} from "../src/lib/domain-exam/build";
import { DOMAIN_EXAM_PASS, PER_MODULE } from "../src/lib/domain-exam/content";
import { DOMAINS } from "../src/lib/intermediate/roadmap";

test("every roadmap domain has a final exam", () => {
  assert.equal(EXAM_DOMAINS.length, DOMAINS.length);
  assert.equal(examDomain("nope"), null);
  for (const domain of EXAM_DOMAINS) {
    const questions = buildExam(domain, 42);
    assert.equal(questions.length, domain.modules.length * PER_MODULE);
    assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
    for (const q of questions) {
      assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id);
      assert.ok(q.explain.uz && q.explain.en, q.id);
    }
  }
});

test("a seed always rebuilds the same exam", () => {
  const domain = examDomain("crypto")!;
  assert.deepEqual(buildExam(domain, 7), buildExam(domain, 7));
  assert.notDeepEqual(
    buildExam(domain, 7).map((q) => q.ask.en),
    buildExam(domain, 8).map((q) => q.ask.en),
  );
});

test("the browser never gets the answers or explanations", () => {
  const domain = examDomain("cloud")!;
  for (const q of publicQuestions(buildExam(domain, 3))) {
    assert.equal("answer" in q, false);
    assert.equal("explain" in q, false);
    assert.equal("href" in q, false);
  }
});

test("grading counts right answers and ignores invalid ones", () => {
  const domain = examDomain("human")!;
  const questions = buildExam(domain, 5);
  const all = Object.fromEntries(questions.map((q) => [q.id, q.answer]));
  const full = gradeExam(domain, 5, all);
  assert.equal(full.score, questions.length);
  assert.equal(full.percent, 100);
  assert.ok(full.passed);
  assert.ok(full.items.every((i) => i.correct && i.href.startsWith("/")));

  const none = gradeExam(domain, 5, { [questions[0].id]: 99 });
  assert.equal(none.score, 0);
  assert.equal(none.items[0].picked, null);
  assert.equal(none.passed, false);

  const needed = Math.ceil((questions.length * DOMAIN_EXAM_PASS) / 100);
  const some = Object.fromEntries(
    questions.slice(0, needed).map((q) => [q.id, q.answer]),
  );
  assert.ok(gradeExam(domain, 5, some).passed);
});
