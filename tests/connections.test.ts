import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CONNECTS,
  LEAKS,
  searchSpace,
  shouldConnect,
  span,
  sshSolved,
  vpnSafe,
  wifi,
  wifiSafe,
} from "../src/lib/connections/tools";
import { LESSONS } from "../src/lib/connections/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("Wi-Fi modes against a recorded handshake", () => {
  assert.equal(wifi("open", "").kind, "open");
  assert.equal(wifi("wep", "a very long key indeed").kind, "wep");
  assert.equal(wifi("wpa2", "short").kind, "invalid");
  assert.equal(wifi("wpa3", "short").kind, "invalid");
  assert.equal(wifi("wpa3", "12345678").kind, "sae");
  // A dictionary word falls at once, whatever its length.
  assert.deepEqual(wifi("wpa2", "Password"), { kind: "offline", seconds: 1 });
  assert.equal(searchSpace("abc"), 26 ** 3);
  assert.equal(searchSpace("aB1!"), 95 ** 4);
  // The lesson's starting password holds for days, not a century.
  const start = wifi("wpa2", "cafe2024");
  assert.equal(start.kind, "offline");
  assert.ok(!wifiSafe("wpa2", "cafe2024"));
  assert.ok(wifiSafe("wpa2", "Toshkent-Samarqand-2026"));
  assert.ok(wifiSafe("wpa3", "cafe2024"));
  assert.ok(!wifiSafe("wep", "Toshkent-Samarqand-2026"));
  assert.ok(!wifiSafe("open", "Toshkent-Samarqand-2026"));
});

test("durations round to the unit people think in", () => {
  assert.deepEqual(span(0.2), { n: 1, unit: "s" });
  assert.deepEqual(span(90), { n: 2, unit: "min" });
  assert.deepEqual(span(7200), { n: 2, unit: "h" });
  assert.deepEqual(span(3 * 86_400), { n: 3, unit: "d" });
  assert.equal(span(1e12).unit, "y");
  assert.equal(span(1e20).unit, "ages");
});

test("only a full tunnel with DNS inside hides everything", () => {
  const ok = [];
  for (const mode of ["none", "split", "full"] as const)
    for (const dns of [false, true])
      if (vpnSafe({ mode, dns })) ok.push({ mode, dns });
  assert.deepEqual(ok, [{ mode: "full", dns: true }]);
  // A split tunnel still protects the office traffic.
  const office = LEAKS.find((l) => l.id === "office")!;
  assert.equal(office.seen({ mode: "split", dns: false }), false);
  assert.equal(office.seen({ mode: "none", dns: false }), true);
  // A full tunnel with DNS outside leaks only the names.
  assert.deepEqual(
    LEAKS.filter((l) => l.seen({ mode: "full", dns: false })).map((l) => l.id),
    ["dns"],
  );
});

test("connect only to the published host key", () => {
  assert.deepEqual(
    CONNECTS.map((c) => [c.id, shouldConnect(c)]),
    [
      ["office", true],
      ["cafe", false],
      ["new", false],
    ],
  );
  // The new server's key differs only in its last character.
  const fresh = CONNECTS.find((c) => c.id === "new")!;
  assert.equal(fresh.shown.slice(0, -1), fresh.published.slice(0, -1));
  assert.ok(sshSolved({ office: "yes", cafe: "no", new: "no" }));
  assert.ok(!sshSolved({ office: "yes", cafe: "no", new: "yes" }));
  assert.ok(!sshSolved({ office: "yes", cafe: "no" }));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.connections.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("connections-1");
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
