// The Academy Kids games: what their code can change, the secret terminal
// commands and the missions. Shared by the browser and the server, so a
// mission saved to an account is checked the same way it was shown.
//
// Every game has three stages, each opened by finishing the one before:
// 1 settings, 2 rules ("agar"), 3 developer mode, opened by finding the
// developer password left in the game's files, with event handlers
// ("qachon").
import {
  COLORS,
  normalize,
  parse,
  type Action,
  type Program,
  type Schema,
  type Text,
} from "./lang";

export type GameId = "kosmos" | "robot" | "ilon";

export type Cheat = { name: string; effect: Text; seconds: number };

export type Check =
  | { kind: "code"; test: (program: Program) => boolean }
  | { kind: "cheat"; cheat: string }
  | { kind: "score"; score: number }
  | { kind: "login" };

export type Stage = 1 | 2 | 3;

export type Mission = {
  id: string;
  title: Text;
  task: Text;
  hint: Text;
  xp: number;
  check: Check;
  /** 1 when left out. */
  stage?: Stage;
};

export type Game = {
  id: GameId;
  title: Text;
  tagline: Text;
  schema: Schema;
  /** Values a rule may watch while the game runs. */
  watch: string[];
  starter: string;
  cheats: Cheat[];
  /** Events the game reports to "qachon" handlers, with what they mean. */
  events: Record<string, Text>;
  /** Files the terminal can list and read; one gives the password away. */
  files: Record<string, Text>;
  /** Opens developer mode; normalized like everything a child types. */
  password: string;
  /** The game whose first stage opens this one; none for the first game. */
  after?: GameId;
  missions: Mission[];
};

export const STAGES: { stage: Stage; title: Text; lesson: Text }[] = [
  {
    stage: 1,
    title: { uz: "Sozlamalar", en: "Settings" },
    lesson: {
      uz: "Siz o‘yin xotirasidagi sonlarni o‘zgartirdingiz. Haqiqiy xakerlar ham shunday qiladi, shuning uchun jiddiy o‘yinlar muhim narsani serverda qayta tekshiradi. Bizning sayt ham: topshiriqlaringiz serverda tekshiriladi!",
      en: "You changed numbers in the game's memory. Real hackers do this too, which is why serious games check important things again on the server. So does this site: your missions are checked on the server!",
    },
  },
  {
    stage: 2,
    title: { uz: "Qoidalar", en: "Rules" },
    lesson: {
      uz: "“agar” bilan kompyuter qaror qabul qiladi. Antivirus ham shunday ishlaydi: agar fayl shubhali bo‘lsa, uni to‘xtatadi. Firewall: agar ulanish begona bo‘lsa, uni yopadi.",
      en: "With “agar” (if) the computer makes decisions. An antivirus works the same way: if a file looks suspicious, it stops it. A firewall: if a connection is a stranger, it blocks it.",
    },
  },
  {
    stage: 3,
    title: { uz: "Dasturchi rejimi", en: "Developer mode" },
    lesson: {
      uz: "Parol faylda qolib ketgani uchun siz dasturchi rejimiga kirdingiz. Haqiqiy xakerlar ham aynan shunday xatolarni qidiradi. Parolni hech qachon faylda, kodda yoki qog‘ozda qoldirmang!",
      en: "You got into developer mode because a password was left in a file. Real hackers look for exactly this kind of mistake. Never leave a password in a file, in code or on paper!",
    },
  },
];

export const stageOf = (m: Mission): Stage => m.stage ?? 1;

/** Whether a stage is open: the first always, the others once every mission of the stage before is done. */
export function stageOpen(game: Game, stage: Stage, done: Set<string>) {
  if (stage === 1) return true;
  return game.missions
    .filter((m) => stageOf(m) === stage - 1)
    .every((m) => done.has(missionKey(game.id, m.id)));
}

/** Developer mode is on once the password mission is done. */
export const devMode = (game: Game, done: Set<string>) =>
  game.missions.some(
    (m) => m.check.kind === "login" && done.has(missionKey(game.id, m.id)),
  );

/** Whether a typed password opens the game's developer mode. */
export const passwordOpens = (game: Game, typed: string) =>
  normalize(typed.trim()).replace(/^"(.*)"$/, "$1") === game.password;

const changedColor = (name: string, from: string) => (p: Program) =>
  p.values[name] !== from;

/** A rule (not an "aks_holda" line) that watches `watch` and sets `name`. */
const ruleOn = (watch: string, name: string) => (p: Program) =>
  p.rules.some(
    (r) =>
      !r.otherwise && r.name === name && r.when.some((c) => c.watch === watch),
  );

/** An "agar" block watching `watch` that changes at least two settings. */
const blockOn = (watch: string) => (p: Program) => {
  const blocks = new Map<object, Set<string>>();
  for (const r of p.rules)
    if (!r.otherwise && r.when.some((c) => c.watch === watch))
      blocks.set(r.when, (blocks.get(r.when) ?? new Set()).add(r.name));
  return [...blocks.values()].some((names) => names.size >= 2);
};

const hasElse = (p: Program) => p.rules.some((r) => r.otherwise);
const hasAnd = (p: Program) => p.rules.some((r) => r.when.length >= 2);

const handles =
  (event: string, test: (a: Action) => boolean = () => true) =>
  (p: Program) =>
    p.handlers.some((h) => h.event === event && h.actions.some(test));

const addsScore = (a: Action) =>
  a.kind === "add" && a.name === "ochko" && a.amount > 0;
const says = (a: Action) => a.kind === "say";

