// Records the Uzbek narration of the video lessons with Microsoft's neural
// voices uz-UZ-SardorNeural and uz-UZ-MadinaNeural, and writes
// public/video-lessons/<id>.mp3 plus src/lib/video-lessons/audio.json.
//
// With an Azure Speech key (the official service):
//   AZURE_SPEECH_KEY=… AZURE_SPEECH_REGION=westeurope \
//     npx tsx scripts/video-tts.ts crypto bash
// Without one, the same voices through Edge's read-aloud service (no
// account; needs `pip install edge-tts` and speech.platform.bing.com):
//   npx tsx scripts/video-tts.ts crypto bash
//
// Narration recorded elsewhere (for example with the open Navoiy TTS model,
// see docs/video-lessons.md): put one WAV per scene, named by the scene's
// text hash, in a folder and pass VIDEO_AUDIO_DIR=that/folder.
//
// Options (environment): VIDEO_VOICE (default uz-UZ-SardorNeural),
// VIDEO_RATE (SSML prosody rate, default "-4%"). Each scene is cached in
// .video-cache/ by its text, so only changed scenes are recorded again.
// Needs ffmpeg and ffprobe.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { VIDEO_LESSONS } from "../src/lib/video-lessons";
import {
  estimate,
  sayHash,
  type LessonAudio,
} from "../src/lib/video-lessons/types";

const key = process.env.AZURE_SPEECH_KEY;
const region = process.env.AZURE_SPEECH_REGION;
const voice = process.env.VIDEO_VOICE ?? "uz-UZ-SardorNeural";
const rate = process.env.VIDEO_RATE ?? "-4%";
// Silence after each scene, so the pictures can breathe between sentences.
const PAUSE = 0.6;

const azure = Boolean(key && region);
const recorded = process.env.VIDEO_AUDIO_DIR;
console.log(
  recorded
    ? `recordings from ${recorded}`
    : azure
      ? `Azure Speech (${region}), ${voice}`
      : `edge-tts, ${voice}`,
);

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
  if (!azure) {
    // aiohttp ignores HTTPS_PROXY unless told; pass it on when set.
    const proxy = process.env.HTTPS_PROXY ?? process.env.https_proxy;
    execFileSync("python3", [
      "-m",
      "edge_tts",
      ...(proxy ? ["--proxy", proxy] : []),
      "--voice",
      voice,
      `--rate=${rate}`,
      "--text",
      spoken(say),
      "--write-media",
      file,
    ]);
    return;
  }
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
const args = process.argv.slice(2);
// --lines file.json writes every scene's hash and text, for recording elsewhere.
const linesAt = args.indexOf("--lines");
if (linesAt >= 0) {
  const lines = Object.values(VIDEO_LESSONS).flatMap((lesson) =>
    lesson.chapters.flatMap((c) =>
      c.scenes.map((s) => ({ id: sayHash(s.say), text: s.say })),
    ),
  );
  writeFileSync(args[linesAt + 1], JSON.stringify(lines, null, 1));
  console.log(`${lines.length} scenes → ${args[linesAt + 1]}`);
  process.exit(0);
}
const ids = args;
if (ids.length === 0) ids.push(...Object.keys(VIDEO_LESSONS));

/** Voice loudness every 80 ms as digits 0–9, from a 16-bit mono WAV. */
function envelope(file: string) {
  const wav = readFileSync(file);
  let at = 12;
  while (at < wav.length && wav.toString("ascii", at, at + 4) !== "data")
    at += 8 + wav.readUInt32LE(at + 4);
  const pcm = wav.subarray(at + 8);
  const step = 24000 * 0.08;
  const rms: number[] = [];
  for (let i = 0; i + 2 <= pcm.length; i += step * 2) {
    let sum = 0;
    let n = 0;
    for (let k = i; k < Math.min(pcm.length - 1, i + step * 2); k += 2) {
      const v = pcm.readInt16LE(k) / 32768;
      sum += v * v;
      n++;
    }
    rms.push(Math.sqrt(sum / Math.max(1, n)));
  }
  const top =
    [...rms].sort((a, b) => a - b)[Math.floor(rms.length * 0.95)] || 1;
  return rms
    .map((v) => String(Math.min(9, Math.round((v / top) * 9))))
    .join("");
}

const sounds = process.env.VIDEO_SOUNDS ?? join(cache, "sounds");

