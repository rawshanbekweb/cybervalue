"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Captions,
  Maximize,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useT } from "../network-lab/use-t";
import { BrandLogo } from "./BrandLogo";
import { Kibi } from "./Kibi";
import { SceneView } from "./scenes";
import { CafeScene, HostScene, PostcardScene, QuizScene } from "./story";
import { Scene3D } from "./three/Scene3D";
import { lessonAudio, videoLesson } from "@/lib/video-lessons";
import {
  captionAt,
  loudness,
  sceneAt,
  spoken,
  timeline,
  type TimedScene,
} from "@/lib/video-lessons/types";
import "./video-lesson.css";

const SPEEDS = [1, 1.25, 1.5, 0.75];

const clock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

declare global {
  interface Window {
    /** Used by scripts/video-render.mjs to step through the video. */
    __videoLesson?: { total: number; seek: (t: number) => Promise<void> };
  }
}

/**
 * A narrated, animated lesson. The recording (when there is one) is the
 * clock; without it a timer runs and the captions carry the lesson.
 * `render` shows the bare 1280×720 stage for the MP4 renderer.
 */
export function VideoLesson({
  id,
  render = false,
}: {
  id: string;
  render?: boolean;
}) {
  const { t } = useT();
  const lesson = videoLesson(id)!;
  const { scenes, total, audio } = useMemo(
    () => timeline(videoLesson(id)!, lessonAudio(id)),
    [id],
  );
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [speed, setSpeed] = useState(1);
  const sound = useRef<HTMLAudioElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const last = useRef<number | null>(null);
  // The viewer's quiz answers, by scene index.
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const seek = useCallback(
    (to: number) => {
      const next = Math.min(total, Math.max(0, to));
      if (sound.current) sound.current.currentTime = next;
      setTime(next);
    },
    [total],
  );

  // The clock: the audio element when recorded, otherwise frame time.
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    // A quiz waits for the viewer's answer at its end.
    const stopsAt = (t: number) => {
      const { index, scene } = sceneAt(scenes, t);
      return (
        !render &&
        scene.visual.kind === "quiz" &&
        answers[index] === undefined &&
        t >= scene.start + scene.duration - 0.15
      );
    };
    const tick = (now: number) => {
      if (sound.current && audio) {
        const t = sound.current.currentTime;
        setTime(t);
        if (sound.current.ended) setPlaying(false);
        if (stopsAt(t)) {
          sound.current.pause();
          setPlaying(false);
          return;
        }
      } else {
        const step = last.current === null ? 0 : (now - last.current) / 1000;
        last.current = now;
        setTime((old) => {
          const next = old + step * speed;
          if (next >= total || stopsAt(next)) {
            setPlaying(false);
            return Math.min(next, total);
          }
          return next;
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      last.current = null;
    };
  }, [playing, audio, speed, total, scenes, answers, render]);

  useEffect(() => {
    if (sound.current) sound.current.playbackRate = speed;
  }, [speed]);

  // A quiz waits for the viewer's answer at its end.
  const current = sceneAt(scenes, time);
  const waiting =
    !render &&
    current.scene.visual.kind === "quiz" &&
    answers[current.index] === undefined &&
    time >= current.scene.start + current.scene.duration - 0.15;

  useEffect(() => {
    if (!render) return;
    window.__videoLesson = {
      total,
      // Resolves once the new frame is painted.
      seek: (to) =>
        new Promise((done) => {
          setTime(to);
          // Two frames for React to paint, then wait for any 3D scene.
          const ready = () =>
            document.querySelector("[data-3d-loading]")
              ? window.setTimeout(ready, 50)
              : requestAnimationFrame(() => done());
          requestAnimationFrame(() => requestAnimationFrame(ready));
        }),
    };
    return () => {
      delete window.__videoLesson;
    };
  }, [render, total]);

  const choose = (scene: number, option: number) => {
    setAnswers((old) => ({ ...old, [scene]: option }));
    // Carry on with the lesson a moment after the answer shows.
    window.setTimeout(() => {
      if (sound.current && audio) void sound.current.play();
      setPlaying(true);
    }, 1800);
  };

  const toggle = () => {
    if (waiting) return;
    if (playing) {
      sound.current?.pause();
      setPlaying(false);
      return;
    }
    if (time >= total) seek(0);
    if (sound.current && audio) void sound.current.play();
    setPlaying(true);
  };

  const { index, scene, progress } = current;
  const at = time - scene.start;
  const talk = loudness(scene, at);
  const chapter = lesson.chapters[scene.chapter];
  const starts = lesson.chapters.map(
    (_, c) => scenes.find((s) => s.chapter === c)!.start,
  );

  const fadeIn = Math.min(1, at / 0.35);
  const fadeOut =
    index === scenes.length - 1 ? 1 : (scene.duration - at) / 0.25;
  const chapterStart =
    index === 0 || scenes[index - 1].chapter !== scene.chapter;
  const hostless = scene.visual.kind === "host" || scene.host?.hide;
  const picture = (
    <div className="vl-stage" ref={stage}>
      <div
        className="vl-scene"
        key={index}
        style={{
          opacity: Math.min(1, fadeIn, fadeOut),
          transform: `scale(${1 + 0.035 * progress})`,
        }}
      >
        <Visual
          scene={scene}
          index={index}
          progress={progress}
          at={at}
          talk={talk}
          chosen={
            answers[index] ??
            (render &&
            scene.visual.kind === "quiz" &&
            at > spoken(scene) + (scene.hold ?? 0) * 0.6
              ? scene.visual.answer
              : null)
          }
          onChoose={render ? undefined : (i) => choose(index, i)}
        />
      </div>
      {chapterStart && at < 0.7 && (
        <div
          className="vl-wipe"
          style={{
            transform: `translateX(${-110 + (at / 0.7) * 220}%) skewX(-18deg)`,
          }}
          aria-hidden="true"
        />
      )}
      <BrandLogo className="vl-watermark" />
      <div className="vl-chapter-label">
        <span>{String(scene.chapter + 1).padStart(2, "0")}</span>
        {chapter.title}
      </div>
      {!hostless && (
        <Kibi
          className="vl-kibi-corner"
          mood={scene.host?.mood ?? "talk"}
          talk={talk}
          t={time}
        />
      )}
      {captions && at < spoken(scene) + 0.2 && (
        <Caption say={scene.say} progress={Math.min(1, at / spoken(scene))} />
      )}
    </div>
  );

  if (render) return <div className="vl-render">{picture}</div>;

  return (
    <div className="vl-page">
      <Link className="nl-back" href={lesson.href}>
        <ArrowLeft size={15} /> {t("Back to the lab")}
      </Link>
      <header className="vl-head">
        <span className="eyebrow">
          <span className="status-dot" /> {t("VIDEO LESSON")}
        </span>
        <h1>{lesson.title}</h1>
        <p>
          {t("{minutes} min · {chapters} chapters · narrated in Uzbek", {
            minutes: Math.round(total / 60),
            chapters: lesson.chapters.length,
          })}
        </p>
      </header>
      <div className="vl-layout">
        <div className="vl-player">
          <div className="vl-screen" onClick={toggle} role="presentation">
            {picture}
            {!playing && !waiting && (
              <span className="vl-big-play" aria-hidden="true">
                {time >= total ? <RotateCcw /> : <Play />}
              </span>
            )}
          </div>
          {audio && (
            <audio
              ref={sound}
              src={audio}
              preload="metadata"
              onEnded={() => setPlaying(false)}
            />
          )}
          <div className="vl-controls">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? t("Pause") : t("Play")}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <span className="vl-time">
              {clock(time)} / {clock(total)}
            </span>
            <div className="vl-seek">
              <input
                type="range"
                min={0}
                max={Math.ceil(total)}
                step={0.5}
                value={time}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label={t("Position in the video")}
                aria-valuetext={`${clock(time)} / ${clock(total)}`}
              />
              {starts.slice(1).map((start) => (
                <i
                  key={start}
                  style={{ left: `${(start / total) * 100}%` }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <button
              type="button"
              className="vl-speed"
              onClick={() =>
                setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])
              }
              aria-label={t("Playback speed")}
            >
              {speed}×
            </button>
            <button
              type="button"
              onClick={() => setCaptions(!captions)}
              aria-pressed={captions}
              aria-label={t("Captions")}
            >
              <Captions size={18} />
            </button>
            <button
              type="button"
              onClick={() =>
                void stage.current?.parentElement?.requestFullscreen?.()
              }
              aria-label={t("Full screen")}
            >
              <Maximize size={18} />
            </button>
          </div>
          {!audio && (
            <p className="vl-note">
              {t(
                "The narration is being recorded. Until then the video plays with Uzbek captions.",
              )}
            </p>
          )}
        </div>
        <nav className="vl-chapters" aria-label={t("Chapters")}>
          <h2>{t("Chapters")}</h2>
          <ol>
            {lesson.chapters.map((c, i) => (
              <li key={c.title}>
                <button
                  type="button"
                  className={i === scene.chapter ? "on" : ""}
                  aria-current={i === scene.chapter ? "step" : undefined}
                  onClick={() => seek(starts[i])}
                >
                  <span>{clock(starts[i])}</span>
                  {c.title}
                </button>
              </li>
            ))}
          </ol>
          <Link className="nl-primary vl-to-lab" href={lesson.href}>
            {t("Practise in the lab")} <ArrowRight size={15} />
          </Link>
        </nav>
      </div>
      <details className="vl-transcript">
        <summary>{t("Full text of the lesson")}</summary>
        {lesson.chapters.map((c, i) => (
          <section key={c.title} lang="uz">
            <h3>
              {i + 1}. {c.title}
            </h3>
            {c.scenes.map((s) => (
              <p key={s.say}>{s.say}</p>
            ))}
          </section>
        ))}
      </details>
    </div>
  );
}

/** The caption sentence, with the word being spoken picked out. */
function Caption({ say, progress }: { say: string; progress: number }) {
  const sentence = captionAt(say, progress);
  const start = say.indexOf(sentence);
  const local = (progress * say.length - start) / Math.max(1, sentence.length);
  const words = sentence.split(" ");
  const current = Math.min(
    words.length - 1,
    Math.max(0, Math.floor(local * words.length)),
  );
  return (
    <p className="vl-caption" aria-hidden="true">
      {words.map((word, i) => (
        <span key={i} className={i === current ? "on" : undefined}>
          {word}{" "}
        </span>
      ))}
    </p>
  );
}

/** The scene picture: story scenes here, the rest in scenes.tsx. */
function Visual({
  scene,
  index,
  progress,
  at,
  talk,
  chosen,
  onChoose,
}: {
  scene: TimedScene;
  index: number;
  progress: number;
  at: number;
  talk: number;
  chosen: number | null;
  onChoose?: (option: number) => void;
}) {
  const visual = scene.visual;
  switch (visual.kind) {
    case "cafe":
      return <CafeScene mode={visual.mode} p={progress} />;
    case "postcard":
      return <PostcardScene p={progress} />;
    case "3d":
      return (
        <Scene3D
          shot={visual.shot}
          p={progress}
          t={at}
          talk={talk}
          fallback={
            <HostScene
              title="Kibi"
              subtitle="3D sahna bu qurilmada ochilmadi"
              mood="happy"
              p={progress}
              t={at}
              talk={talk}
            />
          }
        />
      );
    case "host":
      return (
        <HostScene
          title={visual.title}
          subtitle={visual.subtitle}
          mood={visual.mood}
          p={progress}
          t={at}
          talk={talk}
        />
      );
    case "quiz": {
      const left = scene.duration - at;
      return (
        <QuizScene
          key={index}
          question={visual.question}
          options={visual.options}
          answer={visual.answer}
          p={progress}
          chosen={chosen}
          onChoose={onChoose}
          countdown={
            at > spoken(scene) && chosen === null
              ? Math.max(1, Math.ceil(left))
              : null
          }
        />
      );
    }
    default:
      return <SceneView visual={visual} p={progress} />;
  }
}
