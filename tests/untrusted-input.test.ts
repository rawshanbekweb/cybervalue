import { test } from "node:test";
import assert from "node:assert/strict";
import {
  breaksAttribute,
  breaksText,
  checkPattern,
  download,
  escapeHtml,
  escapeTags,
  loggedInAs,
  loginQuery,
  normalize,
  runParameterized,
  runSql,
  SECRET,
  SECRET_FILE,
  USERNAME_CASES,
  USERS,
} from "../src/lib/untrusted-input/tools";
import { LESSONS } from "../src/lib/untrusted-input/curriculum";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

const login = (name: string, pass: string) =>
  loggedInAs(runSql(loginQuery(name, pass)));

test("the login query works for real users and refuses wrong passwords", () => {
  for (const user of USERS)
    assert.equal(login(user.name, user.pass)?.id, user.id);
  assert.equal(login("ali", "wrong"), null);
  assert.equal(login("nobody", ""), null);
  // A doubled quote is how SQL writes a quote inside a string.
  assert.equal(login("o''zbek", "x"), null);
});

test("lesson 2: a lone quote is a syntax error", () => {
  const result = runSql(loginQuery("'", ""));
  assert.equal(result.ok, false);
  assert.equal(runSql(loginQuery("ali", "'")).ok, false);
});

test("lesson 3: the classic bypasses sign in as admin, precedence included", () => {
  assert.equal(login("admin'--", "x")?.name, "admin");
  assert.equal(login("admin'#", "")?.name, "admin");
  assert.equal(login("' OR '1'='1", "' OR '1'='1")?.name, "admin");
  // AND binds before OR: the name field alone is not enough here.
  assert.equal(login("' OR '1'='1", "x"), null);
  assert.equal(login("x' OR 1=1 --", "")?.name, "admin");
  assert.equal(login("ali' AND NOT pass = 'z' --", "")?.name, "ali");
  assert.equal(runSql(loginQuery("x' OR nope=1 --", "")).ok, false);
});

test("lesson 4: parameters keep the same input as data", () => {
  assert.deepEqual(runParameterized("admin'--", ""), []);
  assert.equal(runParameterized("ali", "olma-2026")[0]?.name, "ali");
});

test("lessons 5 and 6: paths resolve, the filter is bypassed, the check holds", () => {
  assert.equal(normalize("/srv/files/../app/./config.env"), SECRET_FILE);
  assert.equal(normalize("/a/../../b"), "/b");
  const safe = download("menu.txt", false);
  assert.equal(safe.outside, false);
  assert.ok(safe.body);
  const out = download("../app/config.env", false);
  assert.ok(out.outside && out.body?.includes(SECRET));
  assert.ok(download("..%2fapp%2fconfig.env", false).body?.includes(SECRET));
  // The filter stops the plain form…
  assert.equal(download("../app/config.env", true).outside, false);
  // …but not one rebuilt after the deletion.
  const bypass = download("....//app/config.env", true);
  assert.equal(bypass.filtered, "../app/config.env");
  assert.ok(bypass.outside && bypass.body?.includes(SECRET));
  assert.equal(download("%zz", false).param, "%zz");
});

test("lesson 7: only an anchored allowlist passes every case", () => {
  const passes = (pattern: string) => {
    const check = checkPattern(pattern);
    return (
      check.ok && check.results.every((r, i) => r === USERNAME_CASES[i].ok)
    );
  };
  assert.ok(passes("^[a-z0-9_]{3,16}$"));
  assert.ok(!passes("[a-z0-9_]{3,16}"));
  assert.ok(!passes("^[a-zA-Z0-9_]{3,16}$"));
  assert.ok(!passes("^[a-z0-9_]+$"));
  assert.equal(checkPattern("(").ok, false);
  assert.equal(checkPattern("a".repeat(81)).ok, false);
});

test("lesson 8: only full encoding is safe in an attribute", () => {
  const value = '" autofocus onfocus="x';
  assert.ok(breaksAttribute(value));
  assert.ok(breaksAttribute(escapeTags(value)));
  assert.ok(!breaksAttribute(escapeHtml(value)));
  assert.ok(breaksText("<b>"));
  assert.ok(!breaksText(escapeTags("<b>")));
  assert.equal(
    escapeHtml(`<a href='x'>&</a>`),
    "&lt;a href=&#39;x&#39;&gt;&amp;&lt;/a&gt;",
  );
});

test("the curriculum is numbered and its quiz answers are in range", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  for (const lesson of LESSONS)
    if (lesson.widget.type === "quiz")
      for (const q of lesson.widget.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("input-1");
  assert.ok(checkpoint);
  const questions = questionsFor(checkpoint, 42);
  assert.equal(questions.length, 10);
  assert.deepEqual(questionsFor(checkpoint, 42), questions);
  assert.equal(
    grade(
      questions,
      questions.map((q) => q.answer),
    ).percent,
    100,
  );
});
