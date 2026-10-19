import { test } from "node:test";
import assert from "node:assert/strict";
import { effective, fire, normalize, parse } from "../src/lib/kids/lang";
import {
  compile,
  GAMES,
  MAX_XP,
  missionKey,
  gameOpen,
  passwordOpens,
  stageOf,
} from "../src/lib/kids/games";
import {
  badges,
  currentStreak,
  DAILY_XP,
  dailyPassed,
  dailyTask,
} from "../src/lib/kids/extras";
import {
  applyKidsUpdate,
  emptyKidsProgress,
  kidsLevel,
  kidsXp,
  missionPassed,
  restoreKidsProgress,
} from "../src/lib/kids/progress";

const kosmos = GAMES.kosmos;
const GAME_IDS_ALL = [
  "kosmos",
  "robot",
  "ilon",
  "qorovul",
  "labirint",
] as const;

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
    "kosmos:signal": `agar hayotlar < 2 bo'lsa:\n    kema_rangi = "qizil"\n    tezlik = 12`,
    "kosmos:aks": `agar vaqt < 10 bo'lsa:\n    asteroid_tezligi = 2\naks_holda:\n    asteroid_tezligi = 6`,
    "kosmos:va": "agar ochko > 100 va hayotlar > 2 bo'lsa yulduz_ochkosi = 20",
    "kosmos:yulduz": "qachon yulduz_olinsa:\n    ochko += 5",
    "kosmos:urilsa": `qachon urilsa:\n    xabar("Ehtiyot bo'l!")`,
    "robot:signal": `agar hayotlar < 2 bo'lsa:\n  robot_rangi = "qizil"\n  dushman_tezligi = 1`,
    "robot:aks": `agar vaqt < 15 bo'lsa:\n\tyugurish_tezligi = 4\naks_holda:\n\tyugurish_tezligi = 8`,
    "robot:va": "agar ochko > 50 va hayotlar > 1 bo'lsa tanga_ochkosi = 10",
    "robot:tanga": "qachon tanga_olinsa:\n    ochko += 5",
    "robot:sakrash": `qachon sakraganda:\n    robot_rangi = "pushti"`,
    "ilon:signal": `agar ochko > 100 bo'lsa:\n    ilon_rangi = "oltin"\n    tezlik = 9`,
    "ilon:aks": `agar vaqt < 20 bo'lsa:\n    tezlik = 4\naks_holda:\n    tezlik = 8`,
    "ilon:va": "agar ochko > 50 va vaqt < 60 bo'lsa olma_ochkosi = 20",
    "ilon:klassik": "qachon olma_yeganda:\n    tezlik += 1",
    "ilon:urilsa": `qachon urilsa:\n    xabar("Voy!")`,
    "qorovul:uzun_parol": "parol_uzunligi = 14",
    "qorovul:mfa": "ikki_bosqichli = ha",
    "qorovul:firewall": "firewall = ha",
    "qorovul:yangilash": "yangilanishlar = ha",
    "qorovul:antivirus": "antivirus_kuchi = 9",
    "qorovul:agar": "agar hayotlar < 3 bo'lsa antivirus_kuchi = 10",
    "qorovul:signal": `agar vaqt > 30 bo'lsa:\n    qalqon_rangi = "qizil"\n    antivirus_kuchi = 9`,
    "qorovul:aks": `agar ochko < 100 bo'lsa:\n    hujum_tezligi = 3\naks_holda:\n    hujum_tezligi = 7`,
    "qorovul:va": "agar vaqt > 60 va hayotlar > 2 bo'lsa hujum_tezligi = 8",
    "qorovul:tutqich": "qachon fishing_ushlandi:\n    ochko += 5",
    "qorovul:tiklash": `qachon urilsa:\n    hayotlar += 1\n    xabar("Zaxiradan tiklandi!")`,
  };
  for (const game of Object.values(GAMES))
    for (const mission of game.missions) {
      if (mission.check.kind !== "code") continue;
      const key = `${game.id}:${mission.id}`;
      const code = `${game.starter}\n${solutions[key]}`;
      assert.deepEqual(compile(game, code, true).problems, [], key);
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
  // The robot game opens once the space game's settings stage is done.
  assert.equal(
    applyKidsUpdate(start, {
      game: "robot",
      mission: "uchish",
      cheat: "uchish",
    }),
    null,
  );
  const spaceDone = {
    ...start,
    done: kosmos.missions
      .filter((m) => stageOf(m) === 1)
      .map((m) => missionKey("kosmos", m.id)),
  };
  assert.ok(
    applyKidsUpdate(spaceDone, {
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
  assert.deepEqual(progress.best, {
    kosmos: 99,
    robot: 0,
    ilon: 0,
    qorovul: 0,
    labirint: 0,
  });
  assert.deepEqual(progress.code, {
    kosmos: "tezlik = 9",
    robot: "",
    ilon: "",
    qorovul: "",
    labirint: "",
  });
  assert.equal(kidsXp(progress), 20 + 30);
  assert.equal(kidsLevel(0).level.title.uz, "Yangi xaker");
  assert.equal(kidsLevel(MAX_XP).next, null);
  assert.equal(MAX_XP, 1915);
});

test("blocks, “va” and “aks_holda” apply as a group", () => {
  const program = compile(
    kosmos,
    `agar hayotlar < 2 va vaqt > 10 bo'lsa:
    kema_rangi = "qizil"
    tezlik = 12
aks_holda:
    kema_rangi = "yashil"
tezlik = 7`,
  );
  assert.deepEqual(program.problems, []);
  assert.equal(program.values.tezlik, 7);
  assert.equal(program.rules.length, 3);
  const calm = effective(program.values, program.rules, {
    hayotlar: 3,
    vaqt: 20,
  });
  assert.equal(calm.kema_rangi, "yashil");
  assert.equal(calm.tezlik, 7);
  const danger = effective(program.values, program.rules, {
    hayotlar: 1,
    vaqt: 20,
  });
  assert.equal(danger.kema_rangi, "qizil");
  assert.equal(danger.tezlik, 12);
  // Both conditions must hold.
  const early = effective(program.values, program.rules, {
    hayotlar: 1,
    vaqt: 5,
  });
  assert.equal(early.kema_rangi, "yashil");
});

test("misplaced blocks and lines get clear messages", () => {
  const program = compile(
    kosmos,
    `aks_holda:
    tezlik = 2
  tezlik = 3
agar ochko > 5 bo'lsa:
    salom
agar ochko ~ 5 bo'lsa tezlik = 2`,
  );
  const byLine = Object.fromEntries(
    program.problems.map((p) => [p.line, p.message.uz]),
  );
  assert.match(byLine[1], /aks_holda/);
  assert.match(byLine[3], /surilgan/);
  assert.match(byLine[5], /Blok ichida/);
  assert.match(byLine[6], /Shartni tushunmadim/);
  assert.equal(program.rules.length, 0);
});

test("events need developer mode and run their actions within limits", () => {
  const code = `qachon yulduz_olinsa:
    ochko += 5
    tezlik += 10
    hayotlar -= 9
    xabar("Zo'r!")
qachon urilsa:
    kema_rangi = "oltin"`;
  const locked = compile(kosmos, code);
  assert.equal(locked.handlers.length, 0);
  assert.match(locked.problems[0].message.uz, /dasturchi rejimida/);
  const program = compile(kosmos, code, true);
  assert.deepEqual(program.problems, []);
  assert.equal(program.handlers.length, 2);
  const star = fire(
    program.handlers,
    kosmos.schema,
    "yulduz_olinsa",
    program.values,
    { ochko: 10, hayotlar: 3 },
  );
  assert.deepEqual(star, {
    ochko: 15,
    hayotlar: 0,
    set: { tezlik: 15 },
    say: "Zo'r!",
  });
  // Number settings stay inside their range.
  const again = fire(
    program.handlers,
    kosmos.schema,
    "yulduz_olinsa",
    { ...program.values, tezlik: 15 },
    { ochko: 0, hayotlar: 3 },
  );
  assert.equal(again?.set.tezlik, 20);
  assert.deepEqual(
    fire(program.handlers, kosmos.schema, "urilsa", program.values, {
      ochko: 0,
      hayotlar: 1,
    })?.set,
    { kema_rangi: "oltin" },
  );
  assert.equal(
    fire(program.handlers, kosmos.schema, "boshlanganda", program.values, {
      ochko: 0,
      hayotlar: 1,
    }),
    null,
  );
  const typo = compile(kosmos, "qachon yulduz_olinsaa:\n    ochko += 1", true);
  assert.match(typo.problems[0].message.uz, /Balki “yulduz_olinsa”/);
  const colour = compile(kosmos, "qachon urilsa:\n    kema_rangi += 1", true);
  assert.match(colour.problems[0].message.uz, /son emas/);
});

test("every game's files give its password away, and only that opens it", () => {
  for (const game of Object.values(GAMES).filter((g) => !g.maze)) {
    assert.ok(passwordOpens(game, game.password), game.id);
    assert.ok(passwordOpens(game, ` "${game.password.toUpperCase()}" `));
    assert.ok(!passwordOpens(game, "parol"), game.id);
    // Every game has a login mission and three stages.
    assert.deepEqual(
      [...new Set(game.missions.map(stageOf))],
      [1, 2, 3],
      game.id,
    );
    assert.equal(
      game.missions.filter((m) => m.check.kind === "login").length,
      1,
    );
  }
  // The clues, decoded the way the hints say.
  assert.match(GAMES.kosmos.files["eslatma.txt"].uz, /orbita7/);
  const reversed = /: (\S+)$/.exec(GAMES.robot.files["zaxira.txt"].uz)![1];
  assert.equal([...reversed].reverse().join(""), GAMES.robot.password);
  const shifted = /(\S+)$/.exec(GAMES.ilon.files["sir.txt"].uz)![1];
  assert.equal(
    String.fromCharCode(...[...shifted].map((c) => c.charCodeAt(0) - 1)),
    GAMES.ilon.password,
  );
  assert.match(GAMES.qorovul.files["maxfiy_savol.txt"].uz, /momiq$/);
});

test("a stage only opens once the stage before it is finished", () => {
  const start = emptyKidsProgress();
  // A stage 2 mission with good evidence is still refused at the start.
  assert.equal(
    applyKidsUpdate(start, {
      game: "kosmos",
      mission: "agar",
      code: `agar ochko > 50 bo'lsa kema_rangi = "oltin"`,
    }),
    null,
  );
  const stage1 = {
    ...start,
    done: kosmos.missions
      .filter((m) => stageOf(m) === 1)
      .map((m) => missionKey("kosmos", m.id)),
  };
  const ruled = applyKidsUpdate(stage1, {
    game: "kosmos",
    mission: "agar",
    code: `agar ochko > 50 bo'lsa kema_rangi = "oltin"`,
  });
  assert.ok(ruled?.done.includes("kosmos:agar"));
  // The password mission needs stage 2 finished and the right password.
  const stage2 = {
    ...start,
    done: kosmos.missions
      .filter((m) => stageOf(m) <= 2)
      .map((m) => missionKey("kosmos", m.id)),
  };
  assert.equal(
    applyKidsUpdate(stage1, {
      game: "kosmos",
      mission: "parol",
      password: "orbita7",
    }),
    null,
  );
  assert.equal(
    applyKidsUpdate(stage2, {
      game: "kosmos",
      mission: "parol",
      password: "yulduz",
    }),
    null,
  );
  const dev = applyKidsUpdate(stage2, {
    game: "kosmos",
    mission: "parol",
    password: "orbita7",
  });
  assert.ok(dev?.done.includes("kosmos:parol"));
  const handled = applyKidsUpdate(dev!, {
    game: "kosmos",
    mission: "yulduz",
    code: "qachon yulduz_olinsa:\n    ochko += 5",
  });
  assert.ok(handled?.done.includes("kosmos:yulduz"));
});

const stage1 = (game: "kosmos" | "robot" | "ilon") =>
  GAMES[game].missions
    .filter((m) => stageOf(m) === 1)
    .map((m) => missionKey(game, m.id));

test("games open one after another, and a started game stays open", () => {
  const none = new Set<string>();
  assert.ok(gameOpen(GAMES.kosmos, none));
  assert.ok(!gameOpen(GAMES.robot, none));
  assert.ok(!gameOpen(GAMES.ilon, none));
  const space = new Set(stage1("kosmos"));
  assert.ok(gameOpen(GAMES.robot, space));
  assert.ok(!gameOpen(GAMES.ilon, space));
  assert.ok(gameOpen(GAMES.ilon, new Set([...space, ...stage1("robot")])));
  // Children who already played before the order existed keep their game.
  assert.ok(gameOpen(GAMES.ilon, new Set(["ilon:tez"])));
});

test("the daily task is fixed for a day, proven on the server and builds a streak", () => {
  const done = new Set<string>();
  const task = dailyTask("2026-10-19", done);
  assert.deepEqual(dailyTask("2026-10-19", done), task);
  // Only open games are picked.
  for (const day of ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"])
    assert.equal(dailyTask(day, done).game, "kosmos");
  const proofFor = (t: typeof task) =>
    t.kind === "score"
      ? { score: t.score }
      : t.kind === "cheat"
        ? { cheat: t.cheat }
        : {
            code: `${GAMES[t.game].starter}\n${t.setting} = ${
              (GAMES[t.game].schema[t.setting] as { min: number }).min + 1
            }`,
          };
  assert.ok(dailyPassed(task, proofFor(task)));
  assert.ok(!dailyPassed(task, {}));

  let progress = emptyKidsProgress();
  for (const [i, day] of ["2026-10-17", "2026-10-18", "2026-10-19"].entries()) {
    const t = dailyTask(day, new Set(progress.done));
    assert.equal(
      applyKidsUpdate(progress, { game: t.game, daily: true }, day),
      null,
    );
    progress = applyKidsUpdate(
      progress,
      { game: t.game, daily: true, ...proofFor(t) },
      day,
    )!;
    assert.equal(progress.daily.streak, i + 1);
  }
  // Doing it twice on one day counts once.
  const t = dailyTask("2026-10-19", new Set());
  const again = applyKidsUpdate(
    progress,
    { game: t.game, daily: true, ...proofFor(t) },
    "2026-10-19",
  )!;
  assert.equal(again.daily.count, 3);
  assert.equal(kidsXp(again), 3 * DAILY_XP);
  assert.equal(currentStreak(again.daily, "2026-10-20"), 3);
  assert.equal(currentStreak(again.daily, "2026-10-21"), 0);
  // A missed day starts the streak again but keeps the record.
  const t22 = dailyTask("2026-10-22", new Set());
  const later = applyKidsUpdate(
    again,
    { game: t22.game, daily: true, ...proofFor(t22) },
    "2026-10-22",
  )!;
  assert.deepEqual(later.daily, {
    last: "2026-10-22",
    streak: 1,
    record: 3,
    count: 4,
  });
  const restored = restoreKidsProgress(JSON.parse(JSON.stringify(later)));
  assert.deepEqual(restored.daily, later.daily);
  const earned = badges(restored)
    .filter((b) => b.earned)
    .map((b) => b.id);
  assert.deepEqual(earned, ["streak3"]);
});

test("badges follow the progress", () => {
  const all = GAME_IDS_ALL.flatMap((id) =>
    GAMES[id].missions.map((m) => missionKey(id, m.id)),
  );
  const full = badges({
    done: all,
    best: { kosmos: 600, robot: 0, ilon: 0, qorovul: 0, labirint: 0 },
    daily: { last: "", streak: 0, record: 7, count: 7 },
  });
  assert.ok(full.every((b) => b.earned));
  const first = badges({
    done: ["kosmos:turbo"],
    best: { kosmos: 0, robot: 0, ilon: 0, qorovul: 0, labirint: 0 },
    daily: { last: "", streak: 0, record: 0, count: 0 },
  });
  assert.deepEqual(
    first.filter((b) => b.earned).map((b) => b.id),
    ["first"],
  );
});

test("the tour is remembered once shown", () => {
  const shown = applyKidsUpdate(emptyKidsProgress(), {
    game: "kosmos",
    tour: true,
  });
  assert.equal(shown?.tour, true);
  assert.equal(restoreKidsProgress(shown).tour, true);
  assert.equal(restoreKidsProgress({ tour: "yes" }).tour, false);
});

test("the cyber guard teaches each defence with its own setting", () => {
  const guard = GAMES.qorovul;
  // The starter code leaves every defence off, so the child switches them on.
  const start = compile(guard, guard.starter).values;
  assert.equal(start.ikki_bosqichli, false);
  assert.equal(start.firewall, false);
  assert.equal(start.yangilanishlar, false);
  assert.ok(Number(start.parol_uzunligi) < 12);
  // It opens with the robot game, after the space game's settings stage.
  assert.equal(guard.after, "kosmos");
  // Daily tasks can come from it once it is open.
  const open = new Set(stage1("kosmos"));
  const days = Array.from({ length: 60 }, (_, i) =>
    dailyTask(`2026-11-${String((i % 28) + 1).padStart(2, "0")}`, open),
  );
  assert.ok(days.some((t) => t.game === "qorovul"));
});

test("maze levels are proven by running the program on the server", () => {
  const maze = GAMES.labirint;
  for (const m of maze.missions) {
    assert.equal(m.check.kind, "maze", m.id);
    // The hint is a working solution; an empty program is not.
    assert.ok(missionPassed("labirint", m.id, { code: m.hint.uz }), m.id);
    assert.ok(!missionPassed("labirint", m.id, { code: "" }), m.id);
  }
  // A loop level refuses a solution without a loop.
  assert.ok(
    !missionPassed("labirint", "l7", {
      code: "oldinga(4)\nongga()\noldinga(4)\nongga()\noldinga(4)",
    }),
  );
  // It opens after the robot game's settings stage.
  assert.equal(maze.after, "robot");
  assert.ok(!gameOpen(maze, new Set(stage1("kosmos"))));
  assert.ok(gameOpen(maze, new Set([...stage1("kosmos"), ...stage1("robot")])));
});
