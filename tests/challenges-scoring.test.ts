import { test } from "node:test";
import assert from "node:assert/strict";
import {
  challengeValue,
  flagDigest,
  flagMatches,
  newFlagSalt,
  phaseOf,
  registrationOpen,
  scoreboardCutoff,
  slugPattern,
  standings,
} from "../src/lib/challenges/scoring";

const at = (minute: number) => new Date(Date.UTC(2026, 10, 1, 10, minute));
const event = {
  startsAt: at(0),
  endsAt: at(120),
  registrationEndsAt: null,
  freezeAt: at(100),
};

test("a competition is upcoming, running, then ended", () => {
  assert.equal(phaseOf(event, at(-1)), "upcoming");
  assert.equal(phaseOf(event, at(0)), "running");
  assert.equal(phaseOf(event, at(119)), "running");
  assert.equal(phaseOf(event, at(120)), "ended");
  assert.equal(registrationOpen(event, at(60)), true);
  assert.equal(registrationOpen(event, at(120)), false);
  assert.equal(
    registrationOpen({ ...event, registrationEndsAt: at(30) }, at(31)),
    false,
  );
});

test("the scoreboard freezes from freezeAt until the end", () => {
  assert.equal(scoreboardCutoff(event, at(99)), null);
  assert.deepEqual(scoreboardCutoff(event, at(100)), at(100));
  assert.equal(scoreboardCutoff(event, at(120)), null);
  assert.equal(scoreboardCutoff({ ...event, freezeAt: null }, at(110)), null);
});

test("flags are checked by digest, trimmed, and optionally case-insensitive", () => {
  const salt = newFlagSalt();
  const strict = {
    flagSalt: salt,
    flagHash: flagDigest(salt, "CV{Bayroq_7}", true),
    caseSensitive: true,
  };
  assert.equal(flagMatches(strict, "CV{Bayroq_7}"), true);
  assert.equal(flagMatches(strict, "  CV{Bayroq_7}\n"), true);
  assert.equal(flagMatches(strict, "cv{bayroq_7}"), false);
  assert.equal(flagMatches(strict, "CV{Bayroq_8}"), false);
  const loose = {
    flagSalt: salt,
    flagHash: flagDigest(salt, "CV{Bayroq_7}", false),
    caseSensitive: false,
  };
  assert.equal(flagMatches(loose, "cv{BAYROQ_7}"), true);
  // The same flag under another salt gives another digest.
  assert.notEqual(
    flagDigest(newFlagSalt(), "CV{x}", true),
    flagDigest(newFlagSalt(), "CV{x}", true),
  );
});

test("a challenge's value falls with solves to its minimum", () => {
  const rule = { initialPoints: 500, minimumPoints: 100, decay: 20 };
  assert.equal(challengeValue(rule, 0), 500);
  assert.equal(challengeValue(rule, 1), 500);
  assert.equal(challengeValue(rule, 11), 400);
  assert.equal(challengeValue(rule, 21), 100);
  assert.equal(challengeValue(rule, 500), 100);
  const values = [1, 2, 5, 10, 15, 20].map((n) => challengeValue(rule, n));
  assert.deepEqual(
    [...values].sort((a, b) => b - a),
    values,
  );
  // A static challenge: minimum equal to initial.
  assert.equal(
    challengeValue({ initialPoints: 300, minimumPoints: 300, decay: 10 }, 9),
    300,
  );
});

test("standings rank by score, then by who got there first; hints cost points", () => {
  const rule = { initialPoints: 100, minimumPoints: 100, decay: 1 };
  const challenges = new Map([
    ["a", rule],
    ["b", rule],
  ]);
  const rows = standings(
    ["red", "blue", "green", "idle"],
    challenges,
    [
      { entrantId: "red", challengeId: "a", at: at(10) },
      { entrantId: "blue", challengeId: "a", at: at(5) },
      { entrantId: "red", challengeId: "b", at: at(50) },
      { entrantId: "blue", challengeId: "b", at: at(40) },
      { entrantId: "green", challengeId: "a", at: at(20) },
    ],
    [{ entrantId: "green", cost: 30, at: at(15) }],
  );
  assert.deepEqual(
    rows.map((r) => [r.entrantId, r.score, r.rank]),
    [
      ["blue", 200, 1],
      ["red", 200, 2],
      ["green", 70, 3],
      ["idle", 0, 4],
    ],
  );
  // Frozen at minute 45: red's last solve does not count yet.
  const frozen = standings(
    ["red", "blue"],
    challenges,
    [
      { entrantId: "red", challengeId: "a", at: at(10) },
      { entrantId: "red", challengeId: "b", at: at(50) },
      { entrantId: "blue", challengeId: "a", at: at(5) },
    ],
    [],
    at(45),
  );
  assert.deepEqual(
    frozen.map((r) => [r.entrantId, r.score]),
    [
      ["blue", 100],
      ["red", 100],
    ],
  );
});

test("competition slugs are short, lower-case and URL-safe", () => {
  for (const good of ["ctf-2026", "kuz-musobaqasi", "ab1"])
    assert.equal(slugPattern.test(good), true, good);
  for (const bad of ["A", "a1", "-x", "x-", "a b", "a_b", "a".repeat(61)])
    assert.equal(slugPattern.test(bad), false, bad);
});
