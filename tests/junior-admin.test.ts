import { test } from "node:test";
import assert from "node:assert/strict";
import {
  groupStats,
  juniorCsv,
  juniorRow,
  juniorUpdateSchema,
  statusOf,
  summarizeMember,
  type JuniorRecord,
} from "../src/lib/junior/admin";
import {
  formatJuniorCode,
  isJuniorCode,
  newJuniorCode,
} from "../src/lib/junior/codes";
import { dayIndex } from "../src/lib/junior/daily";

const FIRST_DAY = dayIndex(Date.UTC(2026, 9, 16));

const DAY = 86_400_000;
const now = Date.UTC(2026, 9, 20, 9);

test("junior codes are 8 typeable symbols shown as XXXX-XXXX", () => {
  const codes = new Set(Array.from({ length: 200 }, newJuniorCode));
  assert.equal(codes.size, 200);
  for (const code of codes) assert.ok(isJuniorCode(code), code);
  assert.equal(isJuniorCode("ABCD-EFGH"), false);
  assert.equal(isJuniorCode("ILOU1234"), false);
  assert.equal(formatJuniorCode("K7MQ2XRT"), "K7MQ-2XRT");
});

test("a member summary counts what the teacher needs to see", () => {
  const empty = summarizeMember("not json", now);
  assert.equal(empty.xp, 0);
  assert.equal(empty.missions, 0);
  assert.deepEqual(empty.badges, []);
  assert.equal(empty.ciphers.length, 10);

  const summary = summarizeMember(
    {
      missions: { password: true, phishing: true, bogus: true },
      ciphers: { caesar: [0, 1, 1, 99] },
      story: true,
      daily: [FIRST_DAY, FIRST_DAY + 1],
      agent: { name: "Night Owl", rank: 0 },
    },
    now,
  );
  assert.equal(summary.missions, 2);
  assert.equal(summary.exercises, 2);
  assert.equal(summary.daily, 2);
  assert.equal(summary.story, true);
  assert.equal(summary.xp, 2 * 100 + 2 * 15 + 2 * 20 + 100);
  assert.ok(summary.badges.includes("first"));
  assert.ok(summary.badges.includes("phish"));
  const caesar = summary.ciphers.find((c) => c.id === "caesar")!;
  assert.equal(caesar.solved, 2);
});

const member = (patch: Partial<JuniorRecord>): JuniorRecord => ({
  id: "m",
  name: "Aziza",
  group: "7-A",
  codename: "",
  active: true,
  expiresAt: null,
  progress: {},
  lastLoginAt: null,
  lastActiveAt: null,
  createdAt: new Date(now),
  ...patch,
});

test("status, group overview and CSV export", () => {
  assert.equal(statusOf(member({}), now), "active");
  assert.equal(statusOf(member({ active: false }), now), "blocked");
  assert.equal(
    statusOf(member({ expiresAt: new Date(now - 1) }), now),
    "expired",
  );

  const rows = [
    member({
      id: "a",
      progress: { missions: { password: true } },
      lastActiveAt: new Date(now - DAY),
    }),
    member({ id: "b", name: "=HYPERLINK(1)" }),
    member({
      id: "c",
      group: "7-B",
      progress: { missions: { password: true, phishing: true } },
      lastActiveAt: new Date(now - 30 * DAY),
    }),
  ].map((m) => juniorRow(m, now));
  assert.deepEqual(groupStats(rows, now), [
    { group: "7-B", members: 1, active: 0, xp: 200, averageXp: 200 },
    { group: "7-A", members: 2, active: 1, xp: 100, averageXp: 50 },
  ]);

  const csv = juniorCsv(rows, (s) => s, "en");
  assert.ok(csv.startsWith("﻿"));
  const lines = csv.slice(1).split("\r\n");
  assert.equal(lines.length, 4);
  assert.ok(lines[0].includes('"The Caesar cipher"'));
  // Spreadsheet formulas are neutralised.
  assert.ok(lines[2].startsWith(`"'=HYPERLINK(1)"`));
  assert.ok(lines[1].includes('"1/6"'));
});

test("member edits are validated; the date ends at Tashkent midnight", () => {
  const ok = juniorUpdateSchema.parse({
    name: " Aziza ",
    group: "7-A",
    note: "",
    active: true,
    expiresAt: "2026-12-31",
  });
  assert.equal(ok.name, "Aziza");
  assert.equal(ok.expiresAt?.toISOString(), "2026-12-31T18:59:59.999Z");
  assert.equal(
    juniorUpdateSchema.safeParse({
      name: "A",
      group: "<script>",
      note: "",
      active: true,
      expiresAt: "",
    }).success,
    false,
  );
});
