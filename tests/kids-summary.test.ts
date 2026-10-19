import { test } from "node:test";
import assert from "node:assert/strict";
import { GAMES, missionKey, stageOf } from "../src/lib/kids/games";
import { emptyKidsProgress } from "../src/lib/kids/progress";
import { kidSummary, SKILLS } from "../src/lib/kids/summary";

const stage = (game: "kosmos" | "labirint", n: number) =>
  GAMES[game].missions
    .filter((m) => stageOf(m) === n)
    .map((m) => missionKey(game, m.id));

test("a new child is on stage 1 of the first game only", () => {
  const s = kidSummary(emptyKidsProgress(), "2026-10-19");
  const kosmos = s.games.find((g) => g.id === "kosmos")!;
  assert.equal(kosmos.open, true);
  assert.equal(kosmos.stage, 1);
  assert.ok(s.games.filter((g) => g.id !== "kosmos").every((g) => !g.open));
  assert.deepEqual(s.skills, []);
  assert.equal(s.badges.length, 0);
});

test("finished stages become skills and move the child on", () => {
  const progress = {
    ...emptyKidsProgress(),
    done: [...stage("kosmos", 1), ...stage("kosmos", 2), "labirint:l1"],
    daily: { last: "2026-10-18", streak: 4, record: 4, count: 6 },
  };
  const s = kidSummary(progress, "2026-10-19");
  const kosmos = s.games.find((g) => g.id === "kosmos")!;
  assert.equal(kosmos.stage, 3);
  assert.deepEqual(
    kosmos.stages.map((x) => x.finished),
    [true, true, false],
  );
  assert.deepEqual(
    s.skills.map((x) => x.text),
    [SKILLS.kosmos[0], SKILLS.kosmos[1]],
  );
  // The maze was played before the order existed, so it stays open.
  assert.equal(s.games.find((g) => g.id === "labirint")!.open, true);
  assert.equal(s.streak, 4);
  assert.ok(s.badges.some((b) => b.id === "streak3"));
  // Every game has a skill for each of its three stages.
  for (const id of Object.keys(GAMES) as (keyof typeof SKILLS)[])
    assert.equal(SKILLS[id].length, 3);
  // A whole game done means no stage left.
  const all = kidSummary(
    {
      ...emptyKidsProgress(),
      done: GAMES.kosmos.missions.map((m) => missionKey("kosmos", m.id)),
    },
    "2026-10-19",
  );
  assert.equal(all.games.find((g) => g.id === "kosmos")!.stage, null);
});