for (const id of ids) {
  const lesson = VIDEO_LESSONS[id];
  if (!lesson) throw new Error(`No video lesson "${id}"`);
  const scenes = lesson.chapters.flatMap((c) => c.scenes);
  const parts: string[] = [];
  const timing: LessonAudio["scenes"] = [];
  const effects: { at: number; name: string }[] = [];
  let clock = 0;
  for (const [i, scene] of scenes.entries()) {
    const hash = sayHash(scene.say);
    let raw = recorded
      ? join(recorded, `${hash}.wav`)
      : join(cache, `${voice}-${rate}-${hash}.mp3`);
    if (recorded && !existsSync(raw)) {
      if (!process.env.VIDEO_ALLOW_MISSING)
        throw new Error(`${id} ${i + 1}: no recording ${raw}`);
      // A draft: silence where a recording is still missing (kept in the
      // cache, so the recordings folder only holds real recordings).
      raw = join(cache, `silence-${hash}.wav`);
      execFileSync("ffmpeg", [
        "-y",
        "-loglevel",
        "error",
        "-f",
        "lavfi",
        "-i",
        `anullsrc=r=24000:cl=mono:d=${estimate(scene.say)}`,
        raw,
      ]);
    }
    if (!existsSync(raw)) {
      console.log(`${id} ${i + 1}/${scenes.length} recording…`);
      await record(scene.say, raw);
    }
    // Pad every scene with silence (plus any hold for a quiz) and
    // re-encode, so the parts join cleanly.
    const pad = PAUSE + (scene.hold ?? 0);
    const padded = join(
      cache,
      `${recorded ? "rec" : `${voice}-${rate}`}-${hash}-pad${pad}.wav`,
    );
    execFileSync("ffmpeg", [
      "-y",
      "-loglevel",
      "error",
      "-i",
      raw,
      "-af",
      `apad=pad_dur=${pad}`,
      "-ar",
      "24000",
      "-ac",
      "1",
      "-c:a",
      "pcm_s16le",
      padded,
    ]);
    parts.push(padded);
    const duration = Math.round(seconds(padded) * 1000) / 1000;
    timing.push({ hash, duration, env: envelope(padded) });
    for (const fx of scene.sfx ?? [])
      effects.push({ at: clock + fx.at * duration, name: fx.name });
    clock += duration;
  }
  const list = join(cache, `${id}.txt`);
  writeFileSync(
    list,
    parts.map((p) => `file '${join(process.cwd(), p)}'`).join("\n"),
  );
  const voiceTrack = join(cache, `${id}-voice.wav`);
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
    "pcm_s16le",
    voiceTrack,
  ]);
  // Music under the voice (ducked while it speaks) and the sound effects.
  const music = join(sounds, "music.wav");
  const inputs = ["-i", voiceTrack];
  const filters: string[] = [];
  const mix = ["[0]"];
  if (existsSync(music)) {
    inputs.push("-stream_loop", "-1", "-i", music);
    filters.push(
      `[1]atrim=0:${clock},volume=0.16,afade=t=in:d=2,afade=t=out:st=${Math.max(0, clock - 3)}:d=3[m]`,
      "[m][0]sidechaincompress=threshold=0.02:ratio=8:attack=30:release=500[duck]",
    );
    mix.push("[duck]");
  }
  for (const fx of effects) {
    const file = join(sounds, `${fx.name}.wav`);
    if (!existsSync(file)) continue;
    const n = inputs.filter((x) => x === "-i").length;
    inputs.push("-i", file);
    const ms = Math.round(fx.at * 1000);
    filters.push(`[${n}]adelay=${ms}|${ms},volume=0.45[f${n}]`);
    mix.push(`[f${n}]`);
  }
  filters.push(
    `${mix.join("")}amix=inputs=${mix.length}:normalize=0:duration=first[out]`,
  );
  const out = `public/video-lessons/${id}.mp3`;
  execFileSync("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    ...inputs,
    "-filter_complex",
    filters.join(";"),
    "-map",
    "[out]",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "80k",
    out,
  ]);
  audio[id] = { file: `/video-lessons/${id}.mp3`, scenes: timing };
  console.log(`${id}: ${out}, ${(clock / 60).toFixed(1)} min`);
}

writeFileSync(audioPath, `${JSON.stringify(audio, null, 2)}\n`);
