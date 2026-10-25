# Video lessons

Narrated, animated lessons at `/akademiya/<lab>/video` (now `crypto` and `bash`). The lab page links to its video from the hero.

- **Content** — `src/lib/video-lessons/<lab>.ts`: chapters of scenes; each scene is the Uzbek narration (`say`) and a picture (`visual`). The pictures are React components in `src/components/playground/video-lesson/scenes.tsx`, drawn from the scene's progress (0…1) only, so the player can seek and the renderer can step frame by frame.
- **Timing** — with a recording, each scene lasts as long as its audio (`src/lib/video-lessons/audio.json`, matched by a hash of the text). Without one, or when a text changed after recording, the length is estimated (about 14 characters a second) and the video plays with captions only, with a note under the player.
- **Player** — play/pause, seek bar with chapter marks, chapter list, speed, captions, full screen, and the full text of the lesson below for reading and screen readers.

## Recording the narration

The voice is Azure Speech's Uzbek neural voice (`uz-UZ-SardorNeural`, or `uz-UZ-MadinaNeural` with `VIDEO_VOICE`):

```sh
AZURE_SPEECH_KEY=… AZURE_SPEECH_REGION=westeurope npx tsx scripts/video-tts.ts crypto bash
```

Without an Azure key the script uses the same voices through Edge's read-aloud service (`pip install edge-tts`, host `speech.platform.bing.com` allowed): `npx tsx scripts/video-tts.ts crypto bash`. That service is unofficial and may change; the official API is the dependable route. Either way it records each scene (cached in `.video-cache/`, so only changed scenes are recorded again), adds a short pause after each, joins them into `public/video-lessons/<lab>.mp3` and writes `audio.json`. Commit both. Changing a scene's text later needs another run.

## MP4

For YouTube, Telegram or offline classes, with the site running locally:

```sh
npx tsx scripts/video-render.ts crypto http://localhost:3000
```

It steps through `/akademiya/<lab>/video?render=1` at 25 fps (1280×720) and writes `out/video-lessons/<lab>.mp4` with the recorded narration. `VIDEO_SECONDS=20` renders only the start.

## Adding a lesson

Write `src/lib/video-lessons/<lab>.ts`, add it to `VIDEO_LESSONS` in `index.ts`, add the page `src/app/[lang]/akademiya/<lab>/video/page.tsx` and the sitemap entry, pass `video="/akademiya/<lab>/video"` to the lab's `AnimLab`, and record the narration. `tests/video-lessons.test.ts` checks each lesson runs 5–15 minutes.
