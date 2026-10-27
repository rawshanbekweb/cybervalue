import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyPolicy,
  bankSafe,
  dangers,
  linkAllowed,
  PAGE,
  policyRight,
  readMarkup,
  transfer,
} from "../src/lib/browser-risks/tools";
import { LESSONS } from "../src/lib/browser-risks/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("markup is read into text and elements, and risky parts are named", () => {
  assert.deepEqual(readMarkup("Ajoyib kitob!"), [
    { kind: "text", text: "Ajoyib kitob!" },
  ]);
  const bold = readMarkup("Salom <b>do‘stlar</b>");
  assert.equal(bold.filter((n) => n.kind === "element").length, 1);
  assert.equal(dangers(bold).length, 0);
  const handler = readMarkup('<img src="x" onerror="…">');
  assert.deepEqual(
    handler[0].kind === "element" && handler[0].attrs.map((a) => a.name),
    ["src", "onerror"],
  );
  assert.ok(dangers(handler).some((d) => d.why.en.includes("onerror")));
  assert.equal(dangers(readMarkup("<script>…</script>")).length, 1);
  assert.equal(dangers(readMarkup('<a href="javascript:…">x</a>')).length, 1);
  assert.equal(dangers(readMarkup('<a href="/profil">x</a>')).length, 0);
  // Comments and closing tags build nothing.
  assert.deepEqual(readMarkup("<!-- x --></b>"), []);
});

test("links allow only web addresses, whatever the spelling", () => {
  for (const ok of [
    "https://kitob.uz/ali",
    "/profil/ali",
    "HTTPS://Blog.Example.uz",
    "http://a.uz",
  ])
    assert.ok(linkAllowed(ok), ok);
  for (const bad of [
    "javascript:x",
    "JavaScript:x",
    " javascript:x",
    "java\nscript:x",
    "data:text/html,x",
    "vbscript:x",
  ])
    assert.ok(!linkAllowed(bad), JSON.stringify(bad));
});

test("the CSP checker follows the browser's rules", () => {
  // No policy: everything loads, attacks included.
  assert.ok([...applyPolicy([]).verdicts.values()].every((v) => v.allowed));
  const right = [
    "default-src 'self'",
    "script-src 'self' https://cdn.stats.example",
    "img-src 'self' https://img.kitob.example",
  ];
  assert.ok(policyRight(right));
  assert.ok(policyRight([...right, "object-src 'none'"]));
  assert.ok(
    policyRight([
      "default-src 'self'",
      "script-src 'self' https://cdn.stats.example",
      "img-src *",
    ]),
  );
  // default-src alone blocks the statistics and the covers.
  assert.ok(!policyRight(["default-src 'self'"]));
  // 'unsafe-inline' and * let attacks in.
  assert.ok(
    !policyRight([
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "img-src *",
    ]),
  );
  assert.ok(!policyRight(["default-src 'self'", "script-src *", "img-src *"]));
  // The first directive of a name wins; later ones are reported as ignored.
  const twice = applyPolicy(["script-src 'self'", "script-src *"]);
  assert.deepEqual(twice.ignored, ["script-src *"]);
  assert.equal(twice.verdicts.get("foreign")!.allowed, false);
  assert.equal(PAGE.filter((r) => !r.needed).length, 3);
});

test("SameSite and the token each stop the forged transfer", () => {
  assert.equal(
    transfer({ sameSite: "None", token: false }, "evil").accepted,
    true,
  );
  assert.ok(!bankSafe({ sameSite: "None", token: false }));
  for (const sameSite of ["Lax", "Strict"] as const)
    assert.ok(bankSafe({ sameSite, token: false }), sameSite);
  assert.ok(bankSafe({ sameSite: "None", token: true }));
  assert.ok(bankSafe({ sameSite: "Lax", token: true }));
});

test("the curriculum is numbered, sorted answers are consistent, quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.browser.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
    if (lesson.id === 3 && w.type === "sort")
      for (const item of w.items)
        assert.equal(
          linkAllowed(item.label.en.replace("…", "x")),
          item.bucket === "ok",
          item.label.en,
        );
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("browser-1");
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
