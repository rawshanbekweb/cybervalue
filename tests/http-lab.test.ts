import { test } from "node:test";
import assert from "node:assert/strict";
import {
  goalMet,
  LESSONS,
  restoreProgress,
  sameOrigin,
} from "../src/lib/http/curriculum";
import {
  DEMO,
  formatResponse,
  parseRequest,
  serve,
  SESSION,
  TRUSTED_ORIGIN,
} from "../src/lib/http/server";
import { checkpointById, questionsFor } from "../src/lib/checkpoints/questions";

const H = "Host: shop.cybervalue.uz";
const SOLUTIONS: Record<number, string> = {
  1: `GET / HTTP/1.1\n${H}\n`,
  2: `GET /chegirmalar HTTP/1.1\n${H}\n`,
  4: `POST /login HTTP/1.1\n${H}\nContent-Type: application/x-www-form-urlencoded\n\nuser=${DEMO.user}&pass=${DEMO.pass}`,
  5: `GET /profil HTTP/1.1\n${H}\nCookie: session=${SESSION}\n`,
  8: `OPTIONS /api/buyurtmalar HTTP/1.1\n${H}\nOrigin: ${TRUSTED_ORIGIN}\n`,
};

test("every request lesson is solved by its solution, not by its start", () => {
  for (const lesson of LESSONS) {
    if (lesson.widget.type !== "request") continue;
    const solution = parseRequest(SOLUTIONS[lesson.id]);
    assert.ok(solution.ok, `lesson ${lesson.id}`);
    if (!solution.ok) continue;
    const response = serve(solution.request);
    assert.ok(
      goalMet(lesson.widget.goal, solution.request, response),
      `lesson ${lesson.id}: ${formatResponse(response)}`,
    );
    const start = parseRequest(lesson.widget.start);
    if (start.ok)
      assert.ok(
        !goalMet(lesson.widget.goal, start.request, serve(start.request)),
        `lesson ${lesson.id} must not pass with its start`,
      );
  }
});

test("the server behaves as the lessons teach", () => {
  const send = (raw: string) => {
    const p = parseRequest(raw);
    assert.ok(p.ok, raw);
    return p.ok ? serve(p.request) : null!;
  };
  assert.equal(send(`GET /aksiya HTTP/1.1\n${H}\n`).status, 301);
  assert.equal(send(`GET /profil HTTP/1.1\n${H}\n`).status, 401);
  assert.equal(
    send(`POST /login HTTP/1.1\n${H}\n\nuser=ali&pass=wrong`).status,
    401,
  );
  assert.equal(
    send(`GET /admin HTTP/1.1\n${H}\nCookie: session=${SESSION}\n`).status,
    403,
  );
  // CORS only for the trusted origin.
  const evil = send(
    `OPTIONS /api/buyurtmalar HTTP/1.1\n${H}\nOrigin: https://evil.example\n`,
  );
  assert.ok(!evil.headers.some(([n]) => n === "Access-Control-Allow-Origin"));
  assert.equal(send(`GET /yoq HTTP/1.1\n${H}\n`).status, 404);
  // Malformed requests say what is wrong and where.
  const noHost = parseRequest("GET / HTTP/1.1\n");
  assert.ok(!noHost.ok && /Host/.test(noHost.message.en));
  const bad = parseRequest(`get / http\n${H}`);
  assert.ok(!bad.ok && bad.line === 1);
});

test("origin and flag exercises have consistent answers", () => {
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "origin")
      for (const u of w.urls)
        assert.equal(sameOrigin(w.base, u.url), u.same, u.url);
    if (w.type === "flags")
      for (const id of w.right)
        assert.ok(
          w.flags.some((f) => f.id === id),
          id,
        );
    if (w.type === "choice")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
  assert.deepEqual(restoreProgress({ 1: true, 99: true, 2: "yes" }), {
    1: true,
  });
});

test("the HTTP checkpoint builds 12 questions from its pool", () => {
  const cp = checkpointById("http-1");
  assert.ok(cp);
  const questions = questionsFor(cp!, 42);
  assert.equal(questions.length, 12);
  assert.deepEqual(questionsFor(cp!, 42), questions);
});
