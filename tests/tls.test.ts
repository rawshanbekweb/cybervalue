import { test } from "node:test";
import assert from "node:assert/strict";
import {
  certValid,
  checkCert,
  grade,
  nameMatches,
  stripping,
  strippingSafe,
  type TlsSetup,
} from "../src/lib/tls/tools";
import { LESSONS } from "../src/lib/tls/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade as gradeCheckpoint,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("a wildcard covers exactly one label", () => {
  assert.ok(nameMatches("*.shop.uz", "pay.shop.uz"));
  assert.ok(nameMatches("*.shop.uz", "PAY.SHOP.UZ"));
  assert.ok(!nameMatches("*.shop.uz", "shop.uz"));
  assert.ok(!nameMatches("*.shop.uz", "a.pay.shop.uz"));
  assert.ok(!nameMatches("*.shop.uz", "shop.uz.evil.example"));
  assert.ok(!nameMatches("*.shop.uz", "evilshop.uz"));
  assert.ok(nameMatches("pay.shop.uz", "pay.shop.uz"));
  assert.ok(!nameMatches("shop.uz", "pay.shop.uz"));
});

test("the browser's checks fail one by one until the setup is right", () => {
  const good = {
    names: ["*.shop.uz"],
    intermediate: true,
    expired: false,
    issuer: "ca" as const,
  };
  assert.ok(certValid(good));
  assert.ok(certValid({ ...good, names: ["pay.shop.uz"] }));
  const fail = (s: Parameters<typeof checkCert>[0]) =>
    checkCert(s).find((c) => !c.ok)?.id;
  assert.equal(fail({ ...good, issuer: "self" }), "trust");
  assert.equal(fail({ ...good, intermediate: false }), "chain");
  assert.equal(fail({ ...good, expired: true }), "dates");
  assert.equal(fail({ ...good, names: ["shop.uz", "www.shop.uz"] }), "name");
  assert.equal(
    checkCert({ ...good, expired: true }).find((c) => !c.ok)?.error,
    "NET::ERR_CERT_DATE_INVALID",
  );
});

test("the grade is capped by the worst problem", () => {
  const best: TlsSetup = {
    tls10: false,
    tls11: false,
    tls12: true,
    tls13: true,
    weakCiphers: false,
    rsaKex: false,
    key1024: false,
    hsts: true,
  };
  assert.equal(grade(best), "A+");
  assert.equal(grade({ ...best, hsts: false }), "A");
  assert.equal(grade({ ...best, tls10: true }), "B");
  assert.equal(grade({ ...best, rsaKex: true }), "B");
  assert.equal(grade({ ...best, weakCiphers: true, tls10: true }), "C");
  assert.equal(grade({ ...best, key1024: true }), "F");
  assert.equal(grade({ ...best, tls12: false, tls13: false }), "F");
  // TLS 1.3 alone is enough for an A+.
  assert.equal(grade({ ...best, tls12: false }), "A+");
});

test("only HSTS with preload protects the first visit", () => {
  assert.deepEqual(stripping({ redirect: true, hsts: false, preload: false }), {
    first: false,
    later: false,
  });
  assert.deepEqual(stripping({ redirect: true, hsts: true, preload: false }), {
    first: false,
    later: true,
  });
  assert.ok(strippingSafe({ redirect: true, hsts: true, preload: true }));
  // Preload without HSTS counts for nothing.
  assert.ok(!strippingSafe({ redirect: true, hsts: false, preload: true }));
});

test("the curriculum is numbered, the wildcard sort agrees, quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.tls.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
    if (lesson.id === 2 && w.type === "sort")
      for (const item of w.items)
        assert.equal(
          nameMatches("*.shop.uz", item.label.en),
          item.bucket === "yes",
          item.label.en,
        );
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("tls-1");
  assert.ok(checkpoint);
  const questions = questionsFor(checkpoint, 7);
  assert.equal(questions.length, 10);
  assert.equal(
    gradeCheckpoint(
      questions,
      questions.map((q) => q.answer),
    ).percent,
    100,
  );
});
