"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Code2,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { LearningTrack } from "@/lib/learning";

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("pageshow", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("pageshow", listener);
  };
}

function readProgress(key: string) {
  try {
    return window.localStorage.getItem(key) ?? "{}";
  } catch {
    return "{}";
  }
}

function TrackCard({ track, query }: { track: LearningTrack; query: string }) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readProgress(track.progressKey),
    () => "{}",
  );
  let completed: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
      completed = parsed as Record<string, unknown>;
  } catch {
    /* Damaged browser records should not prevent learning. */
  }
  const done = track.lessons.filter(
    (lesson) => completed[lesson.id] === true,
  ).length;
  const next =
    track.lessons.find((lesson) => completed[lesson.id] !== true) ??
    track.lessons[0];
  const Icon = track.id === "html" ? Code2 : ShieldCheck;
  const matches = query
    ? track.lessons.filter((lesson) =>
        lesson.title.toLowerCase().includes(query),
      )
    : [];
  return (
    <article className={`learn-card learn-card-${track.id}`}>
      <div className="learn-card-top">
        <span className="learn-icon">
          <Icon size={25} />
        </span>
        <span className="learn-level">{track.level}</span>
      </div>
      <div className="learn-meta">
        {track.category} <span> / </span> {track.lessons.length} lessons
      </div>
      <h3>{track.title}</h3>
      <p>{track.description}</p>
      <div className="learn-modules">
        {track.modules.map((module) => (
          <span key={module}>
            <Check size={13} />
            {module}
          </span>
        ))}
      </div>
      {matches.length > 0 && (
        <ul
          className="learn-matches"
          aria-label={`${track.title} matching lessons`}
        >
          {matches.map((lesson) => (
            <li key={lesson.id}>
              <Link href={`${track.href}#lesson/${lesson.id}`}>
                <span>
                  {String(lesson.id).padStart(2, "0")} · {lesson.title}
                </span>
                <ArrowUpRight size={14} />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="learn-card-bottom">
        <div className="learn-progress-label">
          <span>
            {done === track.lessons.length
              ? "Track completed"
              : done > 0
                ? "Your progress"
                : "Ready when you are"}
          </span>
          <span>
            {done} / {track.lessons.length}
          </span>
        </div>
        <progress
          className="learn-progress"
          value={done}
          max={track.lessons.length}
          aria-label={`${track.title} progress`}
        />
        <Link className="learn-launch" href={`${track.href}#lesson/${next.id}`}>
          <span>
            {done === track.lessons.length
              ? "Review the track"
              : done > 0
                ? `Continue · ${next.title}`
                : "Start learning"}
          </span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </article>
  );
}

export function LearningCatalog({ tracks }: { tracks: LearningTrack[] }) {
  const [category, setCategory] = useState("All tracks");
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visible = tracks.filter(
    (track) =>
      (category === "All tracks" || track.category === category) &&
      (!query ||
        [
          track.title,
          track.description,
          ...track.modules,
          ...track.lessons.map((lesson) => lesson.title),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)),
  );
  return (
    <div className="learning-catalog">
      <div className="learn-toolbar">
        <div
          className="learn-filters"
          role="group"
          aria-label="Filter learning tracks"
        >
          {["All tracks", "Development", "Security"].map((filter) => (
            <button
              type="button"
              key={filter}
              aria-pressed={category === filter}
              onClick={() => setCategory(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <label className="learn-search">
          <Search size={17} />
          <input
            type="search"
            aria-label="Search tracks and lessons"
            placeholder="Search a topic or lesson…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            maxLength={120}
          />
        </label>
      </div>
      <p className="learn-results" role="status">
        {visible.length} {visible.length === 1 ? "track" : "tracks"}
        {query ? ` matching “${search.trim()}”` : " · Learn at your own pace"}
      </p>
      {visible.length ? (
        <div className="learn-grid">
          {visible.map((track) => (
            <TrackCard key={track.id} track={track} query={query} />
          ))}
        </div>
      ) : (
        <div className="learn-empty">
          <BookOpen size={28} />
          <h3>No matching tracks</h3>
          <p>Try HTML, HTTP, authentication, or another topic.</p>
          <button
            className="button button-secondary"
            onClick={() => {
              setSearch("");
              setCategory("All tracks");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <p className="learn-storage-note">
        Progress is saved in this browser. No account needed for practice.
      </p>
    </div>
  );
}
