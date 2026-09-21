import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

function loadEnvironment(
  siteUrl: string,
  indexable = "false",
  overrides: NodeJS.ProcessEnv = {},
) {
  return spawnSync(
    process.execPath,
    ["--import", "tsx", "--eval", "import('./src/lib/env.ts')"],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        DATABASE_URL: "",
        SITE_URL: siteUrl,
        SITE_INDEXABLE: indexable,
        GITHUB_URL: "",
        LINKEDIN_URL: "",
        TELEGRAM_URL: "",
        INSTAGRAM_URL: "",
        ...overrides,
      },
    },
  );
}

test("invalid site URLs produce configuration guidance instead of URL exceptions", () => {
  for (const value of ["datalife.uz", "https://", ""]) {
    for (const indexable of ["false", "true"]) {
      const result = loadEnvironment(value, indexable);
      assert.equal(result.status, 1);
      assert.match(
        result.stderr,
        /Invalid environment configuration: SITE_URL/,
      );
      assert.match(result.stderr, /complete HTTP\(S\) origin/);
      assert.doesNotMatch(result.stderr, /ERR_INVALID_URL/);
    }
  }
});

test("site validation accepts HTTPS production and HTTP local preview origins", () => {
  for (const [value, indexable] of [
    ["https://datalife.uz", "true"],
    ["http://localhost:3000", "false"],
  ]) {
    const result = loadEnvironment(value, indexable);
    assert.equal(result.status, 0, result.stderr);
  }
});

test("site validation rejects credentials without exposing their values", () => {
  const result = loadEnvironment("https://owner:secret-marker@example.com");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Invalid environment configuration: SITE_URL/);
  assert.doesNotMatch(result.stderr, /secret-marker/);
});

test("malformed social URLs identify the variable and give HTTPS guidance", () => {
  for (const name of [
    "GITHUB_URL",
    "LINKEDIN_URL",
    "TELEGRAM_URL",
    "INSTAGRAM_URL",
  ]) {
    const result = loadEnvironment("https://datalife.uz", "true", {
      [name]: "t.me/valuecyber",
    });
    assert.equal(result.status, 1);
    assert.ok(
      result.stderr.includes(`Invalid environment configuration: ${name}`),
    );
    assert.match(
      result.stderr,
      /Social profile URLs must start with https:\/\//,
    );
    assert.doesNotMatch(result.stderr, /ERR_INVALID_URL|t\.me\/valuecyber/);
  }
});

test("valid Telegram URL permits environment initialization", () => {
  const result = loadEnvironment("https://datalife.uz", "true", {
    TELEGRAM_URL: "https://t.me/valuecyber",
  });
  assert.equal(result.status, 0, result.stderr);
});
