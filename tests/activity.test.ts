import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chartWindow,
  DAY,
  daily,
  dayIndex,
  heatLevel,
  signed,
  tashkentDay,
  weekly,
  weekStart,
  WEEKS,
} from "../src/lib/admin/activity";

test("days are Tashkent dates", () => {
  // 20:30 UTC on 18 Oct is already 01:30 on 19 Oct in Tashkent.
  assert.equal(tashkentDay(Date.parse("2026-10-18T20:30:00Z")), "2026-10-19");
  assert.equal(tashkentDay(Date.parse("2026-10-18T18:59:00Z")), "2026-10-18");
});

test("weeks start on Monday at Tashkent midnight", () => {
  // Wednesday 21 Oct 2026, 10:00 Tashkent.
  const now = Date.parse("2026-10-21T05:00:00Z");
  assert.equal(
    new Date(weekStart(now)).toISOString(),
    "2026-10-18T19:00:00.000Z", // Monday 19 Oct, 00:00 Tashkent
  );
  // Sunday late evening still belongs to that week.
  const sunday = Date.parse("2026-10-25T18:30:00Z");
  assert.equal(weekStart(sunday), weekStart(now));
});

test("the window covers 12 whole weeks ending this week", () => {
  const now = Date.parse("2026-10-21T05:00:00Z");
  const { from, thisWeek } = chartWindow(now);
  assert.equal(thisWeek - from, (WEEKS - 1) * 7 * DAY);
  const { counts, people } = weekly(
    [
      { at: from - 1, who: "a" }, // before the window
      { at: from, who: "a" },
      { at: from + 3 * DAY, who: "b" },
      { at: from + 3 * DAY, who: "b" },
      { at: now, who: "c" },
    ],
    from,
  );
  assert.equal(counts[0], 3);
  assert.equal(people[0].size, 2);
  assert.equal(counts[WEEKS - 1], 1);
  assert.equal(
    counts.reduce((a, b) => a + b, 0),
    4,
  );
});

test("daily counts and heat levels", () => {
  const from = Date.parse("2026-08-02T19:00:00Z");
  assert.equal(dayIndex(from - 1, from), -1);
  assert.equal(dayIndex(from + 83 * DAY, from), 83);
  assert.equal(dayIndex(from + 84 * DAY, from), -1);
  const days = daily([from, from + 1000, from + 2 * DAY], from);
  assert.deepEqual(days.slice(0, 3), [2, 0, 1]);
  assert.equal(heatLevel(0, 8), 0);
  assert.equal(heatLevel(1, 8), 1);
  assert.equal(heatLevel(5, 8), 3);
  assert.equal(heatLevel(8, 8), 4);
  assert.equal(signed(3), "+3");
  assert.equal(signed(-2), "−2");
  assert.equal(signed(0), "0");
});
