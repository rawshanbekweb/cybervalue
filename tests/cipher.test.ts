import { test } from "node:test";
import assert from "node:assert/strict";
import {
  atbash,
  CHESTS,
  cipherSolved,
  parseCipher,
  reverse,
  runCipher,
  shift,
  vigenere,
} from "../src/lib/kids/cipher";
import { GAMES } from "../src/lib/kids/games";

test("the ciphers undo each other", () => {
  assert.equal(shift("XAZINA", 3), "ADCLQD");
  assert.equal(shift(shift("XAZINA", 3), -3), "XAZINA");
  assert.equal(atbash(atbash("TOSH OSTIDA")), "TOSH OSTIDA");
  assert.equal(atbash("ABC"), "ZYX");
  assert.equal(reverse("SANDIQ"), "QIDNAS");
  const secret = vigenere("YULDUZ LAR", "KOD", 1);
  assert.equal(vigenere(secret, "KOD", -1), "YULDUZ LAR");
  // Spaces keep their place and do not use up the key.
  assert.equal(secret[6], " ");
});

test("every chest opens with the hint of its mission, and not without", () => {
  for (const mission of GAMES.shifr.missions) {
    assert.equal(mission.check.kind, "cipher");
    if (mission.check.kind !== "cipher") continue;
    const chest = CHESTS[mission.check.chest];
    assert.ok(cipherSolved(mission.hint.uz, chest), mission.id);
    assert.ok(!cipherSolved("", chest), mission.id);
    assert.notEqual(chest.cipher, chest.plain, mission.id);
  }
  // A chest that needs a command refuses a shortcut without it.
  assert.ok(!cipherSolved("sur(1)", CHESTS.c4));
});

test("the decoder shows each step and can try every shift", () => {
  const program = parseCipher("sinab_kor()\nsur(7)");
  assert.deepEqual(program.problems, []);
  const trace = runCipher(program.steps, CHESTS.c3.cipher);
  assert.equal(trace.tries.length, 25);
  assert.equal(trace.tries[6].text, CHESTS.c3.plain);
  assert.equal(trace.result, CHESTS.c3.plain);
  assert.deepEqual(
    trace.after.map((s) => s.line),
    [1, 2],
  );
});

test("mistakes get line numbers and suggestions", () => {
  const program = parseCipher(
    'sur(30)\nteskri()\nkalit(KOD)\natbash(2)\nkalit("kod") // ok',
  );
  const byLine = Object.fromEntries(
    program.problems.map((p) => [p.line, p.message.uz]),
  );
  assert.match(byLine[1], /1 dan 25/);
  assert.match(byLine[2], /Balki “teskari\(\)”/);
  assert.match(byLine[3], /qo‘shtirnoqda/);
  assert.match(byLine[4], /hech narsa/);
  assert.equal(byLine[5], undefined);
  assert.deepEqual(program.steps, [{ kind: "kalit", line: 5, key: "KOD" }]);
});
