import { test } from "node:test";
import assert from "node:assert/strict";
import {
  appendedAt,
  DUMP,
  END_LINE,
  hex2,
  printable,
  SPEC_H,
  SPEC_W,
  spectrogram,
  waveform,
  wordRight,
} from "../src/lib/formats/tools";
import { LESSONS } from "../src/lib/formats/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("the dump starts as a JPEG and a ZIP follows FF D9", () => {
  for (const l of DUMP) assert.equal(l.bytes.length, 16);
  assert.deepEqual(DUMP[0].bytes.slice(0, 2), [0xff, 0xd8]);
  assert.equal(END_LINE, 2);
  assert.equal(appendedAt(), 48203);
  const line = DUMP[END_LINE];
  const at = appendedAt() - line.offset;
  assert.deepEqual(line.bytes.slice(at, at + 4), [0x50, 0x4b, 0x03, 0x04]);
  assert.equal(hex2(0x4b), "4B");
  assert.equal(printable(0x50), "P");
  assert.equal(printable(0xff), ".");
});

test("the word is bright high up; the waveform hides it", () => {
  const s = spectrogram();
  assert.equal(s.length, SPEC_H);
  assert.equal(s[0].length, SPEC_W);
  const bright = s.flat().filter((e) => e >= 0.95).length;
  assert.ok(bright > 50, String(bright));
  // Ordinary energy stays low in the top rows.
  assert.ok(s[1].every((e) => e < 0.1));
  assert.equal(waveform().length, SPEC_W);
  assert.ok(wordRight("s o s"));
  assert.ok(!wordRight("SO"));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.formats.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("formats-1");
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
