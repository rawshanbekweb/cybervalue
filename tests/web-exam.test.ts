import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {
  buildExam,
  examSubject,
  gradeExam,
  isTopicExam,
} from "../src/lib/domain-exam/build";
import { THROWS, WEB_EXAM } from "../src/lib/domain-exam/web-exam";

const JS_TOPICS = [2, 3];

test("the HTML, CSS and JavaScript exam has 40 well-formed questions", () => {
  const exam = examSubject("web-html-css-js");
  assert.ok(exam && isTopicExam(exam));
  assert.equal(WEB_EXAM.questions.length, 40);
  assert.deepEqual(
    WEB_EXAM.modules.map(
      (_, t) => WEB_EXAM.questions.filter((q) => q.topic === t).length,
    ),
    [10, 10, 9, 11],
  );
  for (const q of WEB_EXAM.questions) {
    assert.ok(q.answer >= 0 && q.answer < q.options.length, q.ask.en);
    assert.ok(q.ask.uz && q.explain.uz && q.explain.en, q.ask.en);
    assert.equal(new Set(q.options.map((o) => o.en)).size, q.options.length);
  }
  const built = buildExam(exam, 3);
  const right = Object.fromEntries(built.map((q) => [q.id, q.answer]));
  assert.equal(gradeExam(exam, 3, right).percent, 100);
});

// Every JavaScript question with code is run for real: the right option
// must be exactly what the console prints, or THROWS when it throws.
test("every JavaScript answer is what the code really prints", () => {
  const coded = WEB_EXAM.questions.filter(
    (q) => JS_TOPICS.includes(q.topic) && q.code,
  );
  assert.ok(coded.length >= 15);
  for (const q of coded) {
    const lines: string[] = [];
    const console = {
      log: (...args: unknown[]) => lines.push(args.map(String).join(" ")),
    };
    let printed: string;
    try {
      vm.runInNewContext(q.code!, { console });
      printed = lines.join("\n");
    } catch {
      printed = THROWS;
    }
    assert.equal(printed, q.options[q.answer].en, q.code);
    // No wrong option may also be what the code prints.
    for (const [i, o] of q.options.entries())
      if (i !== q.answer) assert.notEqual(o.en, printed, q.code);
  }
});

// The JavaScript part stays within what the class has covered: no loops,
// functions or arrays yet.
test("the JavaScript questions stop at if / else", () => {
  for (const q of WEB_EXAM.questions.filter((q) => JS_TOPICS.includes(q.topic)))
    assert.doesNotMatch(
      q.code ?? "",
      /\b(for|while|function|switch|=>)\b|\[/,
      q.ask.en,
    );
});
