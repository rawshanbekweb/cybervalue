import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatAccessCode,
  hashSecret,
  isAccessCode,
  newAccessCode,
  normalizeAccessCode,
} from "../src/lib/student/access";
import {
  gradeQuiz,
  parseQuiz,
  publicQuiz,
  quizToText,
} from "../src/lib/student/quiz";
import { checkMaterial, parseRoster } from "../src/lib/student/admin";
import {
  checkArtifact,
  flagFor,
  judgeFlag,
  MAX_ARTIFACT,
  newChallengeSecret,
  renderArtifact,
  variantFor,
} from "../src/lib/student/challenge";
import { createTranslator } from "../src/lib/i18n";

test("access codes are random, readable and survive hand-typed variations", () => {
  const codes = new Set(Array.from({ length: 500 }, newAccessCode));
  assert.equal(codes.size, 500);
  for (const code of codes) assert.ok(isAccessCode(code), code);
  const code = newAccessCode();
  const typed = ` ${formatAccessCode(code).toLowerCase()} `;
  assert.equal(normalizeAccessCode(typed), code);
  // Look-alike letters map onto the digits the alphabet actually uses.
  assert.equal(normalizeAccessCode("oOiL-1234-ABCD-EFGH"), "00111234ABCDEFGH");
  for (const bad of [
    "",
    "ABC",
    "U".repeat(16),
    "A".repeat(17),
    "😀".repeat(16),
  ])
    assert.equal(isAccessCode(normalizeAccessCode(bad)), false, bad);
  assert.match(hashSecret(code), /^[a-f0-9]{64}$/);
  assert.notEqual(hashSecret(code), code);
});

const QUIZ_TEXT = `? HTTPS odatda qaysi portdan foydalanadi?
- 80
+ 443
- 22

? Which tag makes a link?
Choose one.
+ <a>
- <link>`;

test("quiz text parses, round-trips and keeps the key out of the public view", () => {
  const parsed = parseQuiz(QUIZ_TEXT);
  assert.ok("quiz" in parsed);
  assert.equal(parsed.quiz.length, 2);
  assert.equal(parsed.quiz[0].answer, 1);
  assert.equal(parsed.quiz[1].prompt, "Which tag makes a link?\nChoose one.");
  assert.deepEqual(parseQuiz(quizToText(parsed.quiz)), parsed);
  const view = publicQuiz(parsed.quiz);
  assert.ok(view.every((q) => !("answer" in q)));
  assert.ok(!JSON.stringify(view).includes('"answer"'));
});

test("quiz grading counts only exact, in-range choices", () => {
  const parsed = parseQuiz(QUIZ_TEXT);
  assert.ok("quiz" in parsed);
  assert.deepEqual(gradeQuiz(parsed.quiz, [1, 0]), {
    score: 2,
    maxScore: 2,
    results: [true, true],
  });
  assert.equal(gradeQuiz(parsed.quiz, [1]).score, 1);
  assert.equal(gradeQuiz(parsed.quiz, [null, 5]).score, 0);
  assert.equal(gradeQuiz(parsed.quiz, ["1", "0"]).score, 0);
});

test("malformed quizzes are rejected with a line or question number", () => {
  const t = createTranslator("uz");
  const cases: [string, RegExp][] = [
    ["", /Kamida bitta savol/],
    ["- orphan option", /^1-qator/],
    ["? Q\n+ a\n+ b", /^1-savolda/],
    ["? Q\n- a\n- b", /^1-savolda/],
    ["? Q\n+ only", /^1-savolda/],
    ["? Q\n- a\n+ b\n\n? Q2\n-\n+ c", /^6-qator/],
    [Array.from({ length: 61 }, () => "? Q\n- a\n+ b").join("\n"), /juda uzun/],
  ];
  for (const [text, expected] of cases) {
    const result = parseQuiz(text);
    assert.ok("error" in result, text);
    assert.match(t(result.error, result.values), expected, text);
  }
});

