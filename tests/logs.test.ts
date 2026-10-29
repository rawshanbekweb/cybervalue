import { test } from "node:test";
import assert from "node:assert/strict";
import {
  answersRight,
  ATTACKER,
  AUTH_LOG,
  EPOCH_GAP,
  epochSolved,
  grep,
  NEW_ACCOUNT,
  RAWS,
  readAs,
} from "../src/lib/logs/tools";
import { LESSONS } from "../src/lib/logs/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("grep finds the break-in and the back door", () => {
  const accepted = grep({
    pattern: "Accepted",
    ignoreCase: false,
    invert: false,
  });
  assert.equal(accepted.lines.length, 2);
  assert.ok(accepted.lines.some((l) => l.includes(`root from ${ATTACKER}`)));
  const added = grep({ pattern: "new user", ignoreCase: false, invert: false });
  assert.equal(added.lines.length, 1);
  assert.ok(added.lines[0].includes(`name=${NEW_ACCOUNT}, UID=0`));
  // -i and -v behave like grep's.
  assert.equal(
    grep({ pattern: "accepted", ignoreCase: false, invert: false }).lines
      .length,
    0,
  );
  assert.equal(
    grep({ pattern: "accepted", ignoreCase: true, invert: false }).lines.length,
    2,
  );
  assert.equal(
    grep({ pattern: "sshd", ignoreCase: false, invert: true }).lines.length,
    2,
  );
  assert.equal(
    grep({ pattern: "", ignoreCase: false, invert: false }).lines.length,
    AUTH_LOG.length,
  );
  assert.equal(
    grep({ pattern: "(", ignoreCase: false, invert: false }).ok,
    false,
  );
});

test("the answers must be exact", () => {
  assert.ok(answersRight(" 203.0.113.7 ", "sysbackup"));
  assert.ok(!answersRight("198.51.100.23", "sysbackup"));
  assert.ok(!answersRight("203.0.113.7", "root"));
});

test("three epochs land on one moment only in their own format", () => {
  assert.equal(EPOCH_GAP, 11_644_473_600);
  const want = "2026-10-03T02:14:07";
  for (const r of RAWS) {
    const right = readAs(r.value, r.format)!;
    assert.ok(right.startsWith(want), `${r.id} ${right}`);
    for (const f of ["unixS", "unixMs", "webkit"] as const)
      if (f !== r.format) {
        const wrong = readAs(r.value, f);
        assert.ok(
          wrong === null || !wrong.startsWith("2026"),
          `${r.id} as ${f}`,
        );
      }
  }
  assert.equal(String(RAWS[0].value).length, 10);
  assert.equal(String(RAWS[1].value).length, 13);
  assert.equal(String(RAWS[2].value).length, 17);
  assert.ok(epochSolved({ wtmp: "unixS", js: "unixMs", chrome: "webkit" }));
  assert.ok(!epochSolved({ wtmp: "unixMs", js: "unixMs", chrome: "webkit" }));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.logs.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("logs-1");
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
