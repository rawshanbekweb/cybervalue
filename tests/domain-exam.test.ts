import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EXAM_DOMAINS,
  buildExam,
  examDomain,
  examSubject,
  gradeExam,
  isTopicExam,
  publicQuestions,
} from "../src/lib/domain-exam/build";
import { DOMAIN_EXAM_PASS, PER_MODULE } from "../src/lib/domain-exam/content";
import { DOMAINS } from "../src/lib/intermediate/roadmap";
import { SSH_CRYPTO_EXAM } from "../src/lib/domain-exam/topic-exams";

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

test("the SSH, cryptography and TLS exam has 40 questions, 8 per topic", () => {
  const exam = examSubject("ssh-crypto-tls");
  assert.ok(exam && isTopicExam(exam));
  assert.equal(SSH_CRYPTO_EXAM.questions.length, 40);
  for (let topic = 0; topic < SSH_CRYPTO_EXAM.modules.length; topic++)
    assert.equal(
      SSH_CRYPTO_EXAM.questions.filter((q) => q.topic === topic).length,
      8,
    );
  for (const q of SSH_CRYPTO_EXAM.questions) {
    assert.ok(q.answer >= 0 && q.answer < q.options.length, q.ask.en);
    assert.ok(q.ask.uz && q.explain.uz && q.explain.en, q.ask.en);
    assert.equal(new Set(q.options.map((o) => o.en)).size, q.options.length);
  }
});

test("a topic exam shuffles per seed but keeps every right answer", () => {
  const exam = examSubject("ssh-crypto-tls")!;
  const a = buildExam(exam, 11);
  const b = buildExam(exam, 12);
  assert.equal(a.length, 40);
  assert.deepEqual(buildExam(exam, 11), a);
  assert.notDeepEqual(
    a.map((q) => q.id),
    b.map((q) => q.id),
  );
  for (const q of a) {
    const bank = SSH_CRYPTO_EXAM.questions[Number(q.id.split(".")[1])];
    assert.deepEqual(q.options[q.answer], bank.options[bank.answer]);
  }
  const right = Object.fromEntries(a.map((q) => [q.id, q.answer]));
  assert.equal(gradeExam(exam, 11, right).percent, 100);
  assert.equal(gradeExam(exam, 11, {}).score, 0);
  assert.ok(!("answer" in publicQuestions(a)[0]));
});