test("rosters accept optional groups and reject malformed lines", () => {
  const roster = parseRoster("Ali Valiyev | 9-A\n\n  Madina Karimova  \n");
  assert.ok("students" in roster);
  assert.deepEqual(roster.students, [
    { name: "Ali Valiyev", group: "9-A" },
    { name: "Madina Karimova", group: "" },
  ]);
  for (const bad of [
    "",
    "| 9-A",
    "Ali | 9-A | extra",
    "Ali | <script>",
    "A".repeat(101),
    Array.from({ length: 201 }, (_, i) => `S${i}`).join("\n"),
  ])
    assert.ok("error" in parseRoster(bad), bad.slice(0, 30));
});

test("materials validate kind-specific fields and normalize groups", () => {
  const base = {
    slug: "sql-lab",
    kind: "LAB",
    title: "SQL lab",
    summary: "",
    body: "# Steps",
    quizText: "? ignored",
    maxAttempts: 1,
    groups: " 9-A, 9-B ,9-A,, ",
    position: 0,
    published: true,
  };
  const lab = checkMaterial(base);
  assert.ok("data" in lab);
  assert.equal(lab.data.quiz, null);
  assert.deepEqual(lab.data.groups, ["9-A", "9-B"]);
  assert.ok(!("quizText" in lab.data));

  const quiz = checkMaterial({ ...base, kind: "QUIZ", quizText: QUIZ_TEXT });
  assert.ok("data" in quiz);
  assert.equal(quiz.data.quiz?.length, 2);

  assert.ok("error" in checkMaterial({ ...base, kind: "QUIZ" }));
  assert.ok("error" in checkMaterial({ ...base, slug: "Bad Slug" }));
  assert.ok("error" in checkMaterial({ ...base, kind: "SECRET" }));
  assert.ok("error" in checkMaterial({ ...base, groups: "9-A, <b>" }));
  assert.ok("error" in checkMaterial({ ...base, title: " " }));
});

const ARTIFACT = `log start {{name}}
token={{decoy}}
payload={{flag:base64}}
other={{decoy}}
=== variant ===
GET /?q={{flag:url}} 200
hex {{flag:hex}} rot {{flag:rot13}} rev {{flag:reverse}} raw {{flag}}`;

test("personal labs give each student a stable, unique flag and variant", () => {
  const secret = newChallengeSecret();
  const ids = Array.from({ length: 200 }, (_, i) => `student-${i}`);
  const flags = ids.map((id) => flagFor(secret, id));
  assert.equal(new Set(flags).size, ids.length);
  for (const flag of flags) assert.match(flag, /^CV\{[a-f0-9]{24}\}$/);
  assert.equal(flagFor(secret, "student-1"), flags[1]);
  assert.notEqual(flagFor(newChallengeSecret(), "student-1"), flags[1]);
  const seen = new Set(ids.map((id) => variantFor(secret, id, 2)));
  assert.deepEqual([...seen].sort(), [0, 1]);
});

test("artifacts embed the student's flag in the requested encodings", () => {
  const secret = newChallengeSecret();
  const student = { id: "s1", name: "Ali Valiyev" };
  const flag = flagFor(secret, student.id);
  // Find a variant-2 student too, so both templates are exercised.
  const other = Array.from({ length: 50 }, (_, i) => ({
    id: `x${i}`,
    name: "X",
  })).find(
    (s) =>
      renderArtifact(ARTIFACT, secret, s).variant !==
      renderArtifact(ARTIFACT, secret, student).variant,
  )!;
  for (const who of [student, other]) {
    const { text, variant, variants } = renderArtifact(ARTIFACT, secret, who);
    const own = flagFor(secret, who.id);
    assert.equal(variants, 2);
    assert.ok(!text.includes("{{"), text);
    if (variant === 1) {
      assert.ok(text.includes(`log start ${who.name}`));
      assert.ok(text.includes(Buffer.from(own).toString("base64")));
      assert.ok(!text.includes(own));
    } else {
      assert.ok(text.includes(Buffer.from(own).toString("hex")));
      assert.ok(text.includes([...own].reverse().join("")));
      assert.ok(text.includes(`raw ${own}`));
      const url = /q=(\S+)/.exec(text)![1];
      assert.equal(decodeURIComponent(url), own);
      const rot = / rot (\S+)/.exec(text)![1];
      assert.equal(
        rot.replace(/[a-z]/gi, (c) => {
          const base = c <= "Z" ? 65 : 97;
          return String.fromCharCode(
            ((c.charCodeAt(0) - base + 13) % 26) + base,
          );
        }),
        own,
      );
    }
  }
  // Downloading twice gives the same file.
  assert.equal(
    renderArtifact(ARTIFACT, secret, student).text,
    renderArtifact(ARTIFACT, secret, student).text,
  );
  assert.ok(!renderArtifact(ARTIFACT, secret, other).text.includes(flag));
});

