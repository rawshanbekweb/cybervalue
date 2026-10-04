"use client";

import { useTranslator } from "@/components/locale-provider";
import { Fragment, useEffect, useMemo, useState } from "react";
import { LESSONS, groupFor, type Lesson } from "./lessons.data";
import { PRACTICE_RENDERERS, Fallback } from "./renderers";
import { apiCall } from "./api";
import { downloadText, PROGRESS_KEY, NOTES_KEY } from "./storage";
import { onToast } from "./toast";
import { useLocalStorageState } from "../useLocalStorageState";
import { useHashLessonId } from "../useHashLessonId";
import { lessonRecord } from "@/lib/learning-progress";
import "./security-lab.css";

const TOTAL = LESSONS.length;

export function SecurityLab() {
  const t = useTranslator();
  const [lessonId, goToHash] = useHashLessonId(TOTAL, 1);
  const [tab, setTab] = useState<"practice" | "theory" | "teacher">("practice");
  const [storedProgress, setCompletedStored] = useLocalStorageState<unknown>(
    PROGRESS_KEY,
    {},
  );
  const [storedNotes, setNotesStored] = useLocalStorageState<unknown>(
    NOTES_KEY,
    {},
  );
  const completed = lessonRecord<boolean>(storedProgress, TOTAL, "boolean");
  const notes = lessonRecord<string>(storedNotes, TOTAL, "string");
  const [search, setSearch] = useState("");
  const [present, setPresent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [connection, setConnection] = useState<
    "connecting" | "online" | "offline"
  >("connecting");
  const [toast, setToast] = useState("");

  useEffect(() => {
    apiCall("GET", "/api/lab/health").then((res) =>
      setConnection(res.ok ? "online" : "offline"),
    );
  }, []);

  useEffect(() => onToast((message) => setToast(message)), []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const lesson = useMemo<Lesson>(
    () => LESSONS.find((l) => l.id === lessonId) ?? LESSONS[0],
    [lessonId],
  );
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
      setToast(t("Lesson marked as reviewed. Moving to the next one."));
      setTimeout(() => goTo(lesson.id + 1), 500);
    }
  };

  const updateNote = (value: string) => {
    setNotesStored({ ...notes, [lesson.id]: value });
  };

  const term = search.trim().toLowerCase();
  const visibleLessons = LESSONS.filter(
    (l) =>
      !term ||
      // Match both the source and the translated text.
      [l.title, l.heading, t(l.title), t(l.heading)].some((text) =>
        text.toLowerCase().includes(term),
      ),
  );

  const Renderer = PRACTICE_RENDERERS[lesson.type] ?? Fallback;
  const doneCount = Object.values(completed).filter(
    (value) => value === true,
  ).length;

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
            {t("Web Security Lab")}
            <span className="lab-brand-sub">{t("INTERACTIVE COURSE")}</span>
          </span>
        </a>
        <div className="lab-course-label">{t("LEARNING TRACK")}</div>
        <div className="lab-course-name">
          {t("Web Application")}
          <br />
          {t("Security")} <span className="lab-version">01</span>
        </div>
        <div className="lab-search-wrap">
          <span>⌕</span>
          <input
            type="search"
            placeholder={t("Search lessons…")}
            aria-label={t("Search lessons")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <nav aria-label={t("Lesson sections")} className="lab-lesson-nav">
          {visibleLessons.length === 0 && (
            <div className="lab-empty-search">{t("Nothing found.")}</div>
          )}
          {visibleLessons.map((l, i) => {
            const g = groupFor(l.id);
            const showGroup =
              i === 0 || groupFor(visibleLessons[i - 1].id).title !== g.title;
            return (
              <div key={l.id}>
                {showGroup && <div className="lab-nav-group">{t(g.title)}</div>}
                <button
                  type="button"
                  className={`lab-nav-item${l.id === lessonId ? " active" : ""}`}
                  onClick={() => goTo(l.id)}
                >
                  <span className="lab-nav-number">
                    {String(l.id).padStart(2, "0")}
                  </span>
                  <span>{t(l.title)}</span>
                  {completed[l.id] && <span className="lab-nav-check">✓</span>}
                </button>
              </div>
            );
          })}
        </nav>
        <div className="lab-sidebar-bottom">
          <div className="lab-progress-caption">
            <span>{t("Your progress")}</span>
            <strong>
              {doneCount} / {TOTAL}
            </strong>
          </div>
          <div className="lab-progress-track">
            <i style={{ width: `${Math.round((doneCount / TOTAL) * 100)}%` }} />
          </div>
          <span className="lab-save-hint">
            {t("Progress is saved in this browser")}
          </span>
        </div>
      </aside>
      <div className="lab-workspace">
        <header className="lab-topbar">
          <div className="lab-breadcrumb">
            <button
              type="button"
              className="lab-icon-button lab-mobile-menu"
              aria-label={t("Open menu")}
              onClick={() => setMenuOpen((v) => !v)}
            >
              ☰
            </button>
            <span>{t("Learning lab")}</span>
            <span className="lab-slash">/</span>
            <b>{t(lesson.title)}</b>
          </div>
          <div className="lab-top-actions">
            <span
              className={`lab-connection${connection === "offline" ? " offline" : ""}`}
            >
              <i />
              {connection === "connecting"
                ? t("Connecting")
                : connection === "online"
                  ? t("Connected")
                  : t("Server not found")}
            </span>
            <button
              type="button"
              className="lab-quiet-button"
              onClick={() => setPresent((v) => !v)}
            >
              <span>▣</span> {t("Presentation mode")}
            </button>
          </div>
        </header>
        <div className="lab-content">
          <div className="lab-page-eyebrow">
            <span className="lab-mini-dot" /> {t("FROM THEORY TO PRACTICE")}
            <span className="lab-edition">{t("36 LESSONS")}</span>
          </div>
          <section className="lab-hero">
            <div>
              <p className="lab-overline">{t("WEB APPLICATION SECURITY")}</p>
              <h1>
                {t("Understand the system.")}
                <br />
                <span>{t("See security in practice.")}</span>
              </h1>
              <p className="lab-hero-description">
                {t("Learn the path from browser to database.")}
                <br />
                {t(
                  "Send a request, watch the result, and put the defenses to the test.",
                )}
              </p>
              <div className="lab-hero-tags">
                <span>
                  <i className="lab-live-dot" /> {t("A real local API")}
                </span>
                <span>{t("↔ Interactive exercises")}</span>
                <span>{t("⌘ Teacher's notes")}</span>
              </div>
            </div>
          </section>
          <div className="lab-stat-strip">
            <div>
              <span className="lab-stat-icon">▦</span>
              <b>36</b>
              <span>{t("short exercises")}</span>
            </div>
            <div>
              <span className="lab-stat-icon">⇄</span>
              <b>{t("Real HTTP")}</b>
              <span>{t("request & response")}</span>
            </div>
            <div>
              <span className="lab-stat-icon">◇</span>
              <b>{t("3 vulnerabilities")}</b>
              <span>SQLi · XSS · IDOR</span>
            </div>
            <div>
              <span className="lab-stat-icon">◎</span>
              <b>Localhost</b>
              <span>{t("learning sandbox")}</span>
            </div>
          </div>
          <section className="lab-lesson-section">
            <div className="lab-section-heading">
              <div>
                <span className="lab-overline lab-teal">{t(group.title)}</span>
                <h2>{t(lesson.heading)}</h2>
              </div>
              <div className="lab-lesson-controls">
                <span>
                  {lesson.id} / {TOTAL}
                </span>
                <button
                  type="button"
                  className="lab-icon-button"
                  aria-label={t("Previous lesson")}
                  disabled={lesson.id <= 1}
                  onClick={() => goTo(lesson.id - 1)}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="lab-icon-button"
                  aria-label={t("Next lesson")}
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
                    {t("⌘ Practice")}
                  </button>
                  <button
                    type="button"
                    className={`lab-tab${tab === "theory" ? " active" : ""}`}
                    role="tab"
                    aria-selected={tab === "theory"}
                    onClick={() => setTab("theory")}
                  >
                    {t("▤ Quick theory")}
                  </button>
                  <button
                    type="button"
                    className={`lab-tab${tab === "teacher" ? " active" : ""}`}
                    role="tab"
                    aria-selected={tab === "teacher"}
                    onClick={() => setTab("teacher")}
                  >
                    {t("♧ For teachers")}
                  </button>
                </div>
                <div className="lab-lesson-content">
                  {tab === "theory" && (
                    <>
                      <div className="lab-eyebrow">
                        <span className="lab-badge">{t("▤ THEORY")}</span>
                      </div>
                      <div className="lab-theory-text">
                        {lesson.theory.map((p) => (
                          <p key={p}>{t(p)}</p>
                        ))}
                      </div>
                      <div className="lab-callout">
                        <b>{t("Discussion question:")}</b> {t(lesson.question)}
                      </div>
                    </>
                  )}
                  {tab === "teacher" && (
                    <>
                      <div className="lab-eyebrow">
                        <span className="lab-badge">{t("♧ FOR TEACHERS")}</span>
                      </div>
                      <div className="lab-teacher-step">
                        {t(lesson.teacher)}
                      </div>
                      <div className="lab-teacher-timing">
                        <span>
                          ⏱ {lesson.minutes} {t("min")}
                        </span>
                        <span>{t(group.title)}</span>
                      </div>
                      <div className="lab-callout">
                        <b>{t("Closing question:")}</b> {t(lesson.question)}
                      </div>
                    </>
                  )}
                  {tab === "practice" && (
                    <>
                      <div className="lab-eyebrow">
                        <span
                          className={`lab-badge${lesson.real ? "" : " sim"}`}
                        >
                          {lesson.real ? t("⌘ REAL API") : t("◇ SIMULATION")}
                        </span>
                      </div>
                      <h3>{t(lesson.heading)}</h3>
                      <p className="lab-intro">{t(lesson.intro)}</p>
                      <div key={lesson.id}>
                        <Renderer lesson={lesson} />
                      </div>
                    </>
                  )}
                </div>
                <div className="lab-lesson-footer">
                  <span>
                    {completed[lesson.id]
                      ? t(
                          "You marked this lesson as reviewed. Try a mission to verify your skills.",
                        )
                      : t(
                          "Self-paced review. Missions verify your work with evidence and tests.",
                        )}
                  </span>
                  <button
                    type="button"
                    className="lab-primary-button"
                    onClick={toggleComplete}
                  >
                    {completed[lesson.id]
                      ? t("Reviewed")
                      : t("Mark as reviewed")}{" "}
                    <span>✓</span>
                  </button>
                </div>
              </article>
              <aside className="lab-right-column">
                <section className="lab-mission-card">
                  <span className="lab-overline">{t("YOUR MISSION")}</span>
                  <h3>{t(lesson.task)}</h3>
                  <p>{t(lesson.mission)}</p>
                  <div className="lab-mission-divider" />
                  <span className="lab-overline">{t("EXPECTED OUTCOME")}</span>
                  <p>{t(lesson.result)}</p>
                  <span className="lab-time-pill">
                    ⏱ {lesson.minutes} {t("min")}
                  </span>
                </section>
                <section className="lab-principle-card">
                  <span>◇</span>
                  <h3>{t("Remember this")}</h3>
                  <p>{t(lesson.principle)}</p>
                </section>
                <details className="lab-notes-card">
                  <summary>{t("✎ Personal notes")}</summary>
                  <textarea
                    placeholder={t("What did you learn from this exercise?")}
                    aria-label={t("Personal notes")}
                    value={notes[lesson.id] ?? ""}
                    onChange={(e) => updateNote(e.target.value)}
                  />
                  <button
                    type="button"
                    className="lab-quiet-button"
                    onClick={() =>
                      downloadText(
                        `security-lab-lesson-${lesson.id}-notes.md`,
                        `# ${t(lesson.title)}\n\n${notes[lesson.id] || t("(no notes)")}\n`,
                      )
                    }
                  >
                    {t("Download notes ↓")}
                  </button>
                </details>
              </aside>
            </div>
          </section>
          <section className="lab-journey">
            <div>
              <span className="lab-overline lab-teal">{t("LEARNING MAP")}</span>
              <h2>{t("One request. The whole architecture.")}</h2>
            </div>
            <div className="lab-journey-steps">
              {[
                [5, "01", t("Frontend"), t("Display")],
                [8, "02", "HTTP / API", t("Communication")],
                [15, "03", "Backend", t("Decision")],
                [20, "04", t("Database"), t("Storage")],
                [27, "05", t("Security"), t("Trust")],
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
              <b>{t("Web Security Lab.")}</b>{" "}
              {t("Knowledge is reinforced through practice.")}
            </span>
            <span>
              {t("A local lab running on synthetic data only")}{" "}
              <i className="lab-live-dot" />
            </span>
          </footer>
        </div>
      </div>
      <div
        className={`lab-toast${toast ? " visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>
    </div>
  );
}
