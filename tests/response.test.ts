import { test } from "node:test";
import assert from "node:assert/strict";
import {
  containSolved,
  INCIDENTS,
  MOVES,
  OUTCOMES,
  QUEUE,
  severity,
  triageSolved,
} from "../src/lib/response/tools";
import { LESSONS } from "../src/lib/response/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("incidents rank by impact times urgency", () => {
  const scores = INCIDENTS.map(severity);
  assert.equal(new Set(scores).size, scores.length);
  assert.ok(!triageSolved(QUEUE));
  assert.ok(triageSolved(["ransom", "exfil", "deface", "laptop"]));
  assert.ok(!triageSolved(["exfil", "ransom", "deface", "laptop"]));
});

test("containment keeps the good moves and none of the harmful ones", () => {
  const good = MOVES.filter((m) => OUTCOMES[m].good);
  assert.deepEqual(good, ["isolate", "memory", "account"]);
  assert.ok(containSolved(good));
  assert.ok(!containSolved([]));
  assert.ok(!containSolved([...good, "chat"]));
  assert.ok(!containSolved(["isolate", "memory"]));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.response.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("response-1");
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