test("flag checks recognise the own flag, decoys and classmates' flags", () => {
  const secret = newChallengeSecret();
  const template = "a={{decoy}}\nb={{flag}}\nc={{decoy}}";
  const me = { id: "me", name: "Me" };
  const mates = ["me", "a", "b"];
  const judge = (input: string) =>
    judgeFlag(input, template, secret, me, mates);
  assert.deepEqual(judge(`  ${flagFor(secret, "me")} `), { result: "correct" });
  const text = renderArtifact(template, secret, me).text;
  const decoys = [...text.matchAll(/[ac]=(CV\{[a-f0-9]+\})/g)].map((m) => m[1]);
  assert.equal(decoys.length, 2);
  for (const decoy of decoys)
    assert.deepEqual(judge(decoy), { result: "decoy" });
  assert.deepEqual(judge(flagFor(secret, "b")), {
    result: "shared",
    owner: "b",
  });
  assert.deepEqual(judge(flagFor(secret, "stranger")), { result: "wrong" });
  assert.deepEqual(judge("cv{nope}"), { result: "wrong" });
  assert.deepEqual(judge(flagFor(secret, "me").toUpperCase()), {
    result: "wrong",
  });
});

test("artifact templates and personal-lab materials are validated", () => {
  const t = createTranslator("uz");
  const problems: [string, RegExp][] = [
    ["", /shablonini yozing/],
    ["no flag here", /1-variantda/],
    ["{{flag}}\n=== variant ===\nmissing", /2-variantda/],
    ["{{flag:base32}}", /base32/],
    ["{{flag}} {{secret}}", /“secret” belgisi/],
    ["{{name:upper}} {{flag}}", /name:upper/],
    ["x".repeat(MAX_ARTIFACT + 1), /juda uzun/],
  ];
  for (const [template, expected] of problems) {
    const problem = checkArtifact(template);
    assert.ok(problem, template.slice(0, 30));
    assert.match(t(problem.error, problem.values), expected);
  }
  assert.equal(checkArtifact(ARTIFACT), null);
  // {{name}} in the message stays literal even with a value attached.
  const unknown = checkArtifact("{{flag}} {{oops}}")!;
  assert.match(t(unknown.error, unknown.values), /\{\{name\}\}/);

  const base = {
    slug: "log-hunt",
    kind: "CHALLENGE",
    title: "Log hunt",
    summary: "",
    body: "",
    quizText: "",
    artifact: ARTIFACT,
    artifactName: "access.log",
    maxAttempts: 5,
    groups: "",
    position: 0,
    published: true,
  };
  const ok = checkMaterial(base);
  assert.ok("data" in ok);
  assert.equal(ok.data.artifactName, "access.log");
  for (const artifactName of ["", "../x.log", "a b.log", ".hidden"])
    assert.ok(
      "error" in checkMaterial({ ...base, artifactName }),
      artifactName,
    );
  assert.ok("error" in checkMaterial({ ...base, artifact: "no flag" }));
  // Other kinds drop any artifact fields.
  const lesson = checkMaterial({ ...base, kind: "LESSON" });
  assert.ok("data" in lesson);
  assert.equal(lesson.data.artifact, "");
  assert.equal(lesson.data.artifactName, "");
});

test("artifact templates typed in a browser keep Unix newlines", () => {
  const result = checkMaterial({
    slug: "crlf",
    kind: "CHALLENGE",
    title: "CRLF",
    summary: "",
    body: "",
    quizText: "",
    artifact: "a={{flag}}\r\nb=1\rc=2",
    artifactName: "x.log",
    maxAttempts: 0,
    groups: "",
    position: 0,
    published: false,
  });
  assert.ok("data" in result);
  assert.equal(result.data.artifact, "a={{flag}}\nb=1\nc=2");
});
