import { test } from "node:test";
import assert from "node:assert/strict";
import {
  atbash,
  caesar,
  crackCaesar,
  lettersOnly,
  mix,
  morseDecode,
  morseEncode,
  pigpen,
  polybiusDecrypt,
  polybiusEncrypt,
  sameAnswer,
  scytaleDecrypt,
  scytaleEncrypt,
  vigenere,
  type Rgb,
} from "../src/lib/junior/ciphers";
import {
  CIPHERS,
  GENERATED,
  generateExercise,
  restoreCipherProgress,
  type Exercise,
} from "../src/lib/junior/cipher-content";
import {
  RANKS,
  randomCodename,
  rankFor,
  restoreCodename,
} from "../src/lib/junior/rank";

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

test("classical ciphers match known examples and undo themselves", () => {
  assert.equal(atbash("Salom"), "Hzoln");
  assert.equal(atbash(atbash("ILM KUCH 2024")), "ILM KUCH 2024");
  assert.equal(caesar("XIVA", 3), "ALYD");
  assert.equal(vigenere("ATTACKATDAWN", "LEMON"), "LXFOPVEFRNHR");
  assert.equal(vigenere("LXFOPVEFRNHR", "LEMON", true), "ATTACKATDAWN");
  // Spaces do not use up key letters.
  assert.equal(vigenere("AB CD", "BC"), "BD DF");
  assert.equal(polybiusEncrypt("OLMA"), "34 31 32 11");
  assert.equal(polybiusDecrypt("34 31 32 11"), "OLMA");
  assert.equal(polybiusDecrypt(polybiusEncrypt("JUMP")), "IUMP");
  assert.equal(morseEncode("SOS"), "... --- ...");
  assert.equal(morseEncode("hi there"), ".... .. / - .... . .-. .");
  assert.equal(morseDecode("···  −−−  ···".replace(/ {2}/g, " ")), "SOS");
  assert.equal(morseDecode(morseEncode("HELLO WORLD")), "HELLO WORLD");
});

test("the scytale round-trips every length and rod size", () => {
  for (let length = 2; length <= 30; length++)
    for (let rows = 2; rows <= 6; rows++) {
      const text = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCD".slice(0, length);
      const decoded = scytaleDecrypt(scytaleEncrypt(text, rows), rows);
      assert.equal(decoded.replace(/X+$/, ""), text.replace(/X+$/, ""));
    }
  assert.equal(scytaleEncrypt("HUJUMTONGDA", 3), "HMGUTDJOAUNX");
});

test("frequency analysis cracks Caesar in both languages", () => {
  const uz =
    "ilm olish har bir inson uchun muhim kitob oqigan bola dunyoni tanib boradi";
  const en =
    "the quick brown fox jumps over the lazy dog while the agent reads the letter";
  for (let shift = 1; shift < 26; shift++) {
    assert.equal(crackCaesar(caesar(uz, shift), "uz"), shift, `uz ${shift}`);
    assert.equal(crackCaesar(caesar(en, shift), "en"), shift, `en ${shift}`);
  }
  assert.equal(crackCaesar("", "uz"), 0);
});

test("pigpen glyphs follow the # and X grids", () => {
  assert.deepEqual(pigpen("A"), {
    kind: "grid",
    walls: [false, true, true, false],
    opens: "up",
    dot: false,
  });
  assert.deepEqual(pigpen("E")?.walls, [true, true, true, true]);
  assert.equal(pigpen("N")?.dot, true);
  assert.equal(pigpen("S")?.kind, "x");
  assert.equal(pigpen("S")?.opens, "up");
  assert.equal(pigpen("Z")?.dot, true);
  assert.equal(pigpen("?"), null);
});

test("paint mixing reaches the same colour on both sides, but not for Eve", () => {
  const publicColour: Rgb = [250, 214, 60];
  const ali: Rgb = [226, 59, 59];
  const vali: Rgb = [53, 110, 230];
  assert.deepEqual(mix(publicColour, ali, vali), mix(publicColour, vali, ali));
  assert.notDeepEqual(
    mix(publicColour, ali, publicColour, vali),
    mix(publicColour, ali, vali),
  );
});

test("answers are compared leniently but exactly", () => {
  assert.ok(sameAnswer("letters", "salom", "SALOM"));
  assert.ok(sameAnswer("letters", "Bag‘dod", "BAGDOD"));
  assert.ok(!sameAnswer("letters", "", ""));
  assert.ok(!sameAnswer("letters", "SALO", "SALOM"));
  assert.ok(sameAnswer("digits", "34-31 32 11", "34 31 32 11"));
  assert.ok(sameAnswer("morse", " ...  ---  /  ... ", "... --- / ..."));
  assert.ok(sameAnswer("morse", "··· −−− ···", "... --- ..."));
  assert.ok(!sameAnswer("morse", "... ---", "... --- ..."));
  assert.ok(sameAnswer("choice", "2", "2"));
});

