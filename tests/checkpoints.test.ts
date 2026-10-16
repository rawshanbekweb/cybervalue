import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CHECKPOINTS,
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";
import { CHECKPOINT_META } from "../src/lib/checkpoints/meta";
import {
  ATTEMPT_TTL_MS,
  issueAttempt,
  readAttempt,
} from "../src/lib/checkpoints/token";
import { parseIp, sameSubnet } from "../src/lib/network/ip";

test("every checkpoint has metadata and a builder", () => {
  assert.deepEqual(
    CHECKPOINTS.map((c) => c.id),
    CHECKPOINT_META.map((c) => c.id),
  );
  assert.equal(checkpointById("nope"), null);
});

test("generated questions are well formed, deterministic and gradable", () => {
  for (const checkpoint of CHECKPOINTS)
    for (let seed = 1; seed <= 400; seed++) {
      const questions = questionsFor(checkpoint, seed);
      assert.deepEqual(questionsFor(checkpoint, seed), questions);
      assert.ok(questions.length >= 10, checkpoint.id);
      for (const q of questions) {
        const label = `${checkpoint.id}#${seed}: ${q.ask.en}`;
        assert.ok(q.options.length >= 3, label);
        assert.equal(
          new Set(q.options.map((o) => o.en)).size,
          q.options.length,
          label,
        );
        assert.ok(q.answer >= 0 && q.answer < q.options.length, label);
        assert.ok(q.explain.uz && q.explain.en, label);
      }
      const all = grade(
        questions,
        questions.map((q) => q.answer),
      );
      assert.equal(all.percent, 100);
      assert.equal(grade(questions, "junk").score, 0);
    }
});

test("neighbour and gateway questions follow the subnet arithmetic", () => {
  const checkpoint = checkpointById("network-1")!;
  for (let seed = 1; seed <= 300; seed++)
    for (const q of questionsFor(checkpoint, seed)) {
      const pc = q.ask.en.match(/computer is ([\d.]+)\/(\d+)/);
      if (!pc) continue;
      const [ip, prefix] = [parseIp(pc[1])!, Number(pc[2])];
      q.options.forEach((option, i) => {
        const value = parseIp(option.en)!;
        const inside = sameSubnet(value, ip, prefix);
        const usable = (value & 255) !== 255 || prefix > 24;
        assert.equal(
          inside && usable,
          i === q.answer,
          `${q.ask.en} ${option.en}`,
        );
      });
    }
});

test("attempt tokens are signed, expire and bind the student", () => {
  const now = Date.now();
  const token = issueAttempt("s".repeat(32), {
    checkpoint: "network-1",
    seed: 42,
    student: "stu1",
    issued: now,
  });
  assert.deepEqual(readAttempt("s".repeat(32), token, now)?.seed, 42);
  assert.equal(readAttempt("t".repeat(32), token, now), null);
  assert.equal(
    readAttempt("s".repeat(32), token, now + ATTEMPT_TTL_MS + 1),
    null,
  );
  const [body, sig] = token.split(".");
  const forged = Buffer.from(
    JSON.stringify({
      checkpoint: "network-1",
      seed: 43,
      student: "stu1",
      issued: now,
    }),
  ).toString("base64url");
  assert.equal(readAttempt("s".repeat(32), `${forged}.${sig}`, now), null);
  assert.equal(readAttempt("s".repeat(32), `${body}`, now), null);
  assert.equal(readAttempt("s".repeat(32), 12, now), null);
});
