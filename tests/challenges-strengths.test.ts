import { test } from "node:test";
import assert from "node:assert/strict";
import {
  categoriesOf,
  categoryLeaders,
  categoryStats,
  strongest,
} from "../src/lib/challenges/strengths";

const challenges = [
  { id: "w1", category: "Web" },
  { id: "c1", category: "Crypto" },
  { id: "c2", category: "Crypto" },
  { id: "x1", category: "Netsec" },
  { id: "m1", category: "Misc" },
];
const values = new Map([
  ["w1", 100],
  ["c1", 300],
  ["c2", 100],
  ["x1", 50],
  ["m1", 0],
]);

test("categories follow the board's order, unknown ones last", () => {
  assert.deepEqual(categoriesOf(challenges), [
    "Crypto",
    "Web",
    "Misc",
    "Netsec",
  ]);
});

test("each category counts points, challenges and the share won", () => {
  const stats = categoryStats(challenges, values, ["c1", "w1"]);
  const crypto = stats.find((s) => s.category === "Crypto")!;
  assert.deepEqual(crypto, {
    category: "Crypto",
    points: 300,
    possible: 400,
    solved: 1,
    total: 2,
    share: 0.75,
  });
  assert.equal(stats.find((s) => s.category === "Web")!.share, 1);
  // A category worth nothing has no share rather than NaN.
  assert.equal(stats.find((s) => s.category === "Misc")!.share, 0);
  assert.equal(strongest(stats)!.category, "Web");
  assert.equal(strongest(categoryStats(challenges, values, [])), null);
});

test("ties for the strongest category go to more points", () => {
  const stats = categoryStats(challenges, values, ["c1", "c2", "w1"]);
  assert.equal(strongest(stats)!.category, "Crypto");
});

test("a category's champion has the most points; ties go to the higher place", () => {
  const rows = [
    {
      entrantId: "a",
      byCategory: categoryStats(challenges, values, ["c2", "w1"]),
    },
    { entrantId: "b", byCategory: categoryStats(challenges, values, ["c1"]) },
    { entrantId: "c", byCategory: categoryStats(challenges, values, ["w1"]) },
  ];
  const leaders = categoryLeaders(rows);
  assert.equal(leaders.get("Crypto")!.row.entrantId, "b");
  assert.equal(leaders.get("Web")!.row.entrantId, "a");
  assert.equal(leaders.has("Misc"), false);
  assert.equal(leaders.has("Netsec"), false);
});
