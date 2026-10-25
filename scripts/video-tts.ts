// Records the Uzbek narration of the video lessons with Azure Speech
// (neural voices uz-UZ-SardorNeural and uz-UZ-MadinaNeural) and writes
// public/video-lessons/<id>.mp3 plus src/lib/video-lessons/audio.json.
//
//   AZURE_SPEECH_KEY=… AZURE_SPEECH_REGION=westeurope \
//     npx tsx scripts/video-tts.ts crypto bash
//
// Options (environment): VIDEO_VOICE (default uz-UZ-SardorNeural),
// VIDEO_RATE (SSML prosody rate, default "-4%"). Each scene is cached in
// .video-cache/ by its text, so only changed scenes are recorded again.
// Needs ffmpeg and ffprobe.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { VIDEO_LESSONS } from "../src/lib/video-lessons";
import { sayHash, type LessonAudio } from "../src/lib/video-lessons/types";

const key = process.env.AZURE_SPEECH_KEY;
const region = process.env.AZURE_SPEECH_REGION;
const voice = process.env.VIDEO_VOICE ?? "uz-UZ-SardorNeural";
const rate = process.env.VIDEO_RATE ?? "-4%";
// Silence after each scene, so the pictures can breathe between sentences.
const PAUSE = 0.6;

if (!key || !region) {
  console.error("Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.");
  process.exit(1);
}

const cache = ".video-cache";
mkdirSync(cache, { recursive: true });
mkdirSync("public/video-lessons", { recursive: true });

/** Text as the voice should read it. */
function spoken(say: string) {
  return say
    .replace(/[‘`]/g, "ʻ") // o‘, g‘
    .replace(/’/g, "ʼ") // tutuq belgisi
    .replace(/[“”«»"]/g, "")
    .replace(/\s+—\s+/g, ", ")
    .replace(/&/g, " va ")
    .replace(/</g, " ")
    .replace(/>/g, " ");
}

async function record(say: string, file: string) {
  const ssml = `<speak version="1.0" xml:lang="uz-UZ"><voice name="${voice}"><prosody rate="${rate}">${spoken(say)}</prosody></voice></speak>`;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key!,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
          "User-Agent": "cybervalue-video-tts",
        },
        body: ssml,
      },
    );
    if (res.ok) {
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      return;
    }
    if (attempt >= 4 || (res.status !== 429 && res.status < 500))
      throw new Error(`Azure Speech ${res.status}: ${await res.text()}`);
    await new Promise((r) => setTimeout(r, attempt * 2000));
  }
}

const seconds = (file: string) =>
  Number(
    execFileSync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      file,
    ])
      .toString()
      .trim(),
  );

const audioPath = "src/lib/video-lessons/audio.json";
const audio = JSON.parse(readFileSync(audioPath, "utf8")) as Record<
  string,
  LessonAudio
>;
const ids = process.argv.slice(2);
if (ids.length === 0) ids.push(...Object.keys(VIDEO_LESSONS));

for (const id of ids) {
  const lesson = VIDEO_LESSONS[id];
  if (!lesson) throw new Error(`No video lesson "${id}"`);
  const scenes = lesson.chapters.flatMap((c) => c.scenes);
  const parts: string[] = [];
  const timing: LessonAudio["scenes"] = [];
  for (const [i, scene] of scenes.entries()) {
    const hash = sayHash(scene.say);
    const raw = join(cache, `${voice}-${rate}-${hash}.mp3`);
    if (!existsSync(raw)) {
      console.log(`${id} ${i + 1}/${scenes.length} recording…`);
      await record(scene.say, raw);
    }
    // Pad every scene with silence and re-encode, so the parts join cleanly.
    const padded = join(cache, `${voice}-${rate}-${hash}-pad.wav`);
    execFileSync("ffmpeg", [
      "-y",
      "-loglevel",
      "error",
      "-i",
      raw,
      "-af",
      `apad=pad_dur=${PAUSE}`,
      "-ar",
      "24000",
      "-ac",
      "1",
      padded,
    ]);
    parts.push(padded);
    timing.push({ hash, duration: Math.round(seconds(padded) * 1000) / 1000 });
  }
  const list = join(cache, `${id}.txt`);
  writeFileSync(
    list,
    parts.map((p) => `file '${join(process.cwd(), p)}'`).join("\n"),
  );
  const out = `public/video-lessons/${id}.mp3`;
  execFileSync("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    list,
    "-c:a",
    "libmp3lame",
    "-b:a",
    "64k",
    out,
  ]);
  audio[id] = { file: `/video-lessons/${id}.mp3`, scenes: timing };
  const total = timing.reduce((a, s) => a + s.duration, 0);
  console.log(`${id}: ${out}, ${(total / 60).toFixed(1)} min`);
}

writeFileSync(audioPath, `${JSON.stringify(audio, null, 2)}\n`);
