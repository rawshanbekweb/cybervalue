import { test } from "node:test";
import assert from "node:assert/strict";
import {
  allMapped,
  answersRight,
  ATTACKER,
  BREACHED,
  EVENTS,
  mappedRight,
  query,
  RAWS,
  search,
} from "../src/lib/siem/tools";
import { LESSONS } from "../src/lib/siem/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("every raw line holds its own answers", () => {
  for (const raw of RAWS) {
    for (const value of Object.values(raw.answer)) {
      assert.ok(raw.tokens.includes(value), raw.id);
      assert.ok(raw.line.includes(value), raw.id);
    }
    assert.ok(mappedRight(raw, raw.answer));
    assert.ok(!mappedRight(raw, { "source.ip": raw.answer["source.ip"] }));
  }
  assert.ok(allMapped(Object.fromEntries(RAWS.map((r) => [r.id, r.answer]))));
  assert.ok(!allMapped({}));
});

test("grouping by user hides the spray; grouping by address shows it", () => {
  const byUser = search("failure", "user");
  assert.equal(byUser[0].value, "javlon");
  assert.ok(byUser.every((r) => r.count <= 3));
  const byIp = search("failure", "ip");
  assert.equal(byIp[0].value, ATTACKER);
  assert.equal(byIp[0].count, 9);
  assert.equal(byIp[0].sources, 3);
  const wins = EVENTS.filter(
    (e) => e.ip === ATTACKER && e.outcome === "success",
  );
  assert.deepEqual(
    wins.map((e) => e.user),
    [BREACHED],
  );
  const all = search("all", "source");
  assert.equal(
    all.reduce((n, r) => n + r.count, 0),
    EVENTS.length,
  );
});

test("the query reads like a SIEM search and the answer is checked", () => {
  assert.equal(
    query("failure", "ip"),
    "event.outcome:failure | stats count, dc(event.dataset) by source.ip",
  );
  assert.equal(query("all", "user").startsWith("* |"), true);
  assert.ok(answersRight(" 203.0.113.45 ", "Dilnoza"));
  assert.ok(!answersRight("10.0.0.12", "javlon"));
  assert.ok(!answersRight(ATTACKER, "maria"));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.siem.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("siem-1");
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
