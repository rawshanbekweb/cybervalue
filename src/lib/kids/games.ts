// The two Academy Kids games: what their code can change, the secret
// terminal commands and the missions. Shared by the browser and the server,
// so a mission saved to an account is checked the same way it was shown.
import { COLORS, parse, type Program, type Schema, type Text } from "./lang";

export type GameId = "kosmos" | "robot";

export type Cheat = { name: string; effect: Text; seconds: number };

export type Check =
  | { kind: "code"; test: (program: Program) => boolean }
  | { kind: "cheat"; cheat: string }
  | { kind: "score"; score: number };

export type Mission = {
  id: string;
  title: Text;
  task: Text;
  hint: Text;
  xp: number;
  check: Check;
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
  missions: Mission[];
};

const changedColor = (name: string, from: string) => (p: Program) =>
  p.values[name] !== from;

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
          test: (p) =>
            p.rules.some((r) => r.watch === "ochko" && r.name === "kema_rangi"),
        },
      },
    ],
  },
  robot: {
    id: "robot",
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
          test: (p) =>
            p.rules.some(
              (r) => r.watch === "ochko" && r.name === "yugurish_tezligi",
            ),
        },
      },
    ],
  },
};

export const GAME_IDS = Object.keys(GAMES) as GameId[];
export const isGameId = (id: unknown): id is GameId =>
  typeof id === "string" && id in GAMES;

/** Reads code for a game, with that game's schema and watchable values. */
export const compile = (game: Game, code: string) =>
  parse(code, game.schema, game.watch);

/** Every mission's key as stored in progress: "kosmos:turbo". */
export const missionKey = (game: GameId, mission: string) =>
  `${game}:${mission}`;

export const ALL_MISSIONS = GAME_IDS.flatMap((id) =>
  GAMES[id].missions.map((m) => ({ game: id, mission: m })),
);
export const MAX_XP = ALL_MISSIONS.reduce((sum, m) => sum + m.mission.xp, 0);
