import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CASES,
  decide,
  DST_CHOICES,
  inbound,
  INBOUND,
  narrowCheck,
  narrowSolved,
  netMatches,
  orderResults,
  orderSolved,
  PORT_CHOICES,
  RULES,
  SRC_CHOICES,
  START_ORDER,
  stateSolved,
  type Narrow,
} from "../src/lib/firewall/tools";
import { LESSONS } from "../src/lib/firewall/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

const permutations = (xs: string[]): string[][] =>
  xs.length <= 1
    ? [xs]
    : xs.flatMap((x, i) =>
        permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [
          x,
          ...p,
        ]),
      );

test("nets match hosts, zones and anything", () => {
  assert.ok(netMatches("any", "db"));
  assert.ok(netMatches("lan", "admin"));
  assert.ok(netMatches("admin", "admin"));
  assert.ok(!netMatches("admin", "lan"));
  assert.ok(!netMatches("dmz", "db"));
});

test("the first matching rule wins, else the default", () => {
  const flow = { from: "lan", to: "db", port: 5432 } as const;
  const broad = {
    id: "1",
    action: "allow",
    src: "lan",
    dst: "any",
    port: "any",
  } as const;
  const narrow = {
    id: "2",
    action: "deny",
    src: "lan",
    dst: "db",
    port: 5432,
  } as const;
  assert.deepEqual(decide([broad, narrow], "deny", flow), {
    action: "allow",
    by: "1",
  });
  assert.deepEqual(decide([narrow, broad], "deny", flow), {
    action: "deny",
    by: "2",
  });
  assert.deepEqual(decide([], "deny", flow), { action: "deny", by: null });
});

test("the order lesson starts wrong and needs D, E, F in that order with deny", () => {
  assert.ok(!orderSolved(START_ORDER, "allow"));
  assert.ok(!orderSolved(START_ORDER, "deny"));
  const solutions = permutations(RULES.map((r) => r.id)).filter((o) =>
    orderSolved(o, "deny"),
  );
  assert.ok(solutions.length > 0);
  for (const o of solutions)
    assert.ok(
      o.indexOf("D") < o.indexOf("E") && o.indexOf("E") < o.indexOf("F"),
    );
  // A default of allow never works: unmatched flows must be refused.
  assert.equal(
    permutations(RULES.map((r) => r.id)).some((o) => orderSolved(o, "allow")),
    false,
  );
  assert.equal(
    orderResults(["D", "E", "F", "A", "B", "C"], "deny").length,
    CASES.length,
  );
});

test("only connection tracking without the port-443 hole is right", () => {
  const ok = [];
  for (const stateful of [false, true])
    for (const fromPort443 of [false, true])
      if (stateSolved({ stateful, fromPort443 }))
        ok.push({ stateful, fromPort443 });
  assert.deepEqual(ok, [{ stateful: true, fromPort443: false }]);
  const reply = INBOUND.find((p) => p.id === "reply")!;
  const spoofed = INBOUND.find((p) => p.id === "spoofed")!;
  assert.equal(inbound({ stateful: false, fromPort443: false }, reply), "deny");
  assert.equal(
    inbound({ stateful: false, fromPort443: true }, spoofed),
    "allow",
  );
});

test("only the narrowest rule opens nothing extra", () => {
  const ok: Narrow[] = [];
  for (const src of SRC_CHOICES)
    for (const dst of DST_CHOICES)
      for (const port of PORT_CHOICES) {
        const n = { src, dst, port };
        if (narrowSolved(n)) ok.push(n);
        // Every choice still lets the web server in.
        assert.ok(narrowCheck(n).needed);
      }
  assert.deepEqual(ok, [{ src: "web", dst: "db", port: 5432 }]);
  // Each widening opens at least one more flow.
  assert.ok(
    narrowCheck({ src: "dmz", dst: "db", port: 5432 }).extra.length > 0,
  );
  assert.ok(
    narrowCheck({ src: "web", dst: "servers", port: 5432 }).extra.length > 0,
  );
  assert.ok(
    narrowCheck({ src: "web", dst: "db", port: "any" }).extra.length > 0,
  );
  assert.equal(
    narrowCheck({ src: "any", dst: "any", port: "any" }).extra.length,
    6,
  );
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.firewall.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("firewall-1");
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
