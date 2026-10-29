import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ACTIONS,
  ARTIFACTS,
  CHANGES,
  gridSolved,
  hex,
  identify,
  START,
  STAMPS,
  timelineSolved,
  utcClock,
  utcSeconds,
  type Grid,
} from "../src/lib/filesystem/tools";
import { LESSONS } from "../src/lib/filesystem/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("MACB follows ext4: reads touch A, writes M and C, inode changes C", () => {
  assert.deepEqual(CHANGES.read, ["a"]);
  assert.deepEqual(CHANGES.write, ["m", "c"]);
  assert.deepEqual(CHANGES.chmod, ["c"]);
  assert.deepEqual(CHANGES.rename, ["c"]);
  for (const a of ACTIONS) assert.ok(!CHANGES[a].includes("b"));
  assert.ok(gridSolved({ ...CHANGES }));
  const empty = Object.fromEntries(
    ACTIONS.map((a) => [a, []]),
  ) as unknown as Grid;
  assert.ok(!gridSolved(empty));
  const everything = Object.fromEntries(
    ACTIONS.map((a) => [a, [...STAMPS]]),
  ) as unknown as Grid;
  assert.ok(!gridSolved(everything));
});

test("files are known by their first bytes", () => {
  assert.equal(identify([0xff, 0xd8, 0xff, 0xe0]), "jpeg");
  assert.equal(identify([0x25, 0x50, 0x44, 0x46, 0x2d]), "pdf");
  assert.equal(identify([0x50, 0x4b, 0x03, 0x04]), "zip");
  assert.equal(identify([0x4d, 0x5a, 0x90, 0x00]), "exe");
  assert.equal(identify([0x89, 0x50, 0x4e, 0x47]), "png");
  assert.equal(identify([0x00, 0x01]), null);
  assert.equal(hex([0x4d, 0x5a]), "4D 5A");
  // The sort lesson's hex strings name what identify() says.
  const sort = LESSONS[3].widget;
  assert.equal(sort.type, "sort");
  if (sort.type === "sort")
    for (const item of sort.items.filter((i) => i.code)) {
      const bytes = item.label.en.split(" ").map((h) => parseInt(h, 16));
      assert.equal(identify(bytes), item.bucket, item.label.en);
    }
});

test("the timeline needs every clock in UTC", () => {
  const upload = ARTIFACTS.find((a) => a.id === "upload")!;
  assert.equal(utcClock(upload), "02:11:02");
  assert.equal(utcSeconds({ ...upload, clock: "03:00:00" }), 22 * 3600);
  // Sorted by the clocks as written, the attack runs backwards.
  assert.ok(!timelineSolved(START));
  assert.ok(timelineSolved(["upload", "shell", "cmd", "miner", "cron"]));
  assert.ok(!timelineSolved(["shell", "upload", "cmd", "miner", "cron"]));
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.filesystem.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("filesystem-1");
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
