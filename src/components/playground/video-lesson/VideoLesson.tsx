"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { SceneView } from "./scenes";
import { lessonAudio, videoLesson } from "@/lib/video-lessons";
import { captionAt, sceneAt, timeline } from "@/lib/video-lessons/types";
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
  const { scenes, total, audio } = timeline(lesson, lessonAudio(id));
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [speed, setSpeed] = useState(1);
  const sound = useRef<HTMLAudioElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const last = useRef<number | null>(null);

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
    const tick = (now: number) => {
      if (sound.current && audio) {
        setTime(sound.current.currentTime);
        if (sound.current.ended) setPlaying(false);
      } else {
        const step = last.current === null ? 0 : (now - last.current) / 1000;
        last.current = now;
        setTime((old) => {
          const next = old + step * speed;
          if (next >= total) {
            setPlaying(false);
            return total;
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
  }, [playing, audio, speed, total]);

  useEffect(() => {
    if (sound.current) sound.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    if (!render) return;
    window.__videoLesson = {
      total,
      // Resolves once the new frame is painted.
      seek: (to) =>
        new Promise((done) => {
          setTime(to);
          requestAnimationFrame(() => requestAnimationFrame(() => done()));
        }),
    };
    return () => {
      delete window.__videoLesson;
    };
  }, [render, total]);

  const toggle = () => {
    if (playing) {
      sound.current?.pause();
      setPlaying(false);
      return;
    }
    if (time >= total) seek(0);
    if (sound.current && audio) void sound.current.play();
    setPlaying(true);
  };

  const { index, scene, progress } = sceneAt(scenes, time);
  const chapter = lesson.chapters[scene.chapter];
  const caption = captionAt(scene.say, progress);
  const starts = lesson.chapters.map(
    (_, c) => scenes.find((s) => s.chapter === c)!.start,
  );

  const picture = (
    <div className="vl-stage" ref={stage}>
      <div
        className="vl-scene"
        key={index}
        style={{
          opacity: Math.min(
            1,
            (time - scene.start) / 0.35,
            index === scenes.length - 1
              ? 1
              : (scene.start + scene.duration - time) / 0.25,
          ),
        }}
      >
        <SceneView visual={scene.visual} p={progress} />
      </div>
      <BrandLogo className="vl-watermark" />
      <div className="vl-chapter-label">
        <span>{String(scene.chapter + 1).padStart(2, "0")}</span>
        {chapter.title}
      </div>
      {captions && (
        <p className="vl-caption" aria-hidden="true">
          {caption}
        </p>
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
            {!playing && (
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
