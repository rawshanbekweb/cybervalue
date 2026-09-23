"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { LESSONS, groupFor, type Lesson } from "./lessons.data";
import { PRACTICE_RENDERERS, Fallback } from "./renderers";
import { apiCall } from "./api";
import { downloadText, PROGRESS_KEY, NOTES_KEY } from "./storage";
import { onToast } from "./toast";
import { useLocalStorageState } from "../useLocalStorageState";
import { useHashLessonId } from "../useHashLessonId";
import "./security-lab.css";

const TOTAL = LESSONS.length;

export function SecurityLab() {
  const [lessonId, goToHash] = useHashLessonId(TOTAL, 1);
  const [tab, setTab] = useState<"practice" | "theory" | "teacher">("practice");
  const [completed, setCompletedStored] = useLocalStorageState<Record<number, boolean>>(PROGRESS_KEY, {});
  const [notes, setNotesStored] = useLocalStorageState<Record<number, string>>(NOTES_KEY, {});
  const [search, setSearch] = useState("");
  const [present, setPresent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [connection, setConnection] = useState<"connecting" | "online" | "offline">("connecting");
  const [toast, setToast] = useState("");

  useEffect(() => {
    apiCall("GET", "/api/lab/health").then((res) => setConnection(res.ok ? "online" : "offline"));
  }, []);

  useEffect(() => onToast((message) => setToast(message)), []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const lesson = useMemo<Lesson>(() => LESSONS.find((l) => l.id === lessonId) ?? LESSONS[0], [lessonId]);
  const group = groupFor(lesson.id);

  const goTo = (id: number) => {
    goToHash(id);
    setTab("practice");
    setMenuOpen(false);
  };

  const toggleComplete = () => {
    const next = { ...completed };
    if (next[lesson.id]) delete next[lesson.id];
    else next[lesson.id] = true;
    setCompletedStored(next);
    if (next[lesson.id] && lesson.id < TOTAL) {
      setToast("Lesson marked as reviewed. Moving to the next one.");
      setTimeout(() => goTo(lesson.id + 1), 500);
    }
  };

  const updateNote = (value: string) => {
    setNotesStored({ ...notes, [lesson.id]: value });
  };

  const term = search.trim().toLowerCase();
  const visibleLessons = LESSONS.filter(
    (l) => !term || l.title.toLowerCase().includes(term) || l.heading.toLowerCase().includes(term),
  );

  const Renderer = PRACTICE_RENDERERS[lesson.type] ?? Fallback;
  const doneCount = Object.keys(completed).length;

  return (
    <div className={`lab-root${present ? " lab-present" : ""}`}>
      <aside className={`lab-sidebar${menuOpen ? " open" : ""}`}>
        <a
          className="lab-brand"
          href="#lesson/1"
          onClick={(e) => {
            e.preventDefault();
            goTo(1);
          }}
        >
          <span className="lab-brand-icon">
            W<span>·</span>
          </span>
          <span>
            Web Security Lab
            <span className="lab-brand-sub">INTERACTIVE COURSE</span>
          </span>
        </a>
        <div className="lab-course-label">LEARNING TRACK</div>
        <div className="lab-course-name">
          Web Application
          <br />
          Security <span className="lab-version">01</span>
        </div>
        <div className="lab-search-wrap">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search lessons…"
            aria-label="Search lessons"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <nav aria-label="Lesson sections" className="lab-lesson-nav">
          {visibleLessons.length === 0 && <div className="lab-empty-search">Nothing found.</div>}
          {visibleLessons.map((l, i) => {
            const g = groupFor(l.id);
            const showGroup = i === 0 || groupFor(visibleLessons[i - 1].id).title !== g.title;
            return (
              <div key={l.id}>
                {showGroup && <div className="lab-nav-group">{g.title}</div>}
                <button
                  type="button"
                  className={`lab-nav-item${l.id === lessonId ? " active" : ""}`}
                  onClick={() => goTo(l.id)}
                >
                  <span className="lab-nav-number">{String(l.id).padStart(2, "0")}</span>
                  <span>{l.title}</span>
                  {completed[l.id] && <span className="lab-nav-check">✓</span>}
                </button>
              </div>
            );
          })}
        </nav>
        <div className="lab-sidebar-bottom">
          <div className="lab-progress-caption">
            <span>Your progress</span>
            <strong>
              {doneCount} / {TOTAL}
            </strong>
          </div>
          <div className="lab-progress-track">
            <i style={{ width: `${Math.round((doneCount / TOTAL) * 100)}%` }} />
          </div>
          <span className="lab-save-hint">Progress is saved in this browser</span>
        </div>
      </aside>
      <div className="lab-workspace">
        <header className="lab-topbar">
          <div className="lab-breadcrumb">
            <button
              type="button"
              className="lab-icon-button lab-mobile-menu"
              aria-label="Open menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              ☰
            </button>
            <span>Learning lab</span>
            <span className="lab-slash">/</span>
            <b>{lesson.title}</b>
          </div>
          <div className="lab-top-actions">
            <span className={`lab-connection${connection === "offline" ? " offline" : ""}`}>
              <i />
              {connection === "connecting" ? "Connecting" : connection === "online" ? "Connected" : "Server not found"}
            </span>
            <button type="button" className="lab-quiet-button" onClick={() => setPresent((v) => !v)}>
              <span>▣</span> Presentation mode
            </button>
          </div>
        </header>
        <main>
          <div className="lab-page-eyebrow">
            <span className="lab-mini-dot" /> FROM THEORY TO PRACTICE
            <span className="lab-edition">36 LESSONS</span>
          </div>
          <section className="lab-hero">
            <div>
              <p className="lab-overline">WEB APPLICATION SECURITY</p>
              <h1>
                Understand the system.
                <br />
                <span>See security in practice.</span>
              </h1>
              <p className="lab-hero-description">
                Learn the path from browser to database.
                <br />
                Send a request, watch the result, and put the defenses to the test.
              </p>
              <div className="lab-hero-tags">
                <span>
                  <i className="lab-live-dot" /> A real local API
                </span>
                <span>↔ Interactive exercises</span>
                <span>⌘ Teacher&apos;s notes</span>
              </div>
            </div>
          </section>
          <div className="lab-stat-strip">
            <div>
              <span className="lab-stat-icon">▦</span>
              <b>36</b>
              <span>short exercises</span>
            </div>
            <div>
              <span className="lab-stat-icon">⇄</span>
              <b>Real HTTP</b>
              <span>request &amp; response</span>
            </div>
            <div>
              <span className="lab-stat-icon">◇</span>
              <b>3 vulnerabilities</b>
              <span>SQLi · XSS · IDOR</span>
            </div>
            <div>
              <span className="lab-stat-icon">◎</span>
              <b>Localhost</b>
              <span>learning sandbox</span>
            </div>
          </div>
          <section className="lab-lesson-section">
            <div className="lab-section-heading">
              <div>
                <span className="lab-overline lab-teal">{group.title}</span>
                <h2>{lesson.heading}</h2>
              </div>
              <div className="lab-lesson-controls">
                <span>
                  {lesson.id} / {TOTAL}
                </span>
                <button
                  type="button"
                  className="lab-icon-button"
                  aria-label="Previous lesson"
                  disabled={lesson.id <= 1}
                  onClick={() => goTo(lesson.id - 1)}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="lab-icon-button"
                  aria-label="Next lesson"
                  disabled={lesson.id >= TOTAL}
                  onClick={() => goTo(lesson.id + 1)}
                >
                  →
                </button>
              </div>
            </div>
            <div className="lab-lesson-layout">
              <article className="lab-lesson-card">
                <div className="lab-tabs" role="tablist">
                  <button
                    type="button"
                    className={`lab-tab${tab === "practice" ? " active" : ""}`}
                    role="tab"
                    aria-selected={tab === "practice"}
                    onClick={() => setTab("practice")}
                  >
                    ⌘ Practice
                  </button>
                  <button
                    type="button"
                    className={`lab-tab${tab === "theory" ? " active" : ""}`}
                    role="tab"
                    aria-selected={tab === "theory"}
                    onClick={() => setTab("theory")}
                  >
                    ▤ Quick theory
                  </button>
                  <button
                    type="button"
                    className={`lab-tab${tab === "teacher" ? " active" : ""}`}
                    role="tab"
                    aria-selected={tab === "teacher"}
                    onClick={() => setTab("teacher")}
                  >
                    ♧ For teachers
                  </button>
                </div>
                <div className="lab-lesson-content">
                  {tab === "theory" && (
                    <>
                      <div className="lab-eyebrow">
                        <span className="lab-badge">▤ THEORY</span>
                      </div>
                      <div className="lab-theory-text">
                        {lesson.theory.map((p) => (
                          <p key={p}>{p}</p>
                        ))}
                      </div>
                      <div className="lab-callout">
                        <b>Discussion question:</b> {lesson.question}
                      </div>
                    </>
                  )}
                  {tab === "teacher" && (
                    <>
                      <div className="lab-eyebrow">
                        <span className="lab-badge">♧ FOR TEACHERS</span>
                      </div>
                      <div className="lab-teacher-step">{lesson.teacher}</div>
                      <div className="lab-teacher-timing">
                        <span>⏱ {lesson.minutes} min</span>
                        <span>{group.title}</span>
                      </div>
                      <div className="lab-callout">
                        <b>Closing question:</b> {lesson.question}
                      </div>
                    </>
                  )}
                  {tab === "practice" && (
                    <>
                      <div className="lab-eyebrow">
                        <span className={`lab-badge${lesson.real ? "" : " sim"}`}>
                          {lesson.real ? "⌘ REAL API" : "◇ SIMULATION"}
                        </span>
                      </div>
                      <h3>{lesson.heading}</h3>
                      <p className="lab-intro">{lesson.intro}</p>
                      <div key={lesson.id}>
                        <Renderer lesson={lesson} />
                      </div>
                    </>
                  )}
                </div>
                <div className="lab-lesson-footer">
                  <span>{completed[lesson.id] ? "You marked this lesson as reviewed. Try a mission to verify your skills." : "Self-paced review. Missions verify your work with evidence and tests."}</span>
                  <button type="button" className="lab-primary-button" onClick={toggleComplete}>
                    {completed[lesson.id] ? "Reviewed" : "Mark as reviewed"} <span>✓</span>
                  </button>
                </div>
              </article>
              <aside className="lab-right-column">
                <section className="lab-mission-card">
                  <span className="lab-overline">YOUR MISSION</span>
                  <h3>{lesson.task}</h3>
                  <p>{lesson.mission}</p>
                  <div className="lab-mission-divider" />
                  <span className="lab-overline">EXPECTED OUTCOME</span>
                  <p>{lesson.result}</p>
                  <span className="lab-time-pill">⏱ {lesson.minutes} min</span>
                </section>
                <section className="lab-principle-card">
                  <span>◇</span>
                  <h3>Remember this</h3>
                  <p>{lesson.principle}</p>
                </section>
                <details className="lab-notes-card">
                  <summary>✎ Personal notes</summary>
                  <textarea
                    placeholder="What did you learn from this exercise?"
                    aria-label="Personal notes"
                    value={notes[lesson.id] ?? ""}
                    onChange={(e) => updateNote(e.target.value)}
                  />
                  <button
                    type="button"
                    className="lab-quiet-button"
                    onClick={() =>
                      downloadText(
                        `security-lab-lesson-${lesson.id}-notes.md`,
                        `# ${lesson.title}\n\n${notes[lesson.id] || "(no notes)"}\n`,
                      )
                    }
                  >
                    Download notes ↓
                  </button>
                </details>
              </aside>
            </div>
          </section>
          <section className="lab-journey">
            <div>
              <span className="lab-overline lab-teal">LEARNING MAP</span>
              <h2>One request. The whole architecture.</h2>
            </div>
            <div className="lab-journey-steps">
              {[
                [5, "01", "Frontend", "Display"],
                [8, "02", "HTTP / API", "Communication"],
                [15, "03", "Backend", "Decision"],
                [20, "04", "Database", "Storage"],
                [27, "05", "Security", "Trust"],
              ].map(([jump, num, title, sub], i, arr) => (
                <Fragment key={jump}>
                  <button type="button" onClick={() => goTo(Number(jump))}>
                    <span>{num}</span> {title} <small>{sub}</small>
                  </button>
                  {i < arr.length - 1 && <i>→</i>}
                </Fragment>
              ))}
            </div>
          </section>
          <footer className="lab-page-footer">
            <span>
              <b>Web Security Lab.</b> Knowledge is reinforced through practice.
            </span>
            <span>
              A local lab running on synthetic data only <i className="lab-live-dot" />
            </span>
          </footer>
        </main>
      </div>
      <div className={`lab-toast${toast ? " visible" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}
