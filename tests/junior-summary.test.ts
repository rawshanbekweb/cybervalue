import assert from "node:assert/strict";
import test from "node:test";
import { CIPHERS } from "../src/lib/junior/cipher-content";
import { juniorStages } from "../src/lib/junior/summary";

const solvedLevels = (...levels: number[]) =>
  Object.fromEntries(
    CIPHERS.filter((c) => levels.includes(c.level)).map((c) => [
      c.id,
      c.exercises.map((_, i) => i),
    ]),
  );

test("a new member is on mission stage 1 and cipher level 1 with no skills", () => {
  const stages = juniorStages({}, {});
  assert.equal(stages.missionStage, 1);
  assert.equal(stages.cipherLevel, 1);
  assert.deepEqual(stages.skills, []);
  assert.deepEqual(
    stages.missionStages.map((s) => s.open),
    [true, false, false, false],
  );
});

test("finished stages and passed levels move the member on and list skills", () => {
  const stages = juniorStages(
    { password: true, phishing: true, cipher: true },
    solvedLevels(1),
  );
  assert.equal(stages.missionStage, 2);
  assert.equal(stages.cipherLevel, 2);
  assert.deepEqual(
    stages.skills.map((s) => s.key),
    ["m1", "c1"],
  );
});

test("everything done shows no current stage or level", () => {
  const stages = juniorStages(
    {
      password: true,
      phishing: true,
      cipher: true,
      footprint: true,
      ctf: true,
      ethics: true,
      permissions: true,
      wifi: true,
    },
    solvedLevels(1, 2, 3),
  );
  assert.equal(stages.missionStage, null);
  assert.equal(stages.cipherLevel, null);
  assert.equal(stages.skills.length, 7);
});

test("after the Cyber HQ case the member moves on to stage 4", () => {
  const stages = juniorStages(
    {
      password: true,
      phishing: true,
      cipher: true,
      footprint: true,
      ctf: true,
      ethics: true,
    },
    {},
  );
  assert.equal(stages.missionStage, 4);
  assert.deepEqual(
    stages.skills.map((s) => s.key),
    ["m1", "m2", "m3"],
  );
});
