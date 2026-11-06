import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_FILE_BYTES,
  base64Size,
  importFlag,
  transferProblem,
  transferSchema,
} from "../src/lib/challenges/transfer";
import { flagMatches, storeFlag } from "../src/lib/challenges/scoring";

const file = (challenges: unknown[], event: Record<string, unknown> = {}) => ({
  version: 1,
  event: {
    slug: "kuz-2026",
    title: "Kuzgi CTF",
    startsAt: "2026-11-20T10:00",
    endsAt: "2026-11-20T18:00",
    ...event,
  },
  challenges,
});
const challenge = (key: string, extra: Record<string, unknown> = {}) => ({
  key,
  title: `Topshiriq ${key}`,
  category: "Crypto",
  flags: [{ flag: `CV{${key}}` }],
  ...extra,
});

test("a hand-written file fills in defaults and reads Tashkent times", () => {
  const parsed = transferSchema.parse(file([challenge("a")]));
  assert.equal(parsed.event.startsAt.toISOString(), "2026-11-20T05:00:00.000Z");
  assert.equal(parsed.event.maxTeamSize, 4);
  const [c] = parsed.challenges;
  assert.equal(c.initialPoints, 500);
  assert.equal(c.maxAttempts, 0);
  assert.equal(c.requires, null);
  assert.deepEqual(c.hints, []);
  assert.equal(transferProblem(parsed), null);
});

test("typed flags are hashed on import; exported digests are kept", () => {
  const parsed = transferSchema.parse(
    file([
      challenge("a", {
        flags: [
          { flag: "CV{salom}", caseSensitive: false },
          storeFlag("CV{x}", true),
        ],
      }),
    ]),
  );
  const stored = parsed.challenges[0].flags.map(importFlag);
  assert.equal(flagMatches(stored, "cv{SALOM}"), true);
  assert.equal(flagMatches(stored, "CV{x}"), true);
  assert.ok(stored.every((f) => !JSON.stringify(f).includes("salom")));
});

test("bad files are refused with a reason", () => {
  for (const bad of [
    file([challenge("a", { category: "Hacking" })]),
    file([challenge("a", { flags: [] })]),
    file([challenge("a", { flags: [{ salt: "zz", hash: "zz" }] })]),
    { ...file([]), version: 2 },
  ])
    assert.equal(transferSchema.safeParse(bad).success, false);
  const problem = (data: unknown) =>
    transferProblem(transferSchema.parse(data));
  assert.match(problem(file([], { endsAt: "2026-11-20T09:00" }))!, /end/);
  assert.match(problem(file([challenge("a"), challenge("a")]))!, /key/);
  assert.match(
    problem(file([challenge("a", { requires: "zz" })]))!,
    /not in the file/,
  );
  assert.match(
    problem(
      file([
        challenge("a", { requires: "b" }),
        challenge("b", { requires: "a" }),
      ]),
    )!,
    /loops/,
  );
  assert.match(
    problem(
      file([challenge("a", { initialPoints: 100, minimumPoints: 200 })]),
    )!,
    /minimum/,
  );
  assert.equal(
    problem(file([challenge("a"), challenge("b", { requires: "a" })])),
    null,
  );
});

test("a hand-written file may carry challenge files inline as Base64", () => {
  const data = transferSchema.parse(
    file([
      challenge("a", {
        files: [
          {
            name: "xat.txt",
            base64: Buffer.from("Q1Z7c2Fsb219").toString("base64"),
          },
          { name: "../../etc/x", base64: "YQ==" },
        ],
      }),
      challenge("b"),
    ]),
  );
  assert.equal(transferProblem(data), null);
  const [xat, odd] = data.challenges[0].files;
  assert.equal(base64Size(xat.base64), 12);
  assert.equal(Buffer.from(xat.base64, "base64").toString(), "Q1Z7c2Fsb219");
  assert.equal(odd.name, ".._.._etc_x");
  assert.equal(base64Size(odd.base64), 1);
  assert.deepEqual(data.challenges[1].files, []);

  assert.throws(() =>
    transferSchema.parse(
      file([challenge("a", { files: [{ name: "x", base64: "not base64!" }] })]),
    ),
  );
  const empty = transferSchema.parse(
    file([challenge("a", { files: [{ name: "x", base64: "" }] })]),
  );
  assert.match(transferProblem(empty)!, /empty/);
  const big = transferSchema.parse(
    file([
      challenge("a", {
        files: [
          {
            name: "x",
            base64: "A".repeat(Math.ceil(MAX_FILE_BYTES / 3) * 4 + 4),
          },
        ],
      }),
    ]),
  );
  assert.match(transferProblem(big)!, /over 4 MiB/);
});
