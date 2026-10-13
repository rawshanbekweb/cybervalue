import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_LOGIN,
  formatRequest,
  formatResponse,
  GOALS,
  pageLoad,
  serve,
  type HttpRequest,
} from "../src/lib/network/web";
import { LESSONS } from "../src/lib/network/curriculum";

test("a page load runs DNS, TCP, TLS and HTTP in order", () => {
  const full = pageLoad({ https: true, cached: false });
  assert.deepEqual(
    full.timings.map((t) => t.phase),
    ["dns", "tcp", "tls", "http"],
  );
  assert.deepEqual(
    full.packets.map((p) => p.phase),
    ["dns", "dns", "tcp", "tcp", "tcp", "tls", "tls", "tls", "http", "http"],
  );
  // Phases follow each other without gaps.
  for (let i = 1; i < full.timings.length; i++)
    assert.equal(
      full.timings[i].start,
      full.timings[i - 1].start + full.timings[i - 1].ms,
    );
  assert.equal(
    full.total,
    full.timings.reduce((sum, t) => sum + t.ms, 0),
  );
  assert.match(full.packets[0].transport, /UDP .* 53$/);
  assert.match(full.packets[2].transport, /443$/);

  const cached = pageLoad({ https: true, cached: true });
  assert.ok(!cached.timings.some((t) => t.phase === "dns"));
  assert.ok(cached.total < full.total);

  const plain = pageLoad({ https: false, cached: false });
  assert.ok(!plain.timings.some((t) => t.phase === "tls"));
  assert.match(plain.packets.find((p) => p.phase === "tcp")!.transport, / 80$/);
});

test("an eavesdropper reads HTTP but only names and sizes over HTTPS", () => {
  const get = (https: boolean) =>
    pageLoad({ https, cached: false }).packets.find(
      (p) => p.phase === "http" && p.from === "browser",
    )!;
  assert.match(get(false).visible.en, /cookie/i);
  assert.doesNotMatch(get(true).visible.en, /steal/);
  assert.match(get(true).visible.en, /hidden/);
  const hello = pageLoad({ https: true, cached: false }).packets.find(
    (p) => p.summary === "TLS ClientHello",
  )!;
  assert.match(hello.visible.en, /site name/);
});

test("the HTTP server returns every status the lesson asks for", () => {
  const send = (r: Partial<HttpRequest>) =>
    serve({ method: "GET", path: "/", cookie: "", body: "", ...r });
  assert.equal(send({ path: "/kitoblar" }).status, 200);
  assert.equal(send({ path: "/eski-sahifa" }).status, 301);
  assert.deepEqual(send({ path: "/eski-sahifa" }).headers, [
    ["Location", "/kitoblar"],
  ]);
  const login = send({
    method: "POST",
    path: "/kirish",
    body: `login=${DEMO_LOGIN.user}&parol=${DEMO_LOGIN.password}`,
  });
  assert.equal(login.status, 302);
  assert.ok(
    login.headers.some(([k, v]) => k === "Set-Cookie" && /HttpOnly/.test(v)),
  );
  assert.equal(
    send({ method: "POST", path: "/kirish", body: "login=talaba&parol=x" })
      .status,
    401,
  );
  assert.equal(send({ path: "/admin" }).status, 401);
  assert.equal(send({ path: "/admin", cookie: "user" }).status, 403);
  assert.equal(send({ path: "/admin", cookie: "admin" }).status, 200);
  assert.equal(send({ path: "/kitoblar/999" }).status, 404);
  assert.equal(send({ method: "DELETE", path: "/kitoblar/42" }).status, 405);
  assert.equal(send({ method: "POST", path: "/kitoblar" }).status, 405);
  const head = send({ method: "HEAD", path: "/kitoblar" });
  assert.equal(head.status, 200);
  assert.equal(head.body, "");
  assert.ok(head.headers.some(([k]) => k === "Content-Length"));
  assert.match(send({ path: "/kitoblar/42" }).headers[0][1], /json/);
  const reached = new Set(
    [
      send({ path: "/" }),
      send({ path: "/eski-sahifa" }),
      login,
      send({ path: "/admin" }),
      send({ path: "/admin", cookie: "user" }),
      send({ path: "/nope" }),
    ].map((r) => r.status),
  );
  for (const code of GOALS) assert.ok(reached.has(code), String(code));
});

test("requests and responses print as real HTTP text", () => {
  const request: HttpRequest = {
    method: "POST",
    path: "/kirish",
    cookie: "user",
    body: "login=talaba&parol=kitob123",
  };
  const text = formatRequest(request);
  assert.match(text, /^POST \/kirish HTTP\/1\.1\nHost: kutubxona\.example\n/);
  assert.match(text, /Cookie: session=u-7d41/);
  assert.match(text, /Content-Length: 27\n\nlogin=talaba&parol=kitob123$/);
  assert.match(formatRequest({ ...request, method: "GET" }), /\n\n$/);
  const response = formatResponse(serve({ ...request, cookie: "" }));
  assert.match(response, /^HTTP\/1\.1 302 Found\n/);
  assert.match(response, /Location: \/kitoblar\n\n$/);
});

test("the web lessons come last with answerable questions", () => {
  const web = LESSONS.filter((l) =>
    ["pageload", "http"].includes(l.widget.type),
  );
  assert.deepEqual(
    web.map((l) => l.id),
    [16, 17],
  );
  const pageload = web[0].widget;
  assert.ok(pageload.type === "pageload");
  for (const q of pageload.questions) assert.ok(q.answer < q.options.length);
});
