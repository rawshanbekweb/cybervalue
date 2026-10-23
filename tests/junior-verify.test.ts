import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CIPHER_ANSWER,
  CTF_FLAGS,
  ETHICS,
  FOOTPRINT,
  PERMISSIONS,
  PHISHING,
  WIFI,
} from "../src/lib/junior/content";
import { CIPHERS } from "../src/lib/junior/cipher-content";
import { dayIndex, puzzleFor } from "../src/lib/junior/daily";
import {
  applyJuniorPart,
  restoreJuniorProgress,
  xpOf,
} from "../src/lib/junior/progress";
import {
  bestStreak,
  cipherLevelOpen,
  missionPassed,
  missionStageOpen,
} from "../src/lib/junior/verify";

const now = Date.UTC(2026, 9, 20, 8);
const today = dayIndex(now);
const empty = () => restoreJuniorProgress({}, now);

const EVIDENCE = {
  password: { mission: "password" },
  phishing: {
    mission: "phishing",
    answers: Object.fromEntries(PHISHING.map((p) => [p.id, p.phishing])),
  },
  cipher: { mission: "cipher", answer: CIPHER_ANSWER.toUpperCase() },
  footprint: {
    mission: "footprint",
    marked: Object.fromEntries(FOOTPRINT.map((f) => [f.id, f.risky])),
  },
  ctf: {
    mission: "ctf",
    flags: Object.fromEntries(CTF_FLAGS.map((f) => [f.id, f.flag])),
  },
  ethics: {
    mission: "ethics",
    answers: Object.fromEntries(ETHICS.map((e) => [e.id, e.allowed])),
  },
  permissions: {
    mission: "permissions",
    answers: Object.fromEntries(PERMISSIONS.map((p) => [p.id, p.needed])),
  },
  wifi: {
    mission: "wifi",
    answers: Object.fromEntries(WIFI.map((w) => [w.id, w.safe])),
  },
} as const;

test("every mission passes with its answers and fails without them", () => {
  for (const [id, evidence] of Object.entries(EVIDENCE)) {
    assert.ok(missionPassed(id as keyof typeof EVIDENCE, evidence), id);
    if (id !== "password")
      assert.ok(
        !missionPassed(id as keyof typeof EVIDENCE, { mission: id }),
        id,
      );
  }
  assert.ok(!missionPassed("cipher", { mission: "cipher", answer: "wall" }));
  // Evidence for one mission does not count for another.
  assert.ok(!missionPassed("ethics", EVIDENCE.phishing));
});

test("missions open in three steps and need evidence on the server", () => {
  let p = empty();
  // A later mission is refused while its step is closed, even with answers.
  assert.equal(
    applyJuniorPart(
      p,
      "missions",
      { ctf: true },
      { missions: { ctf: EVIDENCE.ctf } },
      now,
    ),
    null,
  );
  // A claim without evidence is refused.
  assert.equal(
    applyJuniorPart(p, "missions", { phishing: true }, {}, now),
    null,
  );
  for (const id of [
    "password",
    "phishing",
    "cipher",
    "footprint",
    "ctf",
    "ethics",
  ] as const) {
    const next = applyJuniorPart(
      p,
      "missions",
      { ...p.missions, [id]: true },
      { missions: { [id]: EVIDENCE[id] } },
      now,
    );
    assert.ok(next, id);
    p = next!;
  }
  assert.equal(Object.keys(p.missions).length, 6);
  assert.ok(missionStageOpen(3, p.missions));
  // The case can be closed now, and a restart reopens it.
  p = applyJuniorPart(p, "story", true, {}, now)!;
  assert.equal(p.story, true);
  const restarted = applyJuniorPart(p, "missions", {}, {}, now)!;
  assert.equal(restarted.story, false);
  assert.equal(xpOf(restarted), 0);
  assert.equal(applyJuniorPart(empty(), "story", true, {}, now), null);
});

