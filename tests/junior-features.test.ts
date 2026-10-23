import { test } from "node:test";
import assert from "node:assert/strict";
import {
  enigma,
  parsePositions,
  press,
  showPositions,
  step,
} from "../src/lib/junior/enigma";
import {
  dayIndex,
  puzzleFor,
  restoreDaily,
  streak,
} from "../src/lib/junior/daily";
import {
  atbash,
  caesar,
  morseDecode,
  polybiusDecrypt,
  sameAnswer,
  vigenere,
} from "../src/lib/junior/ciphers";
import {
  decodeSecret,
  decryptSecret,
  encodeSecret,
  encryptSecret,
  SECRET_CIPHERS,
} from "../src/lib/junior/secret";
import {
  BADGES,
  restoreEvents,
  type BadgeState,
} from "../src/lib/junior/badges";
import { EVIDENCE, SUSPECTS, restoreStory } from "../src/lib/junior/story";
import { CASE_MISSION_IDS, MISSION_IDS } from "../src/lib/junior/content";
import { CIPHERS } from "../src/lib/junior/cipher-content";
import {
  rankingName,
  restoreJuniorProgress,
  withPart,
  xpOf,
} from "../src/lib/junior/progress";
import { xpFor } from "../src/lib/junior/rank";

test("Enigma matches the historical machine", () => {
  // Enigma I, rotors I-II-III, reflector B, rings and start AAA.
  assert.equal(enigma("AAAAA", "AAA"), "BDZGO");
  // It undoes itself from the same start position.
  assert.equal(
    enigma(enigma("BLETCHLEY PARK", "QEV"), "QEV"),
    "BLETCHLEY PARK",
  );
  // A letter is never enciphered as itself.
  let positions = parsePositions("XYZ");
  for (let i = 0; i < 3000; i++) {
    const letter = String.fromCharCode(65 + (i % 26));
    const trace = press(letter, positions);
    assert.notEqual(trace.output, letter);
    assert.equal(trace.path.length, 7);
    positions = trace.positions;
  }
  // The middle rotor's double step: ADU → ADV → AEW → BFX.
  assert.equal(showPositions(step(parsePositions("ADU"))), "ADV");
  assert.equal(showPositions(step(parsePositions("ADV"))), "AEW");
  assert.equal(showPositions(step(parsePositions("AEW"))), "BFX");
});

test("every daily puzzle can be solved with its shown key", () => {
  const today = dayIndex(Date.UTC(2026, 9, 16, 12));
  for (let day = today; day < today + 120; day++)
    for (const locale of ["uz", "en"] as const) {
      const p = puzzleFor(day, locale);
      const solved = {
        caesar: () => caesar(p.given, -Number(p.key)),
        atbash: () => atbash(p.given),
        vigenere: () => vigenere(p.given, p.key!, true),
        morse: () => morseDecode(p.given),
        polybius: () => polybiusDecrypt(p.given),
        enigma: () => enigma(p.given, p.key!),
      }[p.kind]();
      assert.ok(
        sameAnswer(p.format, solved, p.answer),
        `${day} ${locale} ${p.kind}`,
      );
    }
  // The puzzle changes at midnight in Tashkent (UTC+5).
  assert.equal(
    dayIndex(Date.UTC(2026, 9, 16, 18, 59)),
    dayIndex(Date.UTC(2026, 9, 16, 1)),
  );
  assert.equal(
    dayIndex(Date.UTC(2026, 9, 16, 19, 0)),
    dayIndex(Date.UTC(2026, 9, 16, 1)) + 1,
  );
});

test("streaks count consecutive solved days", () => {
  assert.equal(streak([], 100), 0);
  assert.equal(streak([98, 99, 100], 100), 3);
  assert.equal(streak([98, 99], 100), 2); // today still open
  assert.equal(streak([97, 99, 100], 100), 2);
  assert.equal(streak([90], 100), 0);
  assert.deepEqual(restoreDaily({ days: [3, 3, 1, -2, 1.5, "4"] }), [1, 3]);
  assert.deepEqual(restoreDaily("x"), []);
});

test("secret links round-trip and reject anything malformed", () => {
  for (const cipher of SECRET_CIPHERS) {
    const key =
      { caesar: "7", vigenere: "SIR", enigma: "QEV" }[cipher as string] ?? "";
    const text = "Ertaga soat 9 da kutubxonada";
    const ciphertext = encryptSecret(cipher, text, key);
    const link = `#m=${encodeSecret({ c: cipher, t: ciphertext, k: key || undefined, h: "Sinf raqami" })}`;
    const payload = decodeSecret(link);
    assert.ok(payload, cipher);
    assert.ok(
      sameAnswer(
        "letters",
        decryptSecret(cipher, payload!.t, payload!.k ?? ""),
        text,
      ),
      cipher,
    );
  }
  assert.equal(decodeSecret(""), null);
  assert.equal(decodeSecret("#m=!!!"), null);
  assert.equal(
    decodeSecret(`#m=${encodeSecret({ c: "rot47" as never, t: "x" })}`),
    null,
  );
  assert.equal(
    decodeSecret(`#m=${encodeSecret({ c: "caesar", t: "x", k: "99" })}`),
    null,
  );
  assert.equal(
    decodeSecret(`#m=${encodeSecret({ c: "enigma", t: "x", k: "AB" })}`),
    null,
  );
  assert.equal(
    decodeSecret(`#m=${encodeSecret({ c: "atbash", t: "" })}`),
    null,
  );
  assert.equal(
    decodeSecret(
      `#m=${encodeSecret({ c: "atbash", t: "x", h: "y".repeat(81) })}`,
    ),
    null,
  );
  // Markup and control characters are stripped from what is shown.
  assert.equal(
    decodeSecret(`#m=${encodeSecret({ c: "atbash", t: "<b>HI</b>\u0007" })}`)
      ?.t,
    "bHI/b",
  );
});

