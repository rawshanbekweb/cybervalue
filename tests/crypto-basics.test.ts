import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  bitsDiffer,
  bitsToOutlast,
  bytesOf,
  fromBase64,
  oneCharApart,
  sha256,
  toBase64,
  toySign,
  toyVerify,
  xorByte,
} from "../src/lib/crypto-basics/tools";
import {
  APOSTROPHE,
  COOKIE,
  COOKIE_VALUE,
  GOOD_MIRROR,
  KEYSPACE,
  LEAK,
  MIRRORS,
  RELEASE_HASH,
  SHARED_PAIR,
  SIGNED_MESSAGE,
  TARGET_HASH,
  WEAK_PASSWORD,
  WORDLIST,
  XOR_TASK,
} from "../src/lib/crypto-basics/data";

const node = (text: string) => createHash("sha256").update(text).digest("hex");

test("SHA-256 matches node:crypto, across block boundaries", () => {
  for (const text of [
    "",
    "abc",
    "o‘zbek",
    "a".repeat(55),
    "a".repeat(56),
    "a".repeat(64),
    "x".repeat(300),
  ])
    assert.equal(sha256(text), node(text), `length ${text.length}`);
});

test("Base64 round-trips UTF-8 and rejects junk", () => {
  for (const text of ["a", "ab", "abc", "admin=false", "o‘zbek tili"]) {
    assert.equal(toBase64(text), Buffer.from(text).toString("base64"));
    assert.equal(fromBase64(toBase64(text)), text);
  }
  for (const junk of ["", "abc", "!!!!", "@@@="])
    assert.equal(fromBase64(junk), null, junk);
});

test("every exercise has exactly the answer the lesson promises", () => {
  assert.equal(bytesOf(APOSTROPHE.char).length, APOSTROPHE.bytes);
  assert.equal(fromBase64(COOKIE_VALUE), COOKIE.plain);
  // Only the good mirror matches the published hash.
  assert.deepEqual(
    MIRRORS.filter((m) => sha256(m.content) === RELEASE_HASH).map((m) => m.id),
    [GOOD_MIRROR],
  );
  // Only the shared pair collides without salt, and nothing collides with it.
  const plain = LEAK.map((r) => r.plain);
  const pair = LEAK.filter(
    (r) => plain.indexOf(r.plain) !== plain.lastIndexOf(r.plain),
  ).map((r) => r.user);
  assert.deepEqual(pair, [...SHARED_PAIR]);
  assert.equal(new Set(LEAK.map((r) => r.salted)).size, LEAK.length);
  // The weak password is on the list, once.
  assert.equal(WORDLIST.filter((w) => sha256(w) === TARGET_HASH).length, 1);
  assert.ok(WORDLIST.includes(WEAK_PASSWORD));
  assert.equal(
    String.fromCharCode(xorByte(XOR_TASK.cipher, XOR_TASK.key)),
    XOR_TASK.plain,
  );
  assert.equal(bitsToOutlast(KEYSPACE.years, KEYSPACE.perSecond), 85);
});

test("one character changes about half the hash", () => {
  assert.ok(oneCharApart("salom", "Salom"));
  assert.ok(!oneCharApart("salom", "salom"));
  assert.ok(!oneCharApart("salom", "salomm"));
  const diff = bitsDiffer(sha256("salom"), sha256("Salom"));
  assert.ok(diff > 90 && diff < 166, String(diff));
  assert.equal(bitsDiffer(sha256("a"), sha256("a")), 0);
});

test("the toy signature verifies its message and rejects the tampered one", () => {
  const signature = toySign(SIGNED_MESSAGE);
  assert.ok(toyVerify(SIGNED_MESSAGE, signature));
  assert.ok(!toyVerify(SIGNED_MESSAGE.replace("100", "900"), signature));
});