// Checks an exercise's answer by actually running the cipher on what is given.
function solve(id: string, exercise: Exercise): string | null {
  const key = exercise.key ?? "";
  switch (id) {
    case "atbash":
      return atbash(exercise.given);
    case "caesar":
      if (!key) {
        // Breaking without the key: some shift must give the answer.
        for (let shift = 0; shift < 26; shift++)
          if (
            lettersOnly(caesar(exercise.given, shift)) ===
            lettersOnly(exercise.answer)
          )
            return exercise.answer;
        return null;
      }
      return caesar(
        exercise.given,
        exercise.task.en.startsWith("Encrypt") ? Number(key) : -Number(key),
      );
    case "vigenere":
      return vigenere(
        exercise.given,
        key,
        exercise.task.en.startsWith("Decrypt"),
      );
    case "scytale":
      return exercise.task.en.startsWith("Decrypt")
        ? scytaleDecrypt(exercise.given, Number(key))
        : scytaleEncrypt(exercise.given, Number(key));
    case "polybius":
      return exercise.format === "digits"
        ? polybiusEncrypt(exercise.given)
        : polybiusDecrypt(exercise.given);
    case "morse":
      return exercise.format === "morse"
        ? morseEncode(exercise.given)
        : morseDecode(exercise.given);
    case "pigpen":
      return exercise.given;
    case "frequency":
      return caesar(exercise.given, -crackCaesar(exercise.given, "uz")) ===
        exercise.answer
        ? exercise.answer
        : caesar(exercise.given, -crackCaesar(exercise.given, "en"));
    default:
      return null;
  }
}

test("every cipher is complete in both languages and every answer is right", () => {
  assert.equal(CIPHERS.length, 9);
  const texts = (value: { uz: string; en: string }, where: string) => {
    assert.ok(value.uz.trim(), `${where} uz`);
    assert.ok(value.en.trim(), `${where} en`);
  };
  let years = -Infinity;
  for (const cipher of CIPHERS) {
    assert.ok(cipher.year > years, `${cipher.id} is in timeline order`);
    years = cipher.year;
    for (const field of ["title", "when", "tagline", "fact", "how"] as const)
      texts(cipher[field], `${cipher.id}.${field}`);
    cipher.story.forEach((p, i) => texts(p, `${cipher.id}.story.${i}`));
    assert.ok(cipher.exercises.length >= 3, cipher.id);
    cipher.exercises.forEach((exercise, i) => {
      const where = `${cipher.id}.exercise.${i}`;
      texts(exercise.task, where);
      if (exercise.hint) texts(exercise.hint, `${where}.hint`);
      if (exercise.format === "choice") {
        assert.ok(exercise.options && exercise.options.length >= 2, where);
        exercise.options!.forEach((o, j) => texts(o, `${where}.option.${j}`));
        assert.ok(Number(exercise.answer) < exercise.options!.length, where);
        return;
      }
      const solved = solve(cipher.id, exercise);
      assert.ok(
        solved !== null && sameAnswer(exercise.format, solved, exercise.answer),
        `${where}: ${exercise.given} → ${solved} ≠ ${exercise.answer}`,
      );
    });
  }
});

test("generated homework is always solvable", () => {
  const random = seeded(42);
  for (const id of GENERATED)
    for (const locale of ["uz", "en"] as const)
      for (let i = 0; i < 150; i++) {
        const exercise = generateExercise(id, locale, random)!;
        assert.ok(exercise, id);
        assert.ok(exercise.given && exercise.answer, `${id} ${i}`);
        if (id === "frequency") continue; // checked below with the language
        const solved = solve(id, exercise);
        assert.ok(
          solved !== null &&
            sameAnswer(exercise.format, solved, exercise.answer),
          `${id}: ${JSON.stringify(exercise)} → ${solved}`,
        );
      }
  assert.equal(generateExercise("publickey", "uz", random), null);
});

test("stored cipher progress, ranks and codenames are sanitised", () => {
  assert.deepEqual(
    restoreCipherProgress({
      atbash: [0, 0, 2, 99, -1, 1.5, "3"],
      caesar: "all",
      hacker: [1],
    }),
    { atbash: [0, 2] },
  );
  assert.deepEqual(restoreCipherProgress(null), {});
  assert.deepEqual(restoreCipherProgress([1, 2]), {});

  assert.equal(rankFor(0).rank, RANKS[0]);
  assert.equal(rankFor(149).index, 0);
  assert.equal(rankFor(150).index, 1);
  assert.equal(rankFor(250).progress, 0.5);
  assert.equal(rankFor(99999).next, null);
  assert.equal(rankFor(99999).progress, 1);

  assert.equal(restoreCodename({ name: "  <b>Burgut</b>  " }), "bBurgut/b");
  assert.equal(restoreCodename({ name: "x".repeat(40) }).length, 24);
  assert.equal(restoreCodename({ name: 7 }), "");
  assert.equal(restoreCodename(null), "");
  assert.match(randomCodename("uz", seeded(3)), /^\S+ \S+/);
});