export const GAMES: Record<GameId, Game> = {
  kosmos: {
    id: "kosmos",
    title: { uz: "Kosmik qochish", en: "Space escape" },
    tagline: {
      uz: "Kemani boshqaring, asteroidlardan qoching, yulduz yig‘ing.",
      en: "Steer the ship, dodge asteroids, collect stars.",
    },
    schema: {
      tezlik: {
        kind: "number",
        default: 5,
        min: 1,
        max: 20,
        label: { uz: "Kema tezligi", en: "Ship speed" },
      },
      hayotlar: {
        kind: "number",
        default: 3,
        min: 1,
        max: 99,
        label: { uz: "Hayotlar soni", en: "Lives" },
      },
      kema_rangi: {
        kind: "color",
        default: "ko'k",
        label: { uz: "Kema rangi", en: "Ship colour" },
      },
      asteroid_tezligi: {
        kind: "number",
        default: 4,
        min: 1,
        max: 10,
        label: { uz: "Asteroidlar tezligi", en: "Asteroid speed" },
      },
      asteroidlar_soni: {
        kind: "number",
        default: 4,
        min: 1,
        max: 10,
        label: { uz: "Asteroidlar soni", en: "How many asteroids" },
      },
      yulduz_ochkosi: {
        kind: "number",
        default: 10,
        min: 1,
        max: 100,
        label: { uz: "Bir yulduz necha ochko", en: "Points per star" },
      },
      "ko'rinmas": {
        kind: "bool",
        default: false,
        label: {
          uz: "Ko‘rinmas kema (asteroid tegmaydi)",
          en: "Invisible ship (asteroids pass through)",
        },
      },
    },
    watch: ["ochko", "hayotlar", "vaqt"],
    starter: `// Kosmik kema sozlamalari.
// Sonni o'zgartiring va "Ishga tushirish"ni bosing!
tezlik = 5
hayotlar = 3
kema_rangi = "ko'k"
asteroid_tezligi = 4
asteroidlar_soni = 4
yulduz_ochkosi = 10
ko'rinmas = yo'q
`,
    cheats: [
      {
        name: "yulduz_yomg'iri",
        effect: { uz: "Osmondan yulduzlar yog‘adi", en: "Stars rain down" },
        seconds: 6,
      },
      {
        name: "qalqon",
        effect: {
          uz: "Kemani qalqon himoya qiladi",
          en: "A shield protects the ship",
        },
        seconds: 8,
      },
      {
        name: "vaqtni_sekinlashtir",
        effect: { uz: "Hamma narsa sekinlashadi", en: "Everything slows down" },
        seconds: 6,
      },
      {
        name: "portlash",
        effect: {
          uz: "Ekrandagi asteroidlar yo‘q bo‘ladi",
          en: "Asteroids on screen vanish",
        },
        seconds: 0,
      },
    ],
    events: {
      boshlanganda: { uz: "O‘yin boshlanganda", en: "When the game starts" },
      yulduz_olinsa: {
        uz: "Kema yulduz olganda",
        en: "When the ship takes a star",
      },
      urilsa: {
        uz: "Kemaga asteroid urilganda",
        en: "When an asteroid hits the ship",
      },
    },
    files: {
      "jurnal.log": {
        uz: "08:00 Kema ishga tushdi.\n08:01 Dvigatellar tekshirildi.\n08:02 Dasturchi tizimga kirdi.",
        en: "08:00 Ship started.\n08:01 Engines checked.\n08:02 The developer signed in.",
      },
      "eslatma.txt": {
        uz: "Dasturchi eslatmasi: dasturchi rejimining paroli — orbita7. Hech kimga aytmang!",
        en: "Developer's note: the developer mode password is orbita7. Don't tell anyone!",
      },
    },
    password: "orbita7",
    missions: [
      {
        id: "turbo",
        title: { uz: "Turbo dvigatel", en: "Turbo engine" },
        task: {
          uz: "Kemani tezlashtiring: tezlik kamida 10 bo‘lsin.",
          en: "Make the ship faster: speed at least 10.",
        },
        hint: {
          uz: "“tezlik = 5” qatorini “tezlik = 12” qiling.",
          en: "Change the line “tezlik = 5” to “tezlik = 12”.",
        },
        xp: 20,
        check: { kind: "code", test: (p) => Number(p.values.tezlik) >= 10 },
      },
      {
        id: "hayot",
        title: { uz: "Ko‘p hayotli kema", en: "Many lives" },
        task: {
          uz: "Kemaga kamida 10 ta hayot bering.",
          en: "Give the ship at least 10 lives.",
        },
        hint: { uz: "hayotlar = 10", en: "hayotlar = 10" },
        xp: 20,
        check: { kind: "code", test: (p) => Number(p.values.hayotlar) >= 10 },
      },
      {
        id: "rang",
        title: { uz: "Yangi bo‘yoq", en: "New paint" },
        task: {
          uz: "Kema rangini o‘zgartiring.",
          en: "Change the ship's colour.",
        },
        hint: {
          uz: `Ranglar: ${Object.keys(COLORS).join(", ")}. Masalan: kema_rangi = "qizil"`,
          en: `Colours: ${Object.keys(COLORS).join(", ")}. For example: kema_rangi = "qizil"`,
        },
        xp: 20,
        check: { kind: "code", test: changedColor("kema_rangi", "ko'k") },
      },
      {
        id: "sekin",
        title: { uz: "Sekin asteroidlar", en: "Slow asteroids" },
        task: {
          uz: "Asteroidlarni sekinlashtiring: tezligi 2 yoki undan kam.",
          en: "Slow the asteroids down: speed 2 or less.",
        },
        hint: { uz: "asteroid_tezligi = 1", en: "asteroid_tezligi = 1" },
        xp: 20,
        check: {
          kind: "code",
          test: (p) => Number(p.values.asteroid_tezligi) <= 2,
        },
      },
      {
        id: "korinmas",
        title: { uz: "Ko‘rinmas kema", en: "Invisible ship" },
        task: {
          uz: "Kemani ko‘rinmas qiling, asteroidlar undan o‘tib ketsin.",
          en: "Make the ship invisible so asteroids pass through it.",
        },
        hint: {
          uz: "“yo'q” so‘zini “ha” ga almashtiring.",
          en: "Replace “yo'q” (no) with “ha” (yes).",
        },
        xp: 20,
        check: { kind: "code", test: (p) => p.values["ko'rinmas"] === true },
      },
      {
        id: "terminal",
        title: { uz: "Maxfiy buyruq", en: "Secret command" },
        task: {
          uz: "O‘yin paytida terminalga maxfiy buyruq yozing va yulduz yomg‘irini chaqiring.",
          en: "While playing, type the secret command in the terminal to call a star rain.",
        },
        hint: {
          uz: "Terminalga yulduz_yomg'iri() deb yozing va Enter bosing. Barcha buyruqlar: yordam()",
          en: "Type yulduz_yomg'iri() in the terminal and press Enter. All commands: yordam()",
        },
        xp: 25,
        check: { kind: "cheat", cheat: "yulduz_yomg'iri" },
      },
      {
        id: "ochko",
        title: { uz: "200 ochko", en: "200 points" },
        task: {
          uz: "Bitta o‘yinda 200 ochko to‘plang. Xaklardan foydalanish mumkin!",
          en: "Score 200 points in one game. Hacks are allowed!",
        },
        hint: {
          uz: "yulduz_ochkosi ni oshiring yoki hayotlarni ko‘paytiring.",
          en: "Raise yulduz_ochkosi or add more lives.",
        },
        xp: 25,
        check: { kind: "score", score: 200 },
      },
      {
        id: "agar",
        stage: 2,
        title: { uz: "Oltin kema", en: "Golden ship" },
        task: {
          uz: "Qoida yozing: ochko 50 dan oshsa, kema oltin rangga kirsin.",
          en: "Write a rule: when the score is over 50, the ship turns gold.",
        },
        hint: {
          uz: `Yangi qator qo‘shing: agar ochko > 50 bo'lsa kema_rangi = "oltin"`,
          en: `Add a new line: agar ochko > 50 bo'lsa kema_rangi = "oltin"`,
        },
        xp: 30,
        check: {
          kind: "code",
          test: ruleOn("ochko", "kema_rangi"),
        },
      },
      {
        id: "signal",
        stage: 2,
        title: { uz: "Xavf signali", en: "Danger signal" },
        task: {
          uz: "Blok yozing: hayotlar 2 dan kam bo‘lsa, kema qizil bo‘lsin va tezlashsin. Blokda ikkita sozlama bo‘lsin.",
          en: "Write a block: when lives are under 2, the ship turns red and speeds up. Put two settings in the block.",
        },
        hint: {
          uz: `Qatorlarni bo‘sh joy bilan suring:\nagar hayotlar < 2 bo'lsa:\n    kema_rangi = "qizil"\n    tezlik = 12`,
          en: `Indent the lines with spaces:\nagar hayotlar < 2 bo'lsa:\n    kema_rangi = "qizil"\n    tezlik = 12`,
        },
        xp: 30,
        check: { kind: "code", test: blockOn("hayotlar") },
      },
      {
        id: "aks",
        stage: 2,
        title: { uz: "Aks holda", en: "Otherwise" },
        task: {
          uz: "Dastlabki 10 soniyada asteroidlar sekin, keyin tez uchsin. “aks_holda:” blokidan foydalaning.",
          en: "Make asteroids slow for the first 10 seconds and fast after. Use an “aks_holda:” (otherwise) block.",
        },
        hint: {
          uz: `agar vaqt < 10 bo'lsa:\n    asteroid_tezligi = 2\naks_holda:\n    asteroid_tezligi = 6`,
          en: `agar vaqt < 10 bo'lsa:\n    asteroid_tezligi = 2\naks_holda:\n    asteroid_tezligi = 6`,
        },
        xp: 30,
        check: { kind: "code", test: hasElse },
      },
      {
        id: "va",
        stage: 2,
        title: { uz: "Ikki shart", en: "Two conditions" },
        task: {
          uz: "Ikki shartli qoida yozing: ochko 100 dan ko‘p va hayotlar 2 dan ko‘p bo‘lsa, yulduz 20 ochko bersin.",
          en: "Write a rule with two conditions: when the score is over 100 and lives are over 2, a star gives 20 points.",
        },
        hint: {
          uz: `agar ochko > 100 va hayotlar > 2 bo'lsa yulduz_ochkosi = 20`,
          en: `agar ochko > 100 va hayotlar > 2 bo'lsa yulduz_ochkosi = 20`,
        },
        xp: 30,
        check: { kind: "code", test: hasAnd },
      },
      {
        id: "parol",
        stage: 3,
        title: { uz: "Maxfiy parol", en: "Secret password" },
        task: {
          uz: 'Dasturchi parolni fayllardan birida qoldirib ketgan. Terminalda fayllar() deb yozing, fayllarni o‘qing va kirish("parol") bilan dasturchi rejimini oching.',
          en: 'The developer left the password in one of the files. Type fayllar() in the terminal, read the files and open developer mode with kirish("password").',
        },
        hint: {
          uz: `Avval o‘qi("eslatma.txt") deb yozib ko‘ring.`,
          en: `Try o'qi("eslatma.txt") first.`,
        },
        xp: 30,
        check: { kind: "login" },
      },
      {
        id: "yulduz",
        stage: 3,
        title: { uz: "Yulduz bonusi", en: "Star bonus" },
        task: {
          uz: "Hodisa yozing: kema yulduz olganda yana 5 ochko qo‘shilsin.",
          en: "Write an event: when the ship takes a star, add 5 more points.",
        },
        hint: {
          uz: `qachon yulduz_olinsa:\n    ochko += 5`,
          en: `qachon yulduz_olinsa:\n    ochko += 5`,
        },
        xp: 35,
        check: { kind: "code", test: handles("yulduz_olinsa", addsScore) },
      },
      {
        id: "urilsa",
        stage: 3,
        title: { uz: "Ogohlantirish", en: "Warning" },
        task: {
          uz: "Asteroid urilganda ekranda xabar chiqsin.",
          en: "Show a message on screen when an asteroid hits.",
        },
        hint: {
          uz: `qachon urilsa:\n    xabar("Ehtiyot bo'l!")`,
          en: `qachon urilsa:\n    xabar("Ehtiyot bo'l!")`,
        },
        xp: 35,
        check: { kind: "code", test: handles("urilsa", says) },
      },
      {
        id: "usta",
        stage: 3,
        title: { uz: "Kosmos ustasi", en: "Space master" },
        task: {
          uz: "Bitta o‘yinda 500 ochko to‘plang.",
          en: "Score 500 points in one game.",
        },
        hint: {
          uz: `Hodisalar va qoidalarni birga ishlating.`,
          en: `Use events and rules together.`,
        },
        xp: 40,
        check: { kind: "score", score: 500 },
      },
    ],
  },
  robot: {
    id: "robot",
    after: "kosmos",
    title: { uz: "Robot sakrash", en: "Robot jump" },
    tagline: {
      uz: "Robot yuguradi: to‘siqlardan sakrang, tanga yig‘ing.",
      en: "The robot runs: jump over obstacles, collect coins.",
    },
    schema: {
      sakrash_kuchi: {
        kind: "number",
        default: 8,
        min: 1,
        max: 20,
        label: { uz: "Sakrash kuchi", en: "Jump power" },
      },
      tortishish: {
        kind: "number",
        default: 10,
        min: 1,
        max: 20,
        label: { uz: "Tortishish kuchi", en: "Gravity" },
      },
      yugurish_tezligi: {
        kind: "number",
        default: 5,
        min: 1,
        max: 15,
        label: { uz: "Yugurish tezligi", en: "Running speed" },
      },
      robot_rangi: {
        kind: "color",
        default: "kumush",
        label: { uz: "Robot rangi", en: "Robot colour" },
      },
      ikki_marta_sakrash: {
        kind: "bool",
        default: false,
        label: { uz: "Havoda yana bir marta sakrash", en: "Double jump" },
      },
      dushman_tezligi: {
        kind: "number",
        default: 3,
        min: 0,
        max: 10,
        label: { uz: "Dushmanlar tezligi", en: "Enemy speed" },
      },
      tanga_ochkosi: {
        kind: "number",
        default: 5,
        min: 1,
        max: 100,
        label: { uz: "Bir tanga necha ochko", en: "Points per coin" },
      },
      hayotlar: {
        kind: "number",
        default: 3,
        min: 1,
        max: 99,
        label: { uz: "Hayotlar soni", en: "Lives" },
      },
    },
    watch: ["ochko", "hayotlar", "vaqt"],
    starter: `// Robot sozlamalari.
// Sonni o'zgartiring va "Ishga tushirish"ni bosing!
sakrash_kuchi = 8
tortishish = 10
yugurish_tezligi = 5
robot_rangi = "kumush"
ikki_marta_sakrash = yo'q
dushman_tezligi = 3
tanga_ochkosi = 5
hayotlar = 3
`,
    cheats: [
      {
        name: "uchish",
        effect: { uz: "Robot uchadi", en: "The robot flies" },
        seconds: 6,
      },
      {
        name: "magnit",
        effect: {
          uz: "Tangalar robotga tortiladi",
          en: "Coins fly to the robot",
        },
        seconds: 8,
      },
      {
        name: "kichrayish",
        effect: { uz: "Robot kichrayadi", en: "The robot shrinks" },
        seconds: 8,
      },
      {
        name: "super_sakrash",
        effect: { uz: "Bir martalik ulkan sakrash", en: "One giant jump" },
        seconds: 0,
      },
    ],
    events: {
      boshlanganda: { uz: "O‘yin boshlanganda", en: "When the game starts" },
      tanga_olinsa: {
        uz: "Robot tanga olganda",
        en: "When the robot takes a coin",
      },
      sakraganda: { uz: "Robot sakraganda", en: "When the robot jumps" },
      urilsa: {
        uz: "Robot to‘siqqa urilganda",
        en: "When the robot hits an obstacle",
      },
    },
    files: {
      "sozlamalar.cfg": {
        uz: "ekran = katta\novoz = yoqilgan\nrejim = oddiy",
        en: "screen = large\nsound = on\nmode = normal",
      },
      "zaxira.txt": {
        uz: "Parolni xavfsiz qilish uchun uni teskari yozdim: 0102_tobor",
        en: "To keep the password safe I wrote it backwards: 0102_tobor",
      },
    },
    password: "robot_2010",
    missions: [
      {
        id: "baland",
        title: { uz: "Baland sakrash", en: "High jump" },
        task: {
          uz: "Robot balandroq sakrasin: sakrash kuchi kamida 14.",
          en: "Make the robot jump higher: jump power at least 14.",
        },
        hint: { uz: "sakrash_kuchi = 15", en: "sakrash_kuchi = 15" },
        xp: 20,
        check: {
          kind: "code",
          test: (p) => Number(p.values.sakrash_kuchi) >= 14,
        },
      },
      {
        id: "oy",
        title: { uz: "Oydagi robot", en: "Robot on the Moon" },
        task: {
          uz: "Tortishishni Oydagidek kuchsiz qiling: 4 yoki undan kam.",
          en: "Make gravity weak like on the Moon: 4 or less.",
        },
        hint: { uz: "tortishish = 3", en: "tortishish = 3" },
        xp: 20,
        check: { kind: "code", test: (p) => Number(p.values.tortishish) <= 4 },
      },
      {
        id: "ikki",
        title: { uz: "Ikki marta sakrash", en: "Double jump" },
        task: {
          uz: "Robot havoda yana bir marta sakray olsin.",
          en: "Let the robot jump once more in the air.",
        },
        hint: { uz: "ikki_marta_sakrash = ha", en: "ikki_marta_sakrash = ha" },
        xp: 20,
        check: {
          kind: "code",
          test: (p) => p.values.ikki_marta_sakrash === true,
        },
      },
      {
        id: "rang",
        title: { uz: "Robotni bo‘yang", en: "Paint the robot" },
        task: {
          uz: "Robot rangini o‘zgartiring.",
          en: "Change the robot's colour.",
        },
        hint: {
          uz: `Masalan: robot_rangi = "yashil"`,
          en: `For example: robot_rangi = "yashil"`,
        },
        xp: 20,
        check: { kind: "code", test: changedColor("robot_rangi", "kumush") },
      },
      {
        id: "muz",
        title: { uz: "Muzlatilgan dushmanlar", en: "Frozen enemies" },
        task: {
          uz: "Dushmanlarni to‘xtating: ularning tezligi 0 bo‘lsin.",
          en: "Stop the enemies: make their speed 0.",
        },
        hint: { uz: "dushman_tezligi = 0", en: "dushman_tezligi = 0" },
        xp: 20,
        check: {
          kind: "code",
          test: (p) => Number(p.values.dushman_tezligi) === 0,
        },
      },
      {
        id: "uchish",
        title: { uz: "Uchuvchi robot", en: "Flying robot" },
        task: {
          uz: "O‘yin paytida terminal orqali robotni uchiring.",
          en: "While playing, make the robot fly from the terminal.",
        },
        hint: {
          uz: "Terminalga uchish() deb yozing. Barcha buyruqlar: yordam()",
          en: "Type uchish() in the terminal. All commands: yordam()",
        },
        xp: 25,
        check: { kind: "cheat", cheat: "uchish" },
      },
      {
        id: "ochko",
        title: { uz: "150 ochko", en: "150 points" },
        task: {
          uz: "Bitta o‘yinda 150 ochko to‘plang.",
          en: "Score 150 points in one game.",
        },
        hint: {
          uz: "tanga_ochkosi ni oshiring yoki magnit() buyrug‘ini sinab ko‘ring.",
          en: "Raise tanga_ochkosi or try the magnit() command.",
        },
        xp: 25,
        check: { kind: "score", score: 150 },
      },
      {
        id: "agar",
        stage: 2,
        title: { uz: "Tezlashuvchi robot", en: "Speeding robot" },
        task: {
          uz: "Qoida yozing: ochko 30 dan oshsa, robot tezroq yugursin.",
          en: "Write a rule: when the score is over 30, the robot runs faster.",
        },
        hint: {
          uz: "Yangi qator: agar ochko > 30 bo'lsa yugurish_tezligi = 9",
          en: "New line: agar ochko > 30 bo'lsa yugurish_tezligi = 9",
        },
        xp: 30,
        check: {
          kind: "code",
          test: ruleOn("ochko", "yugurish_tezligi"),
        },
      },
      {
        id: "signal",
        stage: 2,
        title: { uz: "Xavf signali", en: "Danger signal" },
        task: {
          uz: "Blok yozing: hayotlar 2 dan kam bo‘lsa, robot qizil bo‘lsin va dushmanlar sekinlashsin. Blokda ikkita sozlama bo‘lsin.",
          en: "Write a block: when lives are under 2, the robot turns red and enemies slow down. Put two settings in the block.",
        },
        hint: {
          uz: `agar hayotlar < 2 bo'lsa:\n    robot_rangi = "qizil"\n    dushman_tezligi = 1`,
          en: `agar hayotlar < 2 bo'lsa:\n    robot_rangi = "qizil"\n    dushman_tezligi = 1`,
        },
        xp: 30,
        check: { kind: "code", test: blockOn("hayotlar") },
      },
      {
        id: "aks",
        stage: 2,
        title: { uz: "Aks holda", en: "Otherwise" },
        task: {
          uz: "Dastlabki 15 soniyada robot sekin, keyin tez yugursin. “aks_holda:” blokidan foydalaning.",
          en: "Make the robot run slowly for the first 15 seconds and fast after. Use an “aks_holda:” (otherwise) block.",
        },
        hint: {
          uz: `agar vaqt < 15 bo'lsa:\n    yugurish_tezligi = 4\naks_holda:\n    yugurish_tezligi = 8`,
          en: `agar vaqt < 15 bo'lsa:\n    yugurish_tezligi = 4\naks_holda:\n    yugurish_tezligi = 8`,
        },
        xp: 30,
        check: { kind: "code", test: hasElse },
      },
      {
        id: "va",
        stage: 2,
        title: { uz: "Ikki shart", en: "Two conditions" },
        task: {
          uz: "Ikki shartli qoida yozing: ochko 50 dan ko‘p va hayotlar 1 dan ko‘p bo‘lsa, tanga 10 ochko bersin.",
          en: "Write a rule with two conditions: when the score is over 50 and lives are over 1, a coin gives 10 points.",
        },
        hint: {
          uz: `agar ochko > 50 va hayotlar > 1 bo'lsa tanga_ochkosi = 10`,
          en: `agar ochko > 50 va hayotlar > 1 bo'lsa tanga_ochkosi = 10`,
        },
        xp: 30,
        check: { kind: "code", test: hasAnd },
      },
      {
        id: "parol",
        stage: 3,
        title: { uz: "Maxfiy parol", en: "Secret password" },
        task: {
          uz: 'Dasturchi parolni fayllardan birida qoldirib ketgan. Terminalda fayllar() deb yozing, fayllarni o‘qing va kirish("parol") bilan dasturchi rejimini oching.',
          en: 'The developer left the password in one of the files. Type fayllar() in the terminal, read the files and open developer mode with kirish("password").',
        },
        hint: {
          uz: `zaxira.txt dagi parolni oxiridan boshiga qarab o‘qing.`,
          en: `Read the password in zaxira.txt from the end to the start.`,
        },
        xp: 30,
        check: { kind: "login" },
      },
      {
        id: "tanga",
        stage: 3,
        title: { uz: "Tanga bonusi", en: "Coin bonus" },
        task: {
          uz: "Hodisa yozing: robot tanga olganda yana 5 ochko qo‘shilsin.",
          en: "Write an event: when the robot takes a coin, add 5 more points.",
        },
        hint: {
          uz: `qachon tanga_olinsa:\n    ochko += 5`,
          en: `qachon tanga_olinsa:\n    ochko += 5`,
        },
        xp: 35,
        check: { kind: "code", test: handles("tanga_olinsa", addsScore) },
      },
      {
        id: "sakrash",
        stage: 3,
        title: { uz: "Rangli sakrash", en: "Colourful jump" },
        task: {
          uz: "Robot har sakraganda rangini o‘zgartirsin.",
          en: "Change the robot's colour every time it jumps.",
        },
        hint: {
          uz: `qachon sakraganda:\n    robot_rangi = "pushti"`,
          en: `qachon sakraganda:\n    robot_rangi = "pushti"`,
        },
        xp: 35,
        check: {
          kind: "code",
          test: handles("sakraganda", (a) => a.kind === "set"),
        },
      },
      {
        id: "usta",
        stage: 3,
        title: { uz: "Robot ustasi", en: "Robot master" },
        task: {
          uz: "Bitta o‘yinda 400 ochko to‘plang.",
          en: "Score 400 points in one game.",
        },
        hint: {
          uz: `Hodisalar va qoidalarni birga ishlating.`,
          en: `Use events and rules together.`,
        },
        xp: 40,
        check: { kind: "score", score: 400 },
      },
    ],
  },
  ilon: {
    id: "ilon",
    after: "robot",
    title: { uz: "Ilon", en: "Snake" },
    tagline: {
      uz: "Ilonni boshqaring, olma yeng va o‘sing — lekin o‘zingizga urilmang!",
      en: "Steer the snake, eat apples and grow — but don't bite yourself!",
    },
    schema: {
      tezlik: {
        kind: "number",
        default: 5,
        min: 1,
        max: 15,
        label: { uz: "Ilon tezligi", en: "Snake speed" },
      },
      uzunlik: {
        kind: "number",
        default: 3,
        min: 1,
        max: 20,
        label: { uz: "Boshlang‘ich uzunlik", en: "Starting length" },
      },
      ilon_rangi: {
        kind: "color",
        default: "yashil",
        label: { uz: "Ilon rangi", en: "Snake colour" },
      },
      olma_ochkosi: {
        kind: "number",
        default: 10,
        min: 1,
        max: 100,
        label: { uz: "Bir olma necha ochko", en: "Points per apple" },
      },
      olmalar_soni: {
        kind: "number",
        default: 1,
        min: 1,
        max: 5,
        label: { uz: "Bir vaqtda nechta olma", en: "Apples at once" },
      },
      devordan_otish: {
        kind: "bool",
        default: false,
        label: {
          uz: "Devordan o‘tib, narigi tomondan chiqish",
          en: "Go through walls and come out the other side",
        },
      },
      hayotlar: {
        kind: "number",
        default: 1,
        min: 1,
        max: 99,
        label: { uz: "Hayotlar soni", en: "Lives" },
      },
    },
    watch: ["ochko", "hayotlar", "vaqt"],
    starter: `// Ilon sozlamalari.
// Sonni o'zgartiring va "Ishga tushirish"ni bosing!
tezlik = 5
uzunlik = 3
ilon_rangi = "yashil"
olma_ochkosi = 10
olmalar_soni = 1
devordan_otish = yo'q
hayotlar = 1
`,
    cheats: [
      {
        name: "oltin_olma",
        effect: {
          uz: "Olmalar oltinga aylanadi: 5 baravar ochko",
          en: "Apples turn gold: 5× points",
        },
        seconds: 8,
      },
      {
        name: "sekin",
        effect: { uz: "Ilon sekinlashadi", en: "The snake slows down" },
        seconds: 6,
      },
      {
        name: "arvoh",
        effect: {
          uz: "Ilon o‘zidan va devordan o‘tib ketadi",
          en: "The snake passes through itself and walls",
        },
        seconds: 8,
      },
      {
        name: "qisqartir",
        effect: { uz: "Ilon ikki baravar qisqaradi", en: "The snake halves" },
        seconds: 0,
      },
    ],
    events: {
      boshlanganda: { uz: "O‘yin boshlanganda", en: "When the game starts" },
      olma_yeganda: {
        uz: "Ilon olma yeganda",
        en: "When the snake eats an apple",
      },
      urilsa: { uz: "Ilon urilganda", en: "When the snake crashes" },
    },
    files: {
      "readme.txt": {
        uz: "Ilon o‘yini, 1.0 versiya.",
        en: "Snake game, version 1.0.",
      },
      "sir.txt": {
        uz: "Parolni shifrladim: har bir harfni alifboda bitta oldinga surdim. zbtijm",
        en: "I encrypted the password: every letter moved one step forward in the alphabet. zbtijm",
      },
    },
    password: "yashil",
    missions: [
      {
        id: "tez",
        title: { uz: "Chaqqon ilon", en: "Quick snake" },
        task: {
          uz: "Ilonni tezlashtiring: tezlik kamida 9.",
          en: "Speed the snake up: speed at least 9.",
        },
        hint: { uz: "tezlik = 9", en: "tezlik = 9" },
        xp: 20,
        check: { kind: "code", test: (p) => Number(p.values.tezlik) >= 9 },
      },
      {
        id: "uzun",
        title: { uz: "Uzun ilon", en: "Long snake" },
        task: {
          uz: "Ilon boshidanoq uzun bo‘lsin: uzunlik kamida 10.",
          en: "Start with a long snake: length at least 10.",
        },
        hint: { uz: "uzunlik = 12", en: "uzunlik = 12" },
        xp: 20,
        check: { kind: "code", test: (p) => Number(p.values.uzunlik) >= 10 },
      },
      {
        id: "rang",
        title: { uz: "Rangli ilon", en: "Colourful snake" },
        task: {
          uz: "Ilon rangini o‘zgartiring.",
          en: "Change the snake's colour.",
        },
        hint: {
          uz: `Masalan: ilon_rangi = "binafsha"`,
          en: `For example: ilon_rangi = "binafsha"`,
        },
        xp: 20,
        check: { kind: "code", test: changedColor("ilon_rangi", "yashil") },
      },
      {
        id: "devor",
        title: { uz: "Sehrli devorlar", en: "Magic walls" },
        task: {
          uz: "Ilon devordan o‘tib, narigi tomondan chiqsin.",
          en: "Let the snake go through a wall and come out the other side.",
        },
        hint: { uz: "devordan_otish = ha", en: "devordan_otish = ha" },
        xp: 20,
        check: {
          kind: "code",
          test: (p) => p.values.devordan_otish === true,
        },
      },
      {
        id: "bog",
        title: { uz: "Olma bog‘i", en: "Apple orchard" },
        task: {
          uz: "Maydonda bir vaqtda kamida 3 ta olma bo‘lsin.",
          en: "Have at least 3 apples on the field at once.",
        },
        hint: { uz: "olmalar_soni = 3", en: "olmalar_soni = 3" },
        xp: 20,
        check: {
          kind: "code",
          test: (p) => Number(p.values.olmalar_soni) >= 3,
        },
      },
      {
        id: "arvoh",
        title: { uz: "Arvoh ilon", en: "Ghost snake" },
        task: {
          uz: "O‘yin paytida terminal orqali ilonni arvohga aylantiring.",
          en: "While playing, turn the snake into a ghost from the terminal.",
        },
        hint: {
          uz: "Terminalga arvoh() deb yozing. Barcha buyruqlar: yordam()",
          en: "Type arvoh() in the terminal. All commands: yordam()",
        },
        xp: 25,
        check: { kind: "cheat", cheat: "arvoh" },
      },
      {
        id: "ochko",
        title: { uz: "150 ochko", en: "150 points" },
        task: {
          uz: "Bitta o‘yinda 150 ochko to‘plang.",
          en: "Score 150 points in one game.",
        },
        hint: {
          uz: "olma_ochkosi ni oshiring yoki oltin_olma() ni sinab ko‘ring.",
          en: "Raise olma_ochkosi or try oltin_olma().",
        },
        xp: 25,
        check: { kind: "score", score: 150 },
      },
      {
        id: "agar",
        stage: 2,
        title: { uz: "Oltin ilon", en: "Golden snake" },
        task: {
          uz: "Qoida yozing: ochko 50 dan oshsa, ilon oltin rangga kirsin.",
          en: "Write a rule: when the score is over 50, the snake turns gold.",
        },
        hint: {
          uz: `Yangi qator: agar ochko > 50 bo'lsa ilon_rangi = "oltin"`,
          en: `New line: agar ochko > 50 bo'lsa ilon_rangi = "oltin"`,
        },
        xp: 30,
        check: {
          kind: "code",
          test: ruleOn("ochko", "ilon_rangi"),
        },
      },
      {
        id: "signal",
        stage: 2,
        title: { uz: "Turbo rejim", en: "Turbo mode" },
        task: {
          uz: "Blok yozing: ochko 100 dan oshsa, ilon oltin bo‘lsin va tezlashsin. Blokda ikkita sozlama bo‘lsin.",
          en: "Write a block: when the score is over 100, the snake turns gold and speeds up. Put two settings in the block.",
        },
        hint: {
          uz: `agar ochko > 100 bo'lsa:\n    ilon_rangi = "oltin"\n    tezlik = 9`,
          en: `agar ochko > 100 bo'lsa:\n    ilon_rangi = "oltin"\n    tezlik = 9`,
        },
        xp: 30,
        check: { kind: "code", test: blockOn("ochko") },
      },
      {
        id: "aks",
        stage: 2,
        title: { uz: "Aks holda", en: "Otherwise" },
        task: {
          uz: "Dastlabki 20 soniyada ilon sekin, keyin tez yursin. “aks_holda:” blokidan foydalaning.",
          en: "Make the snake slow for the first 20 seconds and fast after. Use an “aks_holda:” (otherwise) block.",
        },
        hint: {
          uz: `agar vaqt < 20 bo'lsa:\n    tezlik = 4\naks_holda:\n    tezlik = 8`,
          en: `agar vaqt < 20 bo'lsa:\n    tezlik = 4\naks_holda:\n    tezlik = 8`,
        },
        xp: 30,
        check: { kind: "code", test: hasElse },
      },
      {
        id: "va",
        stage: 2,
        title: { uz: "Ikki shart", en: "Two conditions" },
        task: {
          uz: "Ikki shartli qoida yozing: ochko 50 dan ko‘p va vaqt 60 dan kam bo‘lsa, olma 20 ochko bersin.",
          en: "Write a rule with two conditions: when the score is over 50 and the time is under 60, an apple gives 20 points.",
        },
        hint: {
          uz: `agar ochko > 50 va vaqt < 60 bo'lsa olma_ochkosi = 20`,
          en: `agar ochko > 50 va vaqt < 60 bo'lsa olma_ochkosi = 20`,
        },
        xp: 30,
        check: { kind: "code", test: hasAnd },
      },
      {
        id: "parol",
        stage: 3,
        title: { uz: "Maxfiy parol", en: "Secret password" },
        task: {
          uz: 'Dasturchi parolni fayllardan birida qoldirib ketgan. Terminalda fayllar() deb yozing, fayllarni o‘qing va kirish("parol") bilan dasturchi rejimini oching.',
          en: 'The developer left the password in one of the files. Type fayllar() in the terminal, read the files and open developer mode with kirish("password").',
        },
        hint: {
          uz: `sir.txt dagi har bir harfni alifboda bitta orqaga qaytaring: z → y, b → a …`,
          en: `Move every letter in sir.txt one step back in the alphabet: z → y, b → a …`,
        },
        xp: 30,
        check: { kind: "login" },
      },
      {
        id: "klassik",
        stage: 3,
        title: { uz: "Klassik ilon", en: "Classic snake" },
        task: {
          uz: "Haqiqiy “Ilon” o‘yinidagidek: har bir olmadan keyin ilon tezlashsin.",
          en: "Like the real Snake game: the snake speeds up after every apple.",
        },
        hint: {
          uz: `qachon olma_yeganda:\n    tezlik += 1`,
          en: `qachon olma_yeganda:\n    tezlik += 1`,
        },
        xp: 35,
        check: {
          kind: "code",
          test: handles(
            "olma_yeganda",
            (a) => a.kind === "add" && a.name === "tezlik" && a.amount > 0,
          ),
        },
      },
      {
        id: "urilsa",
        stage: 3,
        title: { uz: "Ogohlantirish", en: "Warning" },
        task: {
          uz: "Ilon urilganda ekranda xabar chiqsin.",
          en: "Show a message on screen when the snake crashes.",
        },
        hint: {
          uz: `qachon urilsa:\n    xabar("Voy!")`,
          en: `qachon urilsa:\n    xabar("Voy!")`,
        },
        xp: 35,
        check: { kind: "code", test: handles("urilsa", says) },
      },
      {
        id: "usta",
        stage: 3,
        title: { uz: "Ilon ustasi", en: "Snake master" },
        task: {
          uz: "Bitta o‘yinda 400 ochko to‘plang.",
          en: "Score 400 points in one game.",
        },
        hint: {
          uz: `Hodisalar va qoidalarni birga ishlating.`,
          en: `Use events and rules together.`,
        },
        xp: 40,
        check: { kind: "score", score: 400 },
      },
    ],
  },
};

export const GAME_IDS = Object.keys(GAMES) as GameId[];
export const isGameId = (id: unknown): id is GameId =>
  typeof id === "string" && id in GAMES;

/**
 * Reads code for a game, with that game's schema and watchable values;
 * "qachon" handlers only in developer mode.
 */
export const compile = (game: Game, code: string, dev = false) =>
  parse(
    code,
    game.schema,
    game.watch,
    dev ? { events: Object.keys(game.events) } : {},
  );

/** Every mission's key as stored in progress: "kosmos:turbo". */
export const missionKey = (game: GameId, mission: string) =>
  `${game}:${mission}`;

/**
 * Whether a child may play a game: the first game always; the next once the
 * settings stage of the game before is finished, or once they have already
 * finished something in it.
 */
export function gameOpen(game: Game, done: Set<string>) {
  if (!game.after) return true;
  if (game.missions.some((m) => done.has(missionKey(game.id, m.id))))
    return true;
  return stageOpen(GAMES[game.after], 2, done);
}

export const ALL_MISSIONS = GAME_IDS.flatMap((id) =>
  GAMES[id].missions.map((m) => ({ game: id, mission: m })),
);
export const MAX_XP = ALL_MISSIONS.reduce((sum, m) => sum + m.mission.xp, 0);
