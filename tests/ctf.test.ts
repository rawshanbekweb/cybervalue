import test from "node:test";
import assert from "node:assert/strict";
import { CHALLENGES, CHALLENGE_IDS, inspectPath } from "../src/lib/ctf/catalog";
import { gradeFlag } from "../src/lib/ctf/grading";
import {
  ctfScore,
  decodeSignal,
  restoreProgress,
  vaultUnlocked,
} from "../src/lib/ctf/progress";

test("every flag can be recovered from its evidence and the collected finale keys", () => {
  const source = CHALLENGES[0].files[0].content.match(
    /recovery-marker: (CV\{[^}]+\})/,
  )![1];
  const signal = decodeSignal(
    decodeSignal(
      CHALLENGES[1].files[0].content.split("PAYLOAD\n")[1].split("\n")[0],
      "base64",
    ),
    "rot13",
  );
  const directory = inspectPath("/robots.txt").body.match(/Disallow: (.+)/)![1];
  const file = inspectPath(directory).body.match(/Recovery document: (.+)/)![1];
  const archive = inspectPath(directory + file).body.match(/CV\{[^}]+\}/)![0];
  const trace = CHALLENGES[3].files[0].content
    .split("\n")
    .filter((line) => line.includes("trace=rx-17 "))
    .sort(
      (a, b) =>
        Number(a.match(/seq=(\d+)/)![1]) - Number(b.match(/seq=(\d+)/)![1]),
    )
    .map((line) => line.split("data=")[1])
    .join("");
  const recovered = [source, signal, archive, trace];
  const proofs: Record<string, string> = {};
  let keys = "";
  recovered.forEach((flag, index) => {
    const result = gradeFlag({ id: CHALLENGE_IDS[index], flag });
    assert.equal(result.body.ok, true, CHALLENGE_IDS[index]);
    proofs[CHALLENGE_IDS[index]] = result.body.proof!;
    keys += result.body.fragment;
  });
  assert.equal(keys, "NOVA");
  const final = gradeFlag({ id: "vault", flag: `CV{${keys}_0017}`, proofs });
  assert.equal(final.body.ok, true);
  assert.match(final.body.message, /00:18/);
  assert.equal(
    gradeFlag({
      id: "vault",
      flag: `CV{${keys}_0017}`,
      proofs: { ...proofs, source: "a".repeat(64) },
    }).status,
    403,
  );
});

test("verification rejects bad shapes, unknown challenges, wrong case, and an early finale", () => {
  for (const value of [
    null,
    [],
    3,
    {},
    { id: "source", flag: 4 },
    { id: "constructor", flag: "CV{test}" },
    { id: "source", flag: "x".repeat(161) },
  ])
    assert.equal(gradeFlag(value).status, 400);
  assert.equal(
    gradeFlag({ id: "source", flag: "cv{comments_tell_stories}" }).status,
    400,
  );
  const wrong = gradeFlag({ id: "source", flag: "CV{COMMENTS_TELL_STORIES}" });
  assert.equal(wrong.body.ok, false);
  assert.equal(wrong.body.proof, undefined);
  assert.equal(wrong.body.fragment, undefined);
  assert.equal(
    gradeFlag({ id: "source", flag: " CV{comments_tell_stories}\n" }).body.ok,
    true,
  );
  assert.equal(gradeFlag({ id: "vault", flag: "CV{NOVA_0017}" }).status, 403);
});

test("progress is bounded, scores cannot duplicate, and incomplete receipts cannot unlock a finale", () => {
  for (const value of [null, [], "bad", 4, { source: null }])
    assert.equal(ctfScore(restoreProgress(value)), 0);
  const proof = gradeFlag({ id: "source", flag: "CV{comments_tell_stories}" })
    .body.proof!;
  const progress = restoreProgress({
    source: { proof, fragment: "N", hints: 2, notes: "x".repeat(4000) },
    signal: { proof: true, hints: -8 },
    vault: { proof, fragment: "N" },
  });
  assert.equal(ctfScore(progress), 80);
  assert.equal(progress.source.notes.length, 3000);
  assert.equal(progress.signal.hints, 0);
  assert.equal(progress.vault.proof, "");
  assert.equal(vaultUnlocked(progress), false);
  const restored = restoreProgress(progress);
  assert.equal(ctfScore(restored), 80);
  assert.equal(
    gradeFlag({ id: "source", flag: "CV{comments_tell_stories}" }).body.proof,
    proof,
  );
});

test("decoder handles pipelines, unicode, and invalid input; archive stays within its fixtures", () => {
  assert.equal(
    decodeSignal("CV{rotate_the_signal}", "rot13"),
    "PI{ebgngr_gur_fvtany}",
  );
  assert.equal(decodeSignal("43 56 7b 6f 6b 7d", "hex"), "CV{ok}");
  assert.equal(
    decodeSignal(Buffer.from("Salom, dunyo! ✓").toString("base64"), "base64"),
    "Salom, dunyo! ✓",
  );
  for (const value of ["!", "A", "abc===", "x".repeat(6001)])
    assert.throws(() => decodeSignal(value, "base64"));
  assert.throws(() => decodeSignal("123", "hex"));
  assert.throws(() => decodeSignal("ff", "hex"));
  assert.equal(inspectPath("https://example.com").status, 400);
  assert.equal(inspectPath("//example.com").status, 400);
  assert.equal(inspectPath("/../../.env").status, 404);
  assert.equal(inspectPath("/constructor").status, 404);
  assert.equal(inspectPath(" /robots.txt ").status, 200);
});
