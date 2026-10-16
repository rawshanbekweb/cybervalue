import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canAnswer,
  codeSchema,
  distribution,
  leaderboard,
  msLeft,
  nameSchema,
  newGameCode,
  nextState,
  points,
} from "../src/lib/live/game";

test("codes are six digits and accept spaces when typed", () => {
  for (let i = 0; i < 50; i++) assert.match(newGameCode(), /^\d{6}$/);
  assert.equal(codeSchema.parse("123 456"), "123456");
  assert.equal(codeSchema.safeParse("12345").success, false);
});

test("names are tidied and limited to what the screen can show", () => {
  assert.equal(nameSchema.parse("  Ali   V. "), "Ali V.");
  assert.equal(nameSchema.parse("O‘g‘iloy"), "O‘g‘iloy");
  for (const bad of ["", "   ", "<script>", "x".repeat(25)])
    assert.equal(nameSchema.safeParse(bad).success, false, bad);
});

test("faster right answers score more; wrong ones score nothing", () => {
  assert.equal(points(true, 0, 20), 1000);
  assert.equal(points(true, 10_000, 20), 750);
  assert.equal(points(true, 25_000, 20), 500);
  assert.equal(points(false, 0, 20), 0);
});

test("answers count until the deadline plus a short grace", () => {
  const startedAt = new Date(1_000_000);
  const game = { state: "question", startedAt, seconds: 10 };
  assert.equal(canAnswer(game, 1_000_000 + 10_000), true);
  assert.equal(canAnswer(game, 1_000_000 + 11_400), true);
  assert.equal(canAnswer(game, 1_000_000 + 11_600), false);
  assert.equal(canAnswer({ ...game, state: "reveal" }, 1_000_100), false);
  assert.equal(msLeft(startedAt, 10, 1_004_000), 6000);
  assert.equal(msLeft(null, 10), 0);
});

test("the host moves lobby → question → reveal → … → finished", () => {
  assert.deepEqual(nextState({ state: "lobby", current: -1 }, "start", 2), {
    state: "question",
    current: 0,
  });
  assert.equal(nextState({ state: "lobby", current: -1 }, "start", 0), null);
  assert.equal(nextState({ state: "lobby", current: -1 }, "next", 2), null);
  assert.deepEqual(nextState({ state: "question", current: 0 }, "reveal", 2), {
    state: "reveal",
    current: 0,
  });
  assert.deepEqual(nextState({ state: "reveal", current: 0 }, "next", 2), {
    state: "question",
    current: 1,
  });
  assert.deepEqual(nextState({ state: "reveal", current: 1 }, "next", 2), {
    state: "finished",
    current: 1,
  });
  assert.equal(nextState({ state: "finished", current: 1 }, "end", 2), null);
});

test("ranking and vote counts", () => {
  const at = (n: number) => new Date(n);
  const ranked = leaderboard([
    { id: "a", name: "A", score: 900, createdAt: at(2) },
    { id: "b", name: "B", score: 1500, createdAt: at(3) },
    { id: "c", name: "C", score: 900, createdAt: at(1) },
  ]);
  assert.deepEqual(
    ranked.map((p) => [p.name, p.place]),
    [
      ["B", 1],
      ["C", 2],
      ["A", 3],
    ],
  );
  assert.deepEqual(
    distribution(3, [
      { choice: 0 },
      { choice: 2 },
      { choice: 2 },
      { choice: 9 },
    ]),
    [1, 0, 2],
  );
});
