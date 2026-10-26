// Narrated video lessons. A lesson is a list of chapters, a chapter a list
// of scenes; each scene has the Uzbek narration (`say`) and an animated
// picture (`visual`). The picture is drawn from the scene's progress
// (0…1), so the player can seek and the MP4 renderer can step frame by
// frame. Scene timing comes from the recorded narration when it exists
// (audio.json), otherwise from the length of the text.

export type Icon =
  | "lock"
  | "key"
  | "terminal"
  | "book"
  | "chef"
  | "boxes"
  | "seal"
  | "grinder"
  | "doors"
  | "stamp"
  | "switch"
  | "guard"
  | "teacher"
  | "kettle"
  | "warning"
  | "check"
  | "bell"
  | "id"
  | "mail";

export type TermLine = { cmd?: string; out?: string };

export type Visual =
  | { kind: "title"; title: string; subtitle: string }
  | { kind: "points"; heading: string; items: string[] }
  | { kind: "analogy"; icon: Icon; heading: string; text: string }
  | { kind: "bytes"; text: string }
  | { kind: "base64"; plain: string }
  | { kind: "three" }
  | { kind: "hash"; a: string; b: string }
  | { kind: "mirrors" }
  | { kind: "salt" }
  | { kind: "dictionary" }
  | { kind: "xor"; plain: number; key: number }
  | { kind: "keylen" }
  | { kind: "signature" }
  | { kind: "terminal"; lines: TermLine[] }
  | { kind: "code"; title: string; lines: string[]; focus?: number[] }
  | { kind: "boxes"; vars: [string, string][] }
  | { kind: "loop"; items: string[]; variable: string }
  | { kind: "countdown" }
  | { kind: "logscan" }
  | {
      kind: "exchange";
      left: string;
      right: string;
      steps: { dir: "right" | "left"; label: string; note: string }[];
    }
  | { kind: "message"; title: string; lines: { text: string; note: string }[] }
  | { kind: "methods" }
  | { kind: "families" }
  | { kind: "devtools" }
  | { kind: "eavesdrop"; secure: boolean }
  | { kind: "caesar"; plain: string; key: number }
  | { kind: "chain" }
  | { kind: "warning" };

export type Scene = { say: string; visual: Visual };

export type Chapter = { title: string; scenes: Scene[] };

export type VideoLesson = {
  /** Same id as the lab (LAB_PROGRESS key). */
  id: string;
  title: string;
  /** The lab page the video belongs to. */
  href: string;
  chapters: Chapter[];
};

/** Recorded narration: one audio file and each scene's length in seconds. */
export type LessonAudio = {
  file: string;
  scenes: { hash: string; duration: number }[];
};

export type TimedScene = Scene & {
  chapter: number;
  start: number;
  duration: number;
};

/** Seconds a scene lasts when no recording exists: about 14 characters a second. */
export const estimate = (say: string) =>
  Math.max(4, Math.round((say.length / 14) * 10) / 10);

/** A short stable hash of the narration, so a changed text needs a new recording. */
export function sayHash(say: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < say.length; i++) {
    h ^= say.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/**
 * Lays the scenes on a timeline. The recording is used only when it matches
 * every scene's text; otherwise the timing is estimated and the video plays
 * with captions only.
 */
export function timeline(lesson: VideoLesson, audio?: LessonAudio) {
  const flat = lesson.chapters.flatMap((chapter, index) =>
    chapter.scenes.map((scene) => ({ ...scene, chapter: index })),
  );
  const recorded =
    audio !== undefined &&
    audio.scenes.length === flat.length &&
    flat.every((scene, i) => audio.scenes[i].hash === sayHash(scene.say));
  let start = 0;
  const scenes: TimedScene[] = flat.map((scene, i) => {
    const duration = recorded ? audio.scenes[i].duration : estimate(scene.say);
    const timed = { ...scene, start, duration };
    start += duration;
    return timed;
  });
  return { scenes, total: start, audio: recorded ? audio.file : null };
}

/** The scene playing at second t, and how far into it (0…1). */
export function sceneAt(scenes: TimedScene[], t: number) {
  let index = scenes.findIndex((s) => t < s.start + s.duration);
  if (index < 0) index = scenes.length - 1;
  const scene = scenes[index];
  const progress = Math.min(1, Math.max(0, (t - scene.start) / scene.duration));
  return { index, scene, progress };
}

/** The caption sentence for a point in a scene, by position in the text. */
export function captionAt(say: string, progress: number) {
  const sentences = say.match(/[^.!?]+[.!?]+["”»]?\s*|[^.!?]+$/g) ?? [say];
  const at = progress * say.length;
  let pos = 0;
  for (const sentence of sentences) {
    pos += sentence.length;
    if (at <= pos) return sentence.trim();
  }
  return sentences[sentences.length - 1].trim();
}
