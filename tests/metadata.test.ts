import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CITIES,
  km,
  LAT,
  LON,
  nearest,
  stripSolved,
  TAGS,
  toDecimal,
} from "../src/lib/metadata/tools";
import { LESSONS } from "../src/lib/metadata/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("DMS converts to decimal degrees", () => {
  assert.equal(toDecimal({ deg: 41, min: 18, sec: 0, ref: "N" }), 41.3);
  assert.equal(toDecimal({ deg: 10, min: 30, sec: 0, ref: "W" }), -10.5);
  assert.ok(Math.abs(toDecimal(LAT) - 39.6548) < 0.0001);
  assert.ok(Math.abs(toDecimal(LON) - 66.9756) < 0.0001);
});

test("the photo was taken in Samarkand", () => {
  assert.equal(nearest().id, "samarkand");
  const lat = toDecimal(LAT);
  const lon = toDecimal(LON);
  const s = CITIES.find((c) => c.id === "samarkand")!;
  assert.ok(km(lat, lon, s.lat, s.lon) < 3);
  for (const c of CITIES.filter((c) => c.id !== "samarkand"))
    assert.ok(km(lat, lon, c.lat, c.lon) > 100, c.id);
});

test("strip every personal tag and keep the display ones", () => {
  const priv = TAGS.filter((t) => t.private).map((t) => t.name);
  assert.ok(stripSolved(priv));
  assert.ok(!stripSolved(TAGS.map((t) => t.name)));
  assert.ok(!stripSolved(priv.slice(1)));
  for (const t of TAGS) assert.ok(!(t.private && t.display));
  for (const t of TAGS) assert.match(t.flag, /^-[\w:]+=$/);
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.metadata.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("metadata-1");
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
