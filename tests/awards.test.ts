import { test } from "node:test";
import assert from "node:assert/strict";
import { newAwards } from "../src/lib/student/award-rules";
import { standing } from "../src/lib/student/xp";

test("automatic certificates need every lesson and a passed checkpoint", () => {
  const ids = (facts: Parameters<typeof newAwards>[0], issued: string[] = []) =>
    newAwards(facts, issued).map((a) => a.id);
  assert.deepEqual(
    ids({ labs: { linux: 16 }, checkpoints: { "linux-1": 60 } }),
    [],
  );
  assert.deepEqual(
    ids({ labs: { linux: 15 }, checkpoints: { "linux-1": 90 } }),
    [],
  );
  assert.deepEqual(
    ids({ labs: { linux: 16 }, checkpoints: { "linux-1": 70 } }),
    ["lab-linux"],
  );
  // Network needs both of its checkpoints.
  assert.deepEqual(
    ids({ labs: { network: 17 }, checkpoints: { "network-1": 100 } }),
    [],
  );
  assert.deepEqual(
    ids({
      labs: { network: 17 },
      checkpoints: { "network-1": 80, "network-2": 75 },
    }),
    ["lab-network"],
  );
  // Already issued ones are not repeated.
  assert.deepEqual(
    ids({ labs: { linux: 16 }, checkpoints: { "linux-1": 70 } }, ["lab-linux"]),
    [],
  );
});

test("Junior XP carries over as a bonus", () => {
  const empty = {
    materials: [],
    progress: [],
    submissions: [],
    checkpoints: [],
  };
  assert.equal(standing(empty).xp, 0);
  const moved = standing({ ...empty, bonus: 420 });
  assert.equal(moved.xp, 420);
  assert.notEqual(moved.rank.title.en, standing(empty).rank.title.en);
  assert.equal(standing({ ...empty, bonus: -50 }).xp, 0);
});
