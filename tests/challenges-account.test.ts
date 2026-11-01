import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emailSchema,
  hashToken,
  newInviteCode,
  normalizeInviteCode,
  teamNameKey,
  teamNameSchema,
  isChallengesNext,
  isLinkToken,
  newLinkToken,
  passwordProblem,
  usernameKey,
  usernameSchema,
} from "../src/lib/challenges/account";
import { buildMail } from "../src/lib/challenges/emails";

test("emails are trimmed and lower-cased; bad ones are refused", () => {
  assert.equal(emailSchema.parse("  Ali@Example.UZ "), "ali@example.uz");
  for (const bad of ["", "ali", "ali@", "@x.uz", "a b@x.uz"])
    assert.equal(emailSchema.safeParse(bad).success, false, bad);
});

test("usernames are Latin, 3–24 characters, unique regardless of case", () => {
  for (const good of ["ali", "Ali_99", "x.y-z", "a".repeat(24)])
    assert.equal(usernameSchema.safeParse(good).success, true, good);
  for (const bad of ["ab", "_ali", ".ali", "a".repeat(25), "Аli", "a b", "a@b"])
    assert.equal(usernameSchema.safeParse(bad).success, false, bad);
  assert.equal(usernameKey(" Ali_99 "), "ali_99");
});

test("passwords: length, no username or email, no common patterns", () => {
  const ok = (p: string) => passwordProblem(p, "ali@example.uz", "hacker");
  assert.equal(ok("short"), "length");
  assert.equal(ok("x".repeat(201)), "length");
  assert.equal(ok("my-hacker-pass-7"), "personal");
  assert.equal(ok("ali-is-here-2026"), "personal");
  assert.equal(ok("qwerty1234"), "common");
  assert.equal(ok("Password2024"), "common");
  assert.equal(ok("aaaaaaaaaaaa"), "common");
  assert.equal(ok("ababababab"), "common");
  assert.equal(ok("tog-ustida-uch-qarga"), null);
});

test("link tokens are 32 random bytes and only their digest is stored", () => {
  const token = newLinkToken();
  assert.equal(isLinkToken(token), true);
  assert.notEqual(newLinkToken(), token);
  assert.match(hashToken(token), /^[0-9a-f]{64}$/);
  assert.notEqual(hashToken(token), token);
  for (const bad of [
    undefined,
    "",
    "abc",
    `${token}x`,
    token.replace(/./, "!"),
  ])
    assert.equal(isLinkToken(bad), false);
});

test("sign-in redirects stay inside the CTF area", () => {
  for (const good of [
    "/challenges",
    "/challenges/account",
    "/challenges/x?y=1",
  ])
    assert.equal(isChallengesNext(good), true, good);
  for (const bad of [
    "https://evil.uz",
    "//evil.uz",
    "/challenges//evil.uz",
    "/admin",
    "/challengesx",
    "/challenges/../admin",
    undefined,
  ])
    assert.equal(isChallengesNext(bad), false, String(bad));
});

test("emails are written in the player's language and escape the name", () => {
  const link = "https://cybervalue.uz/challenges/verify?token=abc";
  const uz = buildMail("verify", "uz", "a@b.uz", "<b>ali</b>", link);
  assert.match(uz.subject, /tasdiqlang/);
  assert.match(uz.text, /Salom, <b>ali<\/b>!/);
  assert.ok(uz.text.includes(link));
  assert.ok(!uz.html.includes("<b>ali</b>"));
  assert.ok(uz.html.includes("&#60;b&#62;ali"));
  const en = buildMail("reset", "en", "a@b.uz", "ali", link);
  assert.match(en.subject, /reset your password/);
});

test("team names are Latin, 2–32 characters, unique regardless of case and spacing", () => {
  assert.equal(teamNameSchema.parse("  Red   Team  "), "Red Team");
  for (const bad of [
    "a",
    " ",
    "_team",
    "Команда",
    "a".repeat(33),
    "team<script>",
  ])
    assert.equal(teamNameSchema.safeParse(bad).success, false, bad);
  assert.equal(teamNameKey(" Red   TEAM "), "red team");
});

test("invite codes are 10 base32 symbols and forgive case, spaces and look-alikes", () => {
  const code = newInviteCode();
  assert.match(code, /^[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/);
  assert.equal(normalizeInviteCode(code.toLowerCase().replace("-", " ")), code);
  assert.equal(normalizeInviteCode("abcde fghjk"), "ABCDE-FGHJK");
  assert.equal(normalizeInviteCode("OOOOO-IIIII"), "00000-11111");
  for (const bad of ["", "ABCD", "ABCDE-FGHJKX", "ABCDE-FGHJU"])
    assert.equal(normalizeInviteCode(bad), null, bad);
});
