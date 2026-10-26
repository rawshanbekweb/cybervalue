// Renders a video lesson to MP4 (1280×720, 25 fps) with its recorded
// narration, for YouTube, Telegram or offline classes. Start the site first
// (npm run build && npm start), then:
//
//   npx tsx scripts/video-render.ts crypto [http://localhost:3000]
//
// Writes out/video-lessons/<id>.mp4. Set CHROMIUM_PATH to use a browser
// other than Playwright's own. Needs ffmpeg.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";
import { lessonAudio, videoLesson } from "../src/lib/video-lessons";
import { timeline } from "../src/lib/video-lessons/types";

const [id, base = "http://localhost:3000"] = process.argv.slice(2);
const FPS = 25;

const lesson = id ? videoLesson(id) : null;
if (!lesson) {
  console.error(
    "Usage: npx tsx scripts/video-render.ts <crypto|bash> [base url]",
  );
  process.exit(1);
}
const { audio } = timeline(lesson, lessonAudio(id));
if (!audio)
  console.warn("No matching narration (audio.json): rendering without sound.");

mkdirSync("out/video-lessons", { recursive: true });
const out = `out/video-lessons/${id}.mp4`;
const sound = audio ? `public${audio}` : null;
if (sound && !existsSync(sound)) throw new Error(`Missing ${sound}`);

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  // WebGL for the 3D scenes, in software when there is no GPU.
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(`${base}/akademiya/${id}/video?render=1`);
await page.waitForFunction(() => window.__videoLesson !== undefined);
const full = await page.evaluate(() => window.__videoLesson!.total);
// VIDEO_SECONDS renders only the start, for a quick look.
const total = Math.min(full, Number(process.env.VIDEO_SECONDS) || full);

const ffmpeg = spawn(
  "ffmpeg",
  [
    "-y",
    "-loglevel",
    "error",
    "-f",
    "image2pipe",
    "-framerate",
    String(FPS),
    "-i",
    "-",
    ...(sound ? ["-i", sound] : []),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "medium",
    "-crf",
    "22",
    ...(sound ? ["-c:a", "aac", "-b:a", "96k", "-shortest"] : []),
    "-movflags",
    "+faststart",
    out,
  ],
  { stdio: ["pipe", "inherit", "inherit"] },
);

const frames = Math.ceil(total * FPS);
const stage = page.locator(".vl-stage");
for (let f = 0; f < frames; f++) {
  await page.evaluate((t) => window.__videoLesson!.seek(t), f / FPS);
  const shot = await stage.screenshot({ type: "jpeg", quality: 92 });
  if (!ffmpeg.stdin.write(shot))
    await new Promise((r) => ffmpeg.stdin.once("drain", r));
  if (f % (FPS * 30) === 0)
    console.log(`${id}: ${Math.round((f / frames) * 100)}%`);
}
ffmpeg.stdin.end();
await new Promise((r) => ffmpeg.on("close", r));
await browser.close();
console.log(`${id}: ${out}`);
