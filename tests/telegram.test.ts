import { test } from "node:test";
import assert from "node:assert/strict";
import { readLink, signLink } from "../src/lib/telegram/link";
import {
  missedText,
  newAssignmentText,
  parentStudentText,
} from "../src/lib/telegram/messages";
import { isReportToken } from "../src/lib/report-token";

const secret = "test-secret";

test("deep links fit Telegram's limits and resist tampering", () => {
  const id = "clx9a8b7c6d5e4f3g2h1i0j9k";
  for (const kind of ["t", "s", "p", "j"] as const) {
    const payload = signLink(secret, kind, id);
    assert.match(payload, /^[A-Za-z0-9_-]{1,64}$/);
    assert.equal(readLink(secret, payload)?.id, id);
  }
  assert.deepEqual(readLink(secret, signLink(secret, "p", id)), {
    kind: "p",
    id,
    subject: `parent:student:${id}`,
  });
  // Long test ids still fit.
  const long = `e2e_${"a".repeat(36)}`;
  assert.ok(signLink(secret, "s", long).length <= 64);
  const payload = signLink(secret, "s", id);
  assert.equal(readLink("other-secret", payload), null);
  assert.equal(readLink(secret, `t${payload.slice(1)}`), null);
  assert.equal(readLink(secret, payload.slice(0, -1) + "x"), null);
  for (const bad of ["", "s", "sx", "x" + payload.slice(1), 42, null])
    assert.equal(readLink(secret, bad), null);
  assert.throws(() => signLink(secret, "s", "bad id"));
});

test("messages escape names and titles for Telegram HTML", () => {
  const text = newAssignmentText({
    title: "<b>Lab</b> & more",
    what: "Test",
    due: "Jum, 24-okt",
    note: "",
    url: 'https://x.uz/a?b=1&c="2"',
  });
  assert.ok(text.includes("&lt;b&gt;Lab&lt;/b&gt; &amp; more"));
  assert.ok(text.includes('href="https://x.uz/a?b=1&amp;c=&quot;2&quot;"'));
  assert.ok(!text.includes("Izoh"));
  const missed = missedText(
    [
      {
        title: "T",
        group: "A",
        names: Array.from({ length: 17 }, (_, i) => `N${i}`),
      },
    ],
    "https://x.uz/admin/class",
  );
  assert.ok(missed.includes("N14"));
  assert.ok(!missed.includes("N15,"));
  assert.ok(missed.includes("va yana 2 kishi"));
  const parent = parentStudentText({
    name: "Ali",
    rank: "Stajyor",
    xp: 40,
    week: 2,
    goal: 3,
    done: 1,
    available: 4,
    average: null,
    missed: 0,
    url: "https://x.uz/report/abc",
  });
  assert.ok(!parent.includes("Testlar"));
  assert.ok(!parent.includes("Topshirilmagan"));
});

test("report tokens have one shape", () => {
  assert.equal(isReportToken("a".repeat(24)), true);
  assert.equal(isReportToken("a".repeat(23)), false);
  assert.equal(isReportToken("a".repeat(23) + "/"), false);
});
