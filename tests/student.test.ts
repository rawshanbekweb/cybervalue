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
