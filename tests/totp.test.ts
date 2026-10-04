import { test } from "node:test";
import assert from "node:assert/strict";
import {
  base32Decode,
  base32Encode,
  generateRecoveryCodes,
  hashRecoveryCode,
  openSecret,
  otpauthUri,
  sealSecret,
  timeStep,
  totpAt,
  verifyTotp,
} from "../src/lib/totp";

// RFC 6238 appendix B, SHA-1 seed "12345678901234567890".
const rfcSecret = base32Encode(Buffer.from("12345678901234567890"));

test("TOTP matches the RFC 6238 SHA-1 test vectors", () => {
  for (const [seconds, expected] of [
    [59, "94287082"],
    [1111111109, "07081804"],
    [1111111111, "14050471"],
    [1234567890, "89005924"],
    [2000000000, "69279037"],
    [20000000000, "65353130"],
  ] as const)
    assert.equal(totpAt(rfcSecret, Math.floor(seconds / 30), 8), expected);
});

test("base32 round-trips and tolerates spacing and lowercase", () => {
  const bytes = Buffer.from([0, 1, 2, 250, 255, 128, 64]);
  const encoded = base32Encode(bytes);
  assert.deepEqual(base32Decode(encoded), bytes);
  assert.deepEqual(
    base32Decode(encoded.toLowerCase().replace(/(.{4})/g, "$1 ")),
    bytes,
  );
  assert.throws(() => base32Decode("01!"));
});

test("verification allows one step of drift and rejects replays", () => {
  const now = 1_700_000_000_000;
  const step = timeStep(now);
  const code = totpAt(rfcSecret, step);
  assert.equal(verifyTotp(rfcSecret, code, null, now), step);
  assert.equal(
    verifyTotp(rfcSecret, code.replace(/(\d{3})/, "$1 "), null, now),
    step,
  );
  assert.equal(
    verifyTotp(rfcSecret, totpAt(rfcSecret, step - 1), null, now),
    step - 1,
  );
  assert.equal(
    verifyTotp(rfcSecret, totpAt(rfcSecret, step - 2), null, now),
    null,
  );
  // A code already used (or an older one) cannot be replayed.
  assert.equal(verifyTotp(rfcSecret, code, step, now), null);
  for (const bad of ["", "12345", "1234567", "abcdef"])
    assert.equal(verifyTotp(rfcSecret, bad, null, now), null);
});

test("sealed secrets need the right key and detect tampering", () => {
  const sealed = sealSecret("JBSWY3DPEHPK3PXP", "app-secret");
  assert.notEqual(sealed, sealSecret("JBSWY3DPEHPK3PXP", "app-secret"));
  assert.equal(openSecret(sealed, "app-secret"), "JBSWY3DPEHPK3PXP");
  assert.throws(() => openSecret(sealed, "other-secret"));
  const parts = sealed.split(".");
  parts[3] = parts[3].slice(0, -2) + (parts[3].endsWith("A") ? "BB" : "AA");
  assert.throws(() => openSecret(parts.join("."), "app-secret"));
});

test("recovery codes are unique and hash case-insensitively", () => {
  const codes = generateRecoveryCodes();
  assert.equal(codes.length, 8);
  assert.equal(new Set(codes).size, 8);
  for (const code of codes) assert.match(code, /^[a-z2-7]{5}-[a-z2-7]{5}$/);
  assert.equal(
    hashRecoveryCode(codes[0]),
    hashRecoveryCode(` ${codes[0].toUpperCase()} `),
  );
});

test("otpauth URIs carry issuer and escaped account", () => {
  const uri = new URL(otpauthUri("ABC", "me@example.com", "CyberValue"));
  assert.equal(uri.protocol, "otpauth:");
  assert.equal(uri.host, "totp");
  assert.equal(decodeURIComponent(uri.pathname), "/CyberValue:me@example.com");
  assert.equal(uri.searchParams.get("issuer"), "CyberValue");
  assert.equal(uri.searchParams.get("secret"), "ABC");
});
