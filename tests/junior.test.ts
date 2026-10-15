import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CIPHER_ANSWER,
  CIPHER_PLAIN,
  CIPHER_TEXT,
  CTF_BASE64,
  CTF_FLAGS,
  CTF_PAGE_SOURCE,
  CTF_REVERSED,
  ETHICS,
  FOOTPRINT,
  MISSIONS,
  MISSION_IDS,
  PASSWORD_TRIES,
  PHISHING,
  PHISHING_PASS,
} from "../src/lib/junior/content";
import {
  STRONG_SECONDS,
  base64Decode,
  base64Encode,
  caesar,
  estimateStrength,
  humanize,
  restoreProgress,
} from "../src/lib/junior/logic";
import { createTranslator } from "../src/lib/i18n";

function texts(value: unknown): { uz: string; en: string }[] {
  if (Array.isArray(value)) return value.flatMap(texts);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.uz === "string" && typeof record.en === "string")
      return [record as { uz: string; en: string }];
    return Object.values(record).flatMap(texts);
  }
  return [];
}

test("every Junior text has distinct, non-empty Uzbek and English copy", () => {
  const all = texts([
    MISSIONS,
    PASSWORD_TRIES,
    PHISHING,
    FOOTPRINT,
    CTF_FLAGS,
    ETHICS,
  ]);
  assert.ok(all.length > 60);
  for (const { uz, en } of all) {
    assert.ok(uz.trim() && en.trim(), `empty text: ${uz} / ${en}`);
    // Short labels such as “SMS” are the same in both languages.
    if (uz.length > 8) assert.notEqual(uz, en);
  }
});

test("missions have unique ids and a contiguous order", () => {
  assert.equal(new Set(MISSION_IDS).size, MISSIONS.length);
  assert.deepEqual(
    MISSIONS.map((mission) => mission.number),
    MISSIONS.map((_, index) => index + 1),
  );
});

test("password estimate punishes common and short passwords and rewards length", () => {
  const common = estimateStrength("P@ssw0rd");
  assert.ok(common.issues.includes("common"));
  assert.ok(common.seconds < 1);
  assert.ok(estimateStrength("parol123").seconds < 1);
  assert.ok(estimateStrength("12345678").seconds < 1);
  assert.ok(estimateStrength("abc").issues.includes("short"));
  assert.ok(estimateStrength("aaaaaaaaaaaa").issues.includes("repeats"));
  const four = estimateStrength("olma bulut kok tosh");
  const five = estimateStrength("olma bulut kok tosh daryo");
  assert.ok(four.passphrase && five.passphrase);
  assert.ok(four.seconds < STRONG_SECONDS);
  assert.ok(five.seconds >= STRONG_SECONDS);
  assert.ok(estimateStrength("v7#Kp2!qZx9@Lm4").seconds >= STRONG_SECONDS);
  assert.equal(estimateStrength("").seconds, 0);
});

test("the suggested example passwords teach what their notes claim", () => {
  const [weak, swapped, words] = PASSWORD_TRIES.map((item) =>
    estimateStrength(item.value),
  );
  assert.ok(weak.seconds < 1 && swapped.seconds < 1);
  assert.ok(words.seconds > swapped.seconds);
});

test("humanize picks a readable unit", () => {
  assert.deepEqual(humanize(0.2), { unit: "instant", value: 0 });
  assert.deepEqual(humanize(90), { unit: "minutes", value: 1 });
  assert.deepEqual(humanize(86400 * 3), { unit: "days", value: 3 });
  assert.equal(humanize(86400 * 365 * 5000).unit, "millennia");
});

test("Caesar cipher round-trips and the mission message decodes", () => {
  assert.equal(caesar("Hello, World!", 3), "Khoor, Zruog!");
  assert.equal(caesar(caesar("Hello, World!", 3), -3), "Hello, World!");
  assert.equal(caesar("xyz", 3), "abc");
  assert.equal(caesar(CIPHER_TEXT, -7), CIPHER_PLAIN);
  assert.ok(CIPHER_PLAIN.toLowerCase().includes(CIPHER_ANSWER));
  assert.notEqual(CIPHER_TEXT, CIPHER_PLAIN);
});

test("Base64 helpers reject malformed or non-text input", () => {
  assert.equal(base64Decode(base64Encode("CV{x}")), "CV{x}");
  assert.equal(base64Decode("not base64!"), null);
  assert.equal(base64Decode(""), null);
  assert.equal(base64Decode("/+8="), null);
});

test("each CTF flag is recoverable from its challenge and only from it", () => {
  const [source, base64, reverse] = CTF_FLAGS;
  assert.ok(CTF_PAGE_SOURCE.includes(source.flag));
  assert.equal(base64Decode(CTF_BASE64), base64.flag);
  assert.equal([...CTF_REVERSED].reverse().join(""), reverse.flag);
  for (const flag of CTF_FLAGS) assert.match(flag.flag, /^CV\{[a-z0-9_]+\}$/);
  assert.equal(new Set(CTF_FLAGS.map((flag) => flag.flag)).size, 3);
  assert.ok(!CTF_BASE64.includes(base64.flag));
});

test("phishing, footprint and ethics answer keys are balanced and passable", () => {
  const phishing = PHISHING.filter((item) => item.phishing).length;
  assert.ok(phishing > 0 && phishing < PHISHING.length);
  assert.ok(PHISHING_PASS <= PHISHING.length);
  const risky = FOOTPRINT.filter((item) => item.risky).length;
  assert.ok(risky > 0 && risky < FOOTPRINT.length);
  const allowed = ETHICS.filter((item) => item.allowed).length;
  assert.ok(allowed > 0 && allowed < ETHICS.length);
});

test("progress from browser storage is validated", () => {
  assert.deepEqual(restoreProgress(null, MISSION_IDS), {});
  assert.deepEqual(restoreProgress([], MISSION_IDS), {});
  assert.deepEqual(restoreProgress("password", MISSION_IDS), {});
  assert.deepEqual(
    restoreProgress(
      {
        password: true,
        ctf: "yes",
        ethics: 1,
        hacker: true,
        __proto__: { cipher: true },
      },
      MISSION_IDS,
    ),
    { password: true },
  );
});

test("the Playground entry for Junior is translated", () => {
  const t = createTranslator("uz");
  for (const text of [
    "Start your first mission",
    "6 short missions",
    "No account needed",
    "A first step into cybersecurity for beginners: six short missions on passwords, phishing, ciphers, digital footprint, your first CTF and ethical hacking rules.",
  ])
    assert.notEqual(t(text), text);
});