test("members who already did a later mission keep it open", () => {
  const old = restoreJuniorProgress({ missions: { ctf: true } }, now);
  assert.ok(missionStageOpen(3, old.missions));
  assert.ok(
    applyJuniorPart(
      old,
      "missions",
      { ctf: true, ethics: true },
      { missions: { ethics: EVIDENCE.ethics } },
      now,
    ),
  );
});

test("homework answers are checked and higher levels open at 60%", () => {
  const level1 = CIPHERS.filter((c) => c.level === 1);
  const first = level1[0];
  const p = empty();
  assert.equal(
    applyJuniorPart(
      p,
      "ciphers",
      { [first.id]: [0] },
      { answers: { [first.id]: { 0: "wrong" } } },
      now,
    ),
    null,
  );
  const ok = applyJuniorPart(
    p,
    "ciphers",
    { [first.id]: [0] },
    { answers: { [first.id]: { 0: first.exercises[0].answer } } },
    now,
  );
  assert.deepEqual(ok?.ciphers[first.id], [0]);
  const level2 = CIPHERS.find((c) => c.level === 2)!;
  assert.ok(!cipherLevelOpen(2, p.ciphers));
  assert.equal(
    applyJuniorPart(
      p,
      "ciphers",
      { [level2.id]: [0] },
      { answers: { [level2.id]: { 0: level2.exercises[0].answer } } },
      now,
    ),
    null,
  );
  // Every level-1 exercise solved opens level 2.
  const all = Object.fromEntries(
    level1.map((c) => [c.id, c.exercises.map((_, i) => i)]),
  );
  assert.ok(cipherLevelOpen(2, all));
});

test("only today's puzzle counts, with its answer, and the best streak is kept", () => {
  const p = restoreJuniorProgress({ daily: [today - 3, today - 2] }, now);
  const answer = puzzleFor(today, "en").answer;
  assert.equal(applyJuniorPart(p, "daily", [...p.daily, today], {}, now), null);
  assert.equal(
    applyJuniorPart(
      p,
      "daily",
      [...p.daily, today - 1],
      { daily: answer },
      now,
    ),
    null,
  );
  const solved = applyJuniorPart(
    p,
    "daily",
    [...p.daily, today],
    { daily: answer },
    now,
  )!;
  assert.deepEqual(solved.daily.sort(), [today - 3, today - 2, today].sort());
  // The Uzbek answer works too.
  assert.ok(
    applyJuniorPart(
      p,
      "daily",
      [...p.daily, today],
      { daily: puzzleFor(today, "uz").answer },
      now,
    ),
  );
  // Days are never taken back.
  assert.equal(applyJuniorPart(solved, "daily", [], {}, now)!.daily.length, 3);
  assert.equal(bestStreak([1, 2, 3, 7, 8]), 3);
  assert.equal(bestStreak([]), 0);
});

test("stage 4 opens after the case missions and never reopens a closed case", () => {
  let p = restoreJuniorProgress(
    {
      missions: {
        password: true,
        phishing: true,
        cipher: true,
        footprint: true,
        ctf: true,
        ethics: true,
      },
      story: true,
    },
    now,
  );
  assert.ok(missionStageOpen(4, p.missions));
  assert.ok(!missionStageOpen(4, { password: true }));
  // A wrong answer is refused.
  assert.equal(
    applyJuniorPart(
      p,
      "missions",
      { ...p.missions, wifi: true },
      { missions: { wifi: { mission: "wifi", answers: {} } } },
      now,
    ),
    null,
  );
  for (const id of ["permissions", "wifi"] as const) {
    const next = applyJuniorPart(
      p,
      "missions",
      { ...p.missions, [id]: true },
      { missions: { [id]: EVIDENCE[id] } },
      now,
    );
    assert.ok(next, id);
    p = next!;
  }
  // The case stays closed and both missions add XP.
  assert.equal(p.story, true);
  assert.equal(Object.keys(p.missions).length, 8);
});
