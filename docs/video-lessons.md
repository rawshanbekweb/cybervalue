# Video lessons

Narrated, animated lessons at `/akademiya/<lab>/video` (now `crypto` and `bash`). The lab page links to its video from the hero.

- **Content** — `src/lib/video-lessons/<lab>.ts`: chapters of scenes; each scene is the Uzbek narration (`say`) and a picture (`visual`). The pictures are React components in `src/components/playground/video-lesson/scenes.tsx`, drawn from the scene's progress (0…1) only, so the player can seek and the renderer can step frame by frame.
- **Timing** — with a recording, each scene lasts as long as its audio (`src/lib/video-lessons/audio.json`, matched by a hash of the text). Without one, or when a text changed after recording, the length is estimated (about 14 characters a second) and the video plays with captions only, with a note under the player.
- **Player** — play/pause, seek bar with chapter marks, chapter list, speed, captions, full screen, and the full text of the lesson below for reading and screen readers.

## Story, Kibi, quizzes, 3D and sound

- **Kibi** (`Kibi.tsx`) hosts from the corner; his mouth follows the voice loudness stored in `audio.json` (`env`, one digit per 80 ms). A scene sets his mood or hides him with `host`.
- **Story scenes** (`story.tsx`): the café with Ali and Jasur, the postcard, Kibi's host scene and the **quiz** card. A quiz scene has `hold` seconds of quiet after the question; on the site the video stops there until the viewer answers, in the MP4 it counts down and shows the answer.
- **3D shots** (`three/`, three.js, loaded only for 3D scenes): `world.ts` holds the shared pieces (Kibi in 3D, devices, labels, bloom setup) and the first shots, `shots-https.ts` and `shots-http.ts` the lesson shots, `render.ts` the registry. A scene is `{ kind: "3d", shot, stage }`; every shot is posed from progress, so seeking and frame-by-frame rendering work. Without WebGL a 2D scene stands in.
- **Sound**: `scripts/video-sounds.py` synthesises a music loop and effects (whoosh, pop, alarm, type, ding, magic) into `.video-cache/sounds`; a scene lists `sfx` at points of its length, and `video-tts.ts` mixes them in, ducking the music under the voice.

## Recording the narration

Microsoft's Uzbek neural voice (an earlier option) (`uz-UZ-SardorNeural`, or `uz-UZ-MadinaNeural` with `VIDEO_VOICE`):

```sh
AZURE_SPEECH_KEY=… AZURE_SPEECH_REGION=westeurope npx tsx scripts/video-tts.ts crypto bash
```

Without an Azure key the script uses the same voices through Edge's read-aloud service (`pip install edge-tts`, host `speech.platform.bing.com` allowed): `npx tsx scripts/video-tts.ts crypto bash`. That service is unofficial and may change; the official API is the dependable route. Either way it records each scene (cached in `.video-cache/`, so only changed scenes are recorded again), adds a short pause after each, joins them into `public/video-lessons/<lab>.mp3` and writes `audio.json`. Commit both. Changing a scene's text later needs another run.

### Navoiy (open model, used now)

The narration on the site is recorded with [Navoiy TTS](https://huggingface.co/aisha-org/navoiy-tts) (Apache-2.0, Aisha), an Uzbek model on CosyVoice2-0.5B. It speaks in the voice of a short reference clip; the current one is a male voice cut from CosyVoice's `asset/cross_lingual_prompt.wav`, calm style.

1. Set up once in a folder (`NAVOIY_HOME`): clone `FunAudioLLM/CosyVoice` (with submodules), download `aisha-org/navoiy-tts` into `navoiy/`, and `FunAudioLLM/CosyVoice2-0.5B` plus `emotion_600h_joint.pt` into `models/`. Python 3.11 with CosyVoice's requirements (torch 2.3.1, openai-whisper, …).
2. `npx tsx scripts/video-tts.ts --lines lines.json` writes each scene's hash and text.
3. `NAVOIY_HOME=… python scripts/navoiy-tts.py lines.json recordings/ reference.wav calm` records one WAV per scene (skips ones already there). On CPU it takes about 8–10 seconds per second of speech.
4. `VIDEO_AUDIO_DIR=recordings npx tsx scripts/video-tts.ts crypto bash` joins them into the lesson MP3s and `audio.json`.

## MP4

For YouTube, Telegram or offline classes, with the site running locally:

```sh
npx tsx scripts/video-render.ts crypto http://localhost:3000
```

It steps through `/akademiya/<lab>/video?render=1` at 25 fps (1280×720) and writes `out/video-lessons/<lab>.mp4` with the recorded narration. `VIDEO_SECONDS=20` renders only the start.

## Adding a lesson

Write `src/lib/video-lessons/<lab>.ts`, add it to `VIDEO_LESSONS` in `index.ts`, add the page `src/app/[lang]/akademiya/<lab>/video/page.tsx` and the sitemap entry, pass `video="/akademiya/<lab>/video"` to the lab's `AnimLab`, and record the narration. `tests/video-lessons.test.ts` checks each lesson runs 5–15 minutes.
