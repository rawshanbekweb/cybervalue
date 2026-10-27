import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ATTACKS,
  attempts,
  b64url,
  check,
  checkerSafe,
  decode,
  FACTORS,
  getOrder,
  makeToken,
  ME,
  ORDERS,
  sign,
  stops,
  unb64url,
} from "../src/lib/access-control/tools";
import { LESSONS } from "../src/lib/access-control/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

const NOW = 1_800_000_000;

test("the orders API leaks without the owner check and hides with it", () => {
  assert.equal(getOrder(1041, null, true).status, 401);
  const own = getOrder(1041, ME, true);
  assert.equal(own.status, 200);
  assert.equal(own.leak, false);
  const leak = getOrder(1042, ME, false);
  assert.equal(leak.status, 200);
  assert.equal(leak.leak, true);
  // With the check, another person's order looks like a missing one.
  assert.deepEqual(getOrder(1042, ME, true), getOrder(9999, ME, true));
  assert.equal(getOrder(1042, ME, true).status, 404);
  for (const order of ORDERS)
    assert.equal(
      getOrder(order.id, ME, true).status,
      order.owner === ME ? 200 : 404,
    );
});

test("Base64URL round-trips Unicode and the token decodes", () => {
  for (const text of ['{"alg":"HS256","typ":"JWT"}', "o‘zbek ✓", ""])
    assert.equal(unb64url(b64url(text)), text);
  assert.equal(
    b64url('{"alg":"HS256","typ":"JWT"}'),
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  );
  const token = makeToken(
    { alg: "HS256", typ: "JWT" },
    { sub: "ali", role: "student", exp: 1800003600 },
  );
  // The token in lesson 4 is this one, up to its signature.
  const lesson4 = LESSONS[3].widget;
  assert.equal(lesson4.type, "anatomy");
  if (lesson4.type === "anatomy") {
    assert.equal(lesson4.lines[0][0].text, token.split(".")[0]);
    assert.equal(lesson4.lines[1][0].text, token.split(".")[1]);
  }
  assert.equal(decode(token)!.payload.role, "student");
  assert.equal(decode("a.b"), null);
  assert.equal(decode("x.y.z"), null);
});

test("the signature changes with the data and the secret", () => {
  assert.equal(sign("a.b"), sign("a.b"));
  assert.notEqual(sign("a.b"), sign("a.c"));
  assert.notEqual(sign("a.b"), sign("a.b", "other"));
});

test("only a server that verifies and fixes the algorithm refuses both forgeries", () => {
  const [real, edited, unsigned] = attempts("admin", NOW);
  assert.equal(decode(edited.token)!.payload.role, "admin");
  assert.equal(decode(unsigned.token)!.signature, "");
  const open = { verify: false, allowNone: true };
  assert.ok(check(edited.token, open, NOW).accepted);
  const trusting = { verify: true, allowNone: true };
  assert.ok(!check(edited.token, trusting, NOW).accepted);
  assert.ok(check(unsigned.token, trusting, NOW).accepted);
  const strict = { verify: true, allowNone: false };
  assert.ok(check(real.token, strict, NOW).accepted);
  assert.ok(checkerSafe(strict, NOW));
  assert.ok(!checkerSafe(open, NOW));
  assert.ok(!checkerSafe(trusting, NOW));
  assert.ok(!checkerSafe({ verify: false, allowNone: false }, NOW));
  // An expired token is refused whatever the setup.
  assert.ok(!check(real.token, strict, NOW + 7200).accepted);
});

test("only the security key stops every attack", () => {
  const full = FACTORS.filter((f) => ATTACKS.every((a) => stops(f, a)));
  assert.deepEqual(full, ["key"]);
  assert.ok(ATTACKS.every((a) => !stops("password", a)));
  assert.ok(!stops("sms", "simswap"));
  assert.ok(stops("totp", "simswap"));
  assert.ok(!stops("totp", "relay"));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.access.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("access-1");
  assert.ok(checkpoint);
  const questions = questionsFor(checkpoint, 7);
  assert.equal(questions.length, 10);
  assert.equal(
    grade(
      questions,
      questions.map((q) => q.answer),
    ).percent,
    100,
  );
});
