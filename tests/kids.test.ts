import { test } from "node:test";
import assert from "node:assert/strict";
import { effective, normalize, parse } from "../src/lib/kids/lang";
import { compile, GAMES, MAX_XP } from "../src/lib/kids/games";
import {
  applyKidsUpdate,
  emptyKidsProgress,
  kidsLevel,
  kidsXp,
  missionPassed,
  restoreKidsProgress,
} from "../src/lib/kids/progress";

const kosmos = GAMES.kosmos;

test("the starter code of every game parses cleanly to its defaults", () => {
  for (const game of Object.values(GAMES)) {
    const program = compile(game, game.starter);
    assert.deepEqual(program.problems, [], game.id);
    assert.deepEqual(program.changed, [], game.id);
    assert.deepEqual(program.rules, [], game.id);
  }
});

test("values, colours and yes/no are read; any apostrophe works", () => {
  const program = compile(
    kosmos,
    `tezlik = 12 // tezroq
kema_rangi = "qizil"
ko’rinmas = ha
# izoh
hayotlar=50`,
  );
  assert.deepEqual(program.problems, []);
  assert.equal(program.values.tezlik, 12);
  assert.equal(program.values.kema_rangi, "qizil");
  assert.equal(program.values["ko'rinmas"], true);
  assert.equal(program.values.hayotlar, 50);
  assert.deepEqual(program.changed.sort(), [
    "hayotlar",
    "kema_rangi",
    "ko'rinmas",
    "tezlik",
  ]);
  assert.equal(normalize("Ko‘RINMAS"), "ko'rinmas");
});

test("mistakes give friendly line-numbered messages and keep the rest", () => {
  const program = compile(
    kosmos,
    `tezlk = 9
tezlik = 99
kema_rangi = "qizl"
ko'rinmas = balki
hayotlar = 7
salom dunyo`,
  );
  const byLine = Object.fromEntries(
    program.problems.map((p) => [p.line, p.message.uz]),
  );
  assert.match(byLine[1], /Balki “tezlik”/);
  assert.match(byLine[2], /1 dan 20 gacha/);
  assert.match(byLine[3], /Balki “qizil”/);
  assert.match(byLine[4], /“ha” yoki “yo'q”/);
  assert.match(byLine[6], /tushunmadim/);
  // The good line still applies; bad ones keep the defaults.
  assert.equal(program.values.hayotlar, 7);
  assert.equal(program.values.tezlik, 5);
});

test("one-line rules apply only while their condition holds", () => {
  const program = compile(
    kosmos,
    `agar ochko > 50 bo'lsa kema_rangi = "oltin"
agar vaqt >= 10: tezlik = 15`,
  );
  assert.deepEqual(program.problems, []);
  assert.equal(program.rules.length, 2);
  const early = effective(program.values, program.rules, {
    ochko: 10,
    vaqt: 2,
  });
  assert.equal(early.kema_rangi, "ko'k");
  assert.equal(early.tezlik, 5);
  const late = effective(program.values, program.rules, {
    ochko: 60,
    vaqt: 12,
  });
  assert.equal(late.kema_rangi, "oltin");
  assert.equal(late.tezlik, 15);
  // Rules only watch what the game exposes.
  const bad = parse(
    `agar sir > 1 bo'lsa tezlik = 2`,
    kosmos.schema,
    kosmos.watch,
  );
  assert.equal(bad.rules.length, 0);
  assert.equal(bad.problems.length, 1);
});

test("every code mission passes with its solution and not without", () => {
  const solutions: Record<string, string> = {
    "kosmos:turbo": "tezlik = 12",
    "kosmos:hayot": "hayotlar = 10",
    "kosmos:rang": 'kema_rangi = "qizil"',
    "kosmos:sekin": "asteroid_tezligi = 1",
    "kosmos:korinmas": "ko'rinmas = ha",
    "kosmos:agar": `agar ochko > 50 bo'lsa kema_rangi = "oltin"`,
    "robot:baland": "sakrash_kuchi = 15",
    "robot:oy": "tortishish = 3",
    "robot:ikki": "ikki_marta_sakrash = ha",
    "robot:rang": 'robot_rangi = "yashil"',
    "robot:muz": "dushman_tezligi = 0",
    "robot:agar": "agar ochko > 30 bo'lsa yugurish_tezligi = 9",
    "ilon:tez": "tezlik = 9",
    "ilon:uzun": "uzunlik = 12",
    "ilon:rang": 'ilon_rangi = "binafsha"',
    "ilon:devor": "devordan_otish = ha",
    "ilon:bog": "olmalar_soni = 3",
    "ilon:agar": `agar ochko > 50 bo'lsa ilon_rangi = "oltin"`,
  };
  for (const game of Object.values(GAMES))
    for (const mission of game.missions) {
      if (mission.check.kind !== "code") continue;
      const key = `${game.id}:${mission.id}`;
      const code = `${game.starter}\n${solutions[key]}`;
      assert.deepEqual(compile(game, code).problems, [], key);
      assert.ok(missionPassed(game.id, mission.id, { code }), key);
      assert.ok(
        !missionPassed(game.id, mission.id, { code: game.starter }),
        `${key} must not pass with the starter code`,
      );
    }
});

test("the server only records missions the evidence proves", () => {
  const start = emptyKidsProgress();
  assert.equal(
    applyKidsUpdate(start, {
      game: "kosmos",
      mission: "turbo",
      code: kosmos.starter,
    }),
    null,
  );
  const turbo = applyKidsUpdate(start, {
    game: "kosmos",
    mission: "turbo",
    code: "tezlik = 12",
  });
  assert.deepEqual(turbo?.done, ["kosmos:turbo"]);
  assert.equal(turbo?.code.kosmos, "tezlik = 12");
  assert.equal(
    applyKidsUpdate(start, { game: "kosmos", mission: "ochko", score: 50 }),
    null,
  );
  const scored = applyKidsUpdate(start, {
    game: "kosmos",
    mission: "ochko",
    score: 240,
  });
  assert.equal(scored?.best.kosmos, 240);
  assert.equal(applyKidsUpdate(start, { game: "tetris", code: "x = 1" }), null);
  assert.ok(
    applyKidsUpdate(start, {
      game: "robot",
      mission: "uchish",
      cheat: "uchish",
    })?.done.includes("robot:uchish"),
  );
});

test("stored progress is cleaned and XP comes from finished missions", () => {
  const progress = restoreKidsProgress({
    done: ["kosmos:turbo", "kosmos:turbo", "robot:agar", "fake:one", 5],
    best: { kosmos: 99.7, robot: -4, other: 10 },
    code: { kosmos: "tezlik = 9", robot: 7 },
  });
  assert.deepEqual(progress.done, ["kosmos:turbo", "robot:agar"]);
  assert.deepEqual(progress.best, { kosmos: 99, robot: 0, ilon: 0 });
  assert.deepEqual(progress.code, {
    kosmos: "tezlik = 9",
    robot: "",
    ilon: "",
  });
  assert.equal(kidsXp(progress), 20 + 30);
  assert.equal(kidsLevel(0).level.title.uz, "Yangi xaker");
  assert.equal(kidsLevel(MAX_XP).next, null);
  assert.equal(MAX_XP, 540);
});
