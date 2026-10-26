import audio from "./audio.json";
import { BASH_VIDEO } from "./bash";
import { CRYPTO_VIDEO } from "./crypto";
import { HTTP_VIDEO } from "./http";
import { HTTPS_VIDEO } from "./https";
import type { LessonAudio, VideoLesson } from "./types";

// Every video lesson, by lab id. audio.json is written by
// scripts/video-tts.mjs once the narration is recorded.
export const VIDEO_LESSONS: Record<string, VideoLesson> = {
  httpbasics: HTTP_VIDEO,
  https: HTTPS_VIDEO,
  crypto: CRYPTO_VIDEO,
  bash: BASH_VIDEO,
};

export const videoLesson = (id: string) => VIDEO_LESSONS[id] ?? null;

export const lessonAudio = (id: string): LessonAudio | undefined =>
  (audio as Record<string, LessonAudio>)[id];