test("the story has one culprit and evidence for every case mission", () => {
  assert.equal(SUSPECTS.filter((s) => s.culprit).length, 1);
  assert.ok(CASE_MISSION_IDS.every((id) => MISSION_IDS.includes(id)));
  for (const id of CASE_MISSION_IDS) {
    assert.ok(EVIDENCE[id].uz && EVIDENCE[id].en, id);
  }
  for (const suspect of SUSPECTS)
    assert.ok(
      suspect.verdict.uz && suspect.verdict.en && suspect.facts.length === 4,
    );
  assert.equal(restoreStory({ solved: true }), true);
  assert.equal(restoreStory({ solved: "yes" }), false);
});

test("badges are earned from progress and sanitised events", () => {
  assert.deepEqual(
    restoreEvents({ sos: true, secret: 1, visited: ["caesar", "x", "caesar"] }),
    {
      sos: true,
      visited: ["caesar"],
    },
  );
  assert.deepEqual(restoreEvents(null), {});
  const empty: BadgeState = {
    missions: 0,
    missionTotal: 8,
    done: {},
    phishing: false,
    ciphers: {},
    story: false,
    events: {},
    streak: 0,
    rank: 0,
  };
  assert.equal(BADGES.filter((b) => b.earned(empty)).length, 0);
  const full: BadgeState = {
    missions: 8,
    missionTotal: 8,
    done: Object.fromEntries(MISSION_IDS.map((id) => [id, true as const])),
    phishing: true,
    ciphers: Object.fromEntries(
      CIPHERS.map((c) => [c.id, c.exercises.map((_, i) => i)]),
    ),
    story: true,
    events: { sos: true, secret: true, visited: CIPHERS.map((c) => c.id) },
    streak: 3,
    rank: 5,
  };
  assert.equal(BADGES.filter((b) => b.earned(full)).length, BADGES.length);
  assert.equal(new Set(BADGES.map((b) => b.id)).size, BADGES.length);
});

test("stored Junior progress is validated part by part and the XP recomputed", () => {
  const now = Date.UTC(2026, 9, 20, 12);
  const today = dayIndex(now);
  const honest = restoreJuniorProgress(
    {
      missions: { password: true, phishing: true },
      ciphers: { caesar: [0, 1, 2] },
      story: false,
      daily: [today - 1, today],
      agent: { name: "Kulrang Burgut", rank: 1 },
    },
    now,
  );
  assert.equal(
    xpOf(honest),
    xpFor({ missions: 2, exercises: 3, daily: 2, story: false }),
  );
  assert.deepEqual(honest.agent, {
    name: "Kulrang Burgut",
    rank: 1,
    tour: false,
  });
  // Made-up missions, out-of-range exercises and future or ancient days do not count.
  const forged = restoreJuniorProgress(
    {
      missions: { password: true, hacked: true, phishing: "yes" },
      ciphers: { caesar: [0, 99, 100], fake: [1] },
      story: true,
      daily: [1, 2, 3, today + 1, today + 30],
      agent: { name: "<x>", rank: 999 },
      xp: 999999,
    },
    now,
  );
  assert.equal(
    xpOf(forged),
    xpFor({ missions: 1, exercises: 1, daily: 0, story: true }),
  );
  assert.deepEqual(forged.agent, { name: "x", rank: 10, tour: false });
  assert.equal(xpOf(restoreJuniorProgress("nonsense", now)), 0);
  // One part is replaced at a time; unknown parts are refused.
  const next = withPart(
    honest,
    "missions",
    { ...honest.missions, cipher: true },
    now,
  )!;
  assert.equal(Object.keys(next.missions).length, 3);
  assert.deepEqual(next.ciphers, honest.ciphers);
  assert.equal(withPart(honest, "xp", 5000, now), null);
  assert.equal(withPart(honest, "__proto__", {}, now), null);
  assert.equal(
    rankingName({ name: "Aziza Karimova", codename: "" }),
    "Aziza K.",
  );
  assert.equal(rankingName({ name: "Aziza", codename: "" }), "Aziza");
  assert.equal(
    rankingName({ name: "Aziza Karimova", codename: "Lochin" }),
    "Lochin",
  );
});

test("the case badge needs only the case missions, the defender badge stage 4", () => {
  const base: BadgeState = {
    missions: 6,
    missionTotal: 8,
    done: Object.fromEntries(CASE_MISSION_IDS.map((id) => [id, true as const])),
    phishing: true,
    ciphers: {},
    story: true,
    events: {},
    streak: 0,
    rank: 0,
  };
  const earned = (state: BadgeState) =>
    BADGES.filter((b) => b.earned(state)).map((b) => b.id);
  assert.ok(earned(base).includes("recruit"));
  assert.ok(!earned(base).includes("defender"));
  const all: BadgeState = {
    ...base,
    missions: 8,
    done: Object.fromEntries(MISSION_IDS.map((id) => [id, true as const])),
  };
  assert.ok(earned(all).includes("defender"));
});
