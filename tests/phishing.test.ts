import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DOMAINS,
  HEADERS,
  headersRight,
  LINKS,
  linksRight,
  ORIGIN_IP,
  registered,
  REPLY_TO,
} from "../src/lib/phishing/tools";
import { LESSONS } from "../src/lib/phishing/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("the origin is in the bottom Received header", () => {
  const received = HEADERS.map((h, i) => ({ h, i })).filter(({ h }) =>
    h.startsWith("Received:"),
  );
  const bottom = received[received.length - 1].h;
  assert.ok(bottom.includes(`[${ORIGIN_IP}]`));
  assert.ok(HEADERS.some((h) => h.includes(`Reply-To: <${REPLY_TO}>`)));
  assert.ok(HEADERS.some((h) => h.includes("dmarc=fail")));
  assert.ok(DOMAINS.includes("mailbox.example"));
  assert.ok(headersRight(` ${ORIGIN_IP} `, "mailbox.example"));
  assert.ok(!headersRight("198.51.100.20", "mailbox.example"));
  assert.ok(!headersRight(ORIGIN_IP, "navrozbank.example"));
});

test("the links' real domains give the traps away", () => {
  assert.equal(
    registered("https://my.navrozbank.example.secure-login.example/login"),
    "secure-login.example",
  );
  assert.equal(registered("https://xn--pple-43d.com/"), "xn--pple-43d.com");
  assert.equal(LINKS.filter((l) => l.bad).length, 4);
  const calls = Object.fromEntries(LINKS.map((l, i) => [i, l.bad]));
  assert.ok(linksRight(calls));
  assert.ok(!linksRight({ ...calls, 1: true }));
  assert.ok(!linksRight({}));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.phishing.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("phishing-1");
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
