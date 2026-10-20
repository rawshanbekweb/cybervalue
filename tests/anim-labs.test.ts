import { test } from "node:test";
import assert from "node:assert/strict";
import {
  anatomyIds,
  type CommonWidget,
  type Lesson,
} from "../src/lib/anim-lab/types";
import { LESSONS as HTTP_BASICS } from "../src/lib/http-basics/curriculum";
import { LESSONS as HTTPS } from "../src/lib/https-basics/curriculum";
import {
  INTERCEPTED,
  SECRET,
  shift,
  unshift,
} from "../src/lib/https-basics/cipher";
import {
  answer,
  family,
  FAMILIES,
  METHODS,
  PATHS,
} from "../src/lib/http-basics/server";

// Every animated lab's lessons must be solvable: numbered 1…n, both
// languages filled in, and each shared widget internally consistent.
const LABS: Record<string, Lesson<{ type: string }>[]> = {
  "http-basics": HTTP_BASICS,
  https: HTTPS,
};

const filled = (value: { uz: string; en: string }) =>
  value.uz.trim().length > 0 && value.en.trim().length > 0;

for (const [name, lessons] of Object.entries(LABS))
  test(`${name}: lessons are complete and solvable`, () => {
    lessons.forEach((lesson, i) => {
      assert.equal(lesson.id, i + 1);
      for (const text of [
        lesson.group,
        lesson.title,
        lesson.intro,
        lesson.analogy,
        lesson.task,
        lesson.hint,
        ...lesson.theory,
      ])
        assert.ok(filled(text), `${name} #${lesson.id}`);
      const widget = lesson.widget as CommonWidget;
      switch (widget.type) {
        case "sequence": {
          const ids = new Set(widget.actors.map((a) => a.id));
          assert.ok(widget.steps.length > 0);
          for (const step of widget.steps) {
            assert.ok(ids.has(step.from) && ids.has(step.to), step.label);
            assert.ok(filled(step.detail));
          }
          break;
        }
        case "anatomy": {
          const ids = anatomyIds(widget.lines);
          assert.equal(new Set(ids).size, ids.length, "part ids are unique");
          assert.deepEqual(
            [...ids].sort(),
            widget.parts.map((p) => p.id).sort(),
            `${name} #${lesson.id}: every part is explained`,
          );
          break;
        }
        case "sort": {
          const buckets = new Set(widget.buckets.map((b) => b.id));
          for (const item of widget.items)
            assert.ok(buckets.has(item.bucket), item.label.en);
          // Every bucket gets at least one card.
          for (const bucket of buckets)
            assert.ok(widget.items.some((item) => item.bucket === bucket));
          break;
        }
        case "quiz":
          for (const q of widget.questions)
            assert.ok(q.answer >= 0 && q.answer < q.options.length);
          break;
      }
    });
  });

test("http-basics: the practice server reaches every family of codes", () => {
  const seen = new Set<number>();
  for (const method of METHODS)
    for (const path of PATHS) seen.add(family(answer(method, path).status));
  assert.deepEqual([...seen].sort(), [...FAMILIES]);
  assert.equal(answer("GET", "/").status, 200);
  assert.equal(answer("POST", "/").status, 405);
  assert.equal(
    answer("GET", "/old-page").headers.find(([n]) => n === "Location")?.[1],
    "/",
  );
  // The Network panel's questions point at rows that exist.
  const panel = HTTP_BASICS.find((l) => l.widget.type === "netpanel")!.widget;
  if (panel.type !== "netpanel") return;
  const paths = new Set(panel.rows.map((r) => r.path));
  for (const q of panel.questions)
    for (const option of q.options) assert.ok(paths.has(option.en), option.en);
});

test("https: the toy cipher locks and unlocks with the same key", () => {
  assert.equal(shift("Abc xyz!", 3), "Def abc!");
  assert.equal(unshift(shift("salom dunyo", 11), 11), "salom dunyo");
  assert.equal(unshift(INTERCEPTED, SECRET.key), SECRET.plain);
  assert.notEqual(INTERCEPTED, SECRET.plain);
});
