import { test } from "node:test";
import assert from "node:assert/strict";
import {
  publicName,
  rankOf,
  standing,
  weekIndex,
  XP,
  type XpInput,
} from "../src/lib/student/xp";
import { attention, classCsv } from "../src/lib/student/class";

const DAY = 86_400_000;
// Wednesday 2026-10-21, 12:00 Tashkent.
const now = Date.UTC(2026, 9, 21, 7);
const at = (daysAgo: number) => new Date(now - daysAgo * DAY);

const materials = [
  { id: "l1", slug: "lesson", kind: "LESSON" },
  { id: "p1", slug: "practice", kind: "PRACTICE" },
  { id: "q1", slug: "kirish-sinovi-test", kind: "QUIZ" },
  { id: "c1", slug: "ctf", kind: "CHALLENGE" },
];
const empty: XpInput = {
  materials,
  progress: [],
  submissions: [],
  checkpoints: [],
};

test("XP adds up finished work, best test scores and checkpoints", () => {
  const s = standing(
    {
      materials,
      progress: [
        { materialId: "l1", completedAt: at(1) },
        { materialId: "c1", completedAt: at(2) },
        { materialId: "gone", completedAt: at(2) },
      ],
      submissions: [
        { materialId: "p1", score: null, maxScore: null, createdAt: at(3) },
        { materialId: "q1", score: 6, maxScore: 10, createdAt: at(9) },
        { materialId: "q1", score: 10, maxScore: 10, createdAt: at(8) },
        { materialId: "c1", score: null, maxScore: null, createdAt: at(2) },
      ],
      checkpoints: [
        { checkpoint: "network-1", score: 6, total: 12, createdAt: at(1) },
        { checkpoint: "network-1", score: 12, total: 12, createdAt: at(0) },
      ],
    },
    now,
  );
  assert.equal(
    s.xp,
    XP.read +
      XP.practice +
      XP.challenge +
      100 +
      Math.round(100 * XP.checkpointShare),
  );
  assert.equal(s.done, 4);
  assert.equal(s.available, 4);
  assert.equal(s.average, 100);
  assert.deepEqual(s.checkpoints, { "network-1": 100 });
  for (const id of [
    "first",
    "entrance",
    "perfect",
    "flag",
    "checkpoint",
    "half",
    "all",
  ])
    assert.ok(s.badges.includes(id), id);
  assert.ok(!s.badges.includes("ctf"));
  assert.equal(
    s.days.reduce((a, b) => a + b, 0),
    8,
  );
  assert.equal(s.lastActive?.getTime(), now);
});

test("an unsolved personal lab gives no XP and nothing counts twice", () => {
  const s = standing(
    {
      ...empty,
      submissions: [
        { materialId: "c1", score: null, maxScore: null, createdAt: at(1) },
        { materialId: "p1", score: null, maxScore: null, createdAt: at(1) },
        { materialId: "p1", score: null, maxScore: null, createdAt: at(1) },
      ],
    },
    now,
  );
  assert.equal(s.xp, XP.practice);
  assert.equal(s.done, 1);
});

test("weeks start on Monday in Tashkent and streaks survive an idle week start", () => {
  // Monday 00:30 Tashkent is still Sunday in UTC.
  const monday = Date.UTC(2026, 9, 18, 19, 30);
  assert.equal(weekIndex(monday), weekIndex(monday + 6 * DAY));
  assert.equal(weekIndex(monday) - 1, weekIndex(monday - 3_600_000));
  const s = standing(
    {
      ...empty,
      progress: [7, 14, 21].map((d) => ({
        materialId: "l1",
        completedAt: at(d),
      })),
    },
    now,
  );
  assert.equal(s.week, 0);
  assert.equal(s.streakWeeks, 3);
  assert.ok(s.badges.includes("streak"));
});

test("ranks, public names and attention reasons", () => {
  assert.equal(rankOf(0).rank.title.en, "Trainee");
  assert.equal(rankOf(400).rank.title.en, "Analyst");
  assert.equal(rankOf(99999).next, null);
  assert.equal(publicName("Aziza Karimova"), "Aziza K.");
  assert.equal(publicName("  Bobur "), "Bobur");

  const idle = standing(empty, now);
  assert.deepEqual(attention(idle, 0.5, now), ["never", "behind"]);
  const old = standing(
    {
      ...empty,
      submissions: [
        { materialId: "q1", score: 2, maxScore: 10, createdAt: at(12) },
      ],
    },
    now,
  );
  assert.deepEqual(attention(old, 0.2, now), ["inactive", "low-tests"]);

  const csv = classCsv(
    [{ name: "=cmd", group: "7-A", standing: old, reasons: ["inactive"] }],
    (s) => s,
    "en",
  );
  const lines = csv.slice(1).split("\r\n");
  assert.equal(lines.length, 2);
  assert.ok(lines[1].startsWith(`"'=cmd","7-A","Trainee","20"`));
  assert.ok(lines[1].includes('"Inactive for over a week"'));
});
