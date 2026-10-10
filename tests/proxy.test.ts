import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { proxy, config } from "../src/proxy";
import {
  allowRequest,
  allowShared,
  clientKey,
  type HitStore,
} from "../src/lib/rate-limit";

const request = (path: string, cookie?: string) =>
  new NextRequest(`http://localhost:3000${path}`, {
    headers: cookie ? { cookie } : {},
  });
const rewritten = (response: Response) =>
  response.headers.get("x-middleware-rewrite");

test("proxy rewrites unprefixed URLs to the cookie language and defaults to Uzbek", () => {
  assert.equal(
    rewritten(proxy(request("/about"))),
    "http://localhost:3000/uz/about",
  );
  assert.equal(
    rewritten(proxy(request("/about?q=1", "cybervalue-locale=en"))),
    "http://localhost:3000/en/about?q=1",
  );
  assert.equal(
    rewritten(proxy(request("/", "cybervalue-locale=en"))),
    "http://localhost:3000/en",
  );
  for (const bad of ["invalid", "__proto__", ""])
    assert.equal(
      rewritten(proxy(request("/search", `cybervalue-locale=${bad}`))),
      "http://localhost:3000/uz/search",
    );
});

test("proxy redirects explicit language prefixes to the canonical unprefixed URL", () => {
  const response = proxy(request("/en/playground/ctf?x=1"));
  assert.equal(response.status, 308);
  assert.equal(
    response.headers.get("location"),
    "http://localhost:3000/playground/ctf?x=1",
  );
  assert.equal(
    proxy(request("/uz")).headers.get("location"),
    "http://localhost:3000/",
  );
  // A path that merely starts with the same letters is not a locale.
  assert.equal(
    rewritten(proxy(request("/enroll"))),
    "http://localhost:3000/uz/enroll",
  );
});

test("proxy matcher skips the CMS, student area, handlers, internals and files", () => {
  const matcher = new RegExp(`^${config.matcher[0]}$`);
  for (const path of ["/", "/about", "/playground/ctf", "/resources/exam"])
    assert.ok(matcher.test(path), path);
  for (const path of [
    "/admin",
    "/admin/login",
    "/student",
    "/student/m/intro",
    "/api/ctf/verify",
    "/downloads/file",
    "/media/a",
    "/_next/static/x",
    "/robots.txt",
    "/sitemap.xml",
    "/icon.svg",
    "/lessons/web-asoslari/index.html",
  ])
    assert.ok(!matcher.test(path), path);
});

test("client keys come from the first forwarded hop and one client cannot exhaust another's budget", () => {
  assert.equal(clientKey("203.0.113.7, 10.0.0.1"), "203.0.113.7");
  assert.equal(clientKey(" 203.0.113.7 "), "203.0.113.7");
  for (const missing of [null, "", " "])
    assert.equal(clientKey(missing), "unknown");

  const now = Date.now();
  const id = `test-${now}`;
  for (let i = 0; i < 10; i++)
    assert.ok(allowRequest(`${id}:attacker`, now, 10, 60_000));
  assert.equal(allowRequest(`${id}:attacker`, now, 10, 60_000), false);
  assert.ok(allowRequest(`${id}:admin`, now, 10, 60_000));
});

test("the shared store enforces limits that span instances and fails open when unavailable", async () => {
  const hits = new Map<string, number>();
  // Another instance already spent most of this client's budget.
  hits.set("shared:client", 9);
  const store: HitStore = async (key) => {
    const count = (hits.get(key) ?? 0) + 1;
    hits.set(key, count);
    return count;
  };
  const now = Date.now();
  assert.equal(
    await allowShared("shared:client", 10, 60_000, store, now),
    true,
  );
  assert.equal(
    await allowShared("shared:client", 10, 60_000, store, now),
    false,
  );

  const down: HitStore = async () => {
    throw new Error("database unavailable");
  };
  assert.equal(await allowShared(`down-${now}`, 10, 60_000, down, now), true);
  assert.equal(await allowShared(`local-${now}`, 1, 60_000, null, now), true);
  // The local check still rejects bursts without consulting the store.
  assert.equal(await allowShared(`local-${now}`, 1, 60_000, down, now), false);
});
