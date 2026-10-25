import { test } from "node:test";
import assert from "node:assert/strict";
import { VIDEO_LESSONS } from "../src/lib/video-lessons";
import {
  captionAt,
  sayHash,
  sceneAt,
  timeline,
} from "../src/lib/video-lessons/types";
import { LAB_PROGRESS } from "../src/lib/lab-progress";

test("each video lesson belongs to a lab and runs 5 to 15 minutes", () => {
  for (const [id, lesson] of Object.entries(VIDEO_LESSONS)) {
    assert.equal(lesson.id, id);
    assert.ok(id in LAB_PROGRESS, id);
    const { total, audio } = timeline(lesson);
    assert.equal(audio, null);
    assert.ok(total >= 5 * 60 && total <= 15 * 60, `${id}: ${total}s`);
    for (const chapter of lesson.chapters) {
      assert.ok(chapter.scenes.length > 0, chapter.title);
      for (const scene of chapter.scenes) assert.ok(scene.say.length > 40);
    }
  }
});

test("a recording is used only when it matches every scene", () => {
  const lesson = VIDEO_LESSONS.bash;
  const scenes = lesson.chapters.flatMap((c) => c.scenes);
  const audio = {
    file: "/video-lessons/bash.mp3",
    scenes: scenes.map((s) => ({ hash: sayHash(s.say), duration: 10 })),
  };
  const recorded = timeline(lesson, audio);
  assert.equal(recorded.audio, "/video-lessons/bash.mp3");
  assert.equal(recorded.total, scenes.length * 10);
  // One changed text falls back to estimated timing.
  const stale = {
    ...audio,
    scenes: audio.scenes.map((s, i) => (i === 3 ? { ...s, hash: "x" } : s)),
  };
  assert.equal(timeline(lesson, stale).audio, null);
});

test("the clock finds the scene and the caption", () => {
  const { scenes, total } = timeline(VIDEO_LESSONS.crypto);
  assert.equal(sceneAt(scenes, 0).index, 0);
  assert.equal(sceneAt(scenes, total).index, scenes.length - 1);
  const second = scenes[1];
  const at = sceneAt(scenes, second.start + second.duration / 2);
  assert.equal(at.index, 1);
  assert.ok(Math.abs(at.progress - 0.5) < 0.01);
  const say = "Birinchi gap. Ikkinchi gap! Uchinchi gap?";
  assert.equal(captionAt(say, 0), "Birinchi gap.");
  assert.equal(captionAt(say, 0.5), "Ikkinchi gap!");
  assert.equal(captionAt(say, 1), "Uchinchi gap?");
});
