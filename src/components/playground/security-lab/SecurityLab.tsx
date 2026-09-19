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
      setToast("Bo‘lim yakunlandi. Keyingisiga o‘tamiz.");
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
            s<span>·</span>
          </span>
          <span>
            sabaq
            <span className="lab-brand-sub">INTERAKTIV AKADEMIYA</span>
          </span>
        </a>
        <div className="lab-course-label">O‘QUV YO‘NALISHI</div>
        <div className="lab-course-name">
          Web Application
          <br />
          Security <span className="lab-version">01</span>
        </div>
        <div className="lab-search-wrap">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Bo‘limni qidirish…"
            aria-label="Bo‘limni qidirish"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <nav aria-label="Dars bo‘limlari" className="lab-lesson-nav">
          {visibleLessons.length === 0 && <div className="lab-empty-search">Hech narsa topilmadi.</div>}
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
            <span>Sizning natijangiz</span>
            <strong>
              {doneCount} / {TOTAL}
            </strong>
          </div>
          <div className="lab-progress-track">
            <i style={{ width: `${Math.round((doneCount / TOTAL) * 100)}%` }} />
          </div>
          <span className="lab-save-hint">Natijalar shu browserda saqlanadi</span>
        </div>
      </aside>
      <div className="lab-workspace">
        <header className="lab-topbar">
          <div className="lab-breadcrumb">
            <button
              type="button"
              className="lab-icon-button lab-mobile-menu"
              aria-label="Menyuni ochish"
              onClick={() => setMenuOpen((v) => !v)}
            >
              ☰
            </button>
            <span>O‘quv laboratoriyasi</span>
            <span className="lab-slash">/</span>
            <b>{lesson.title}</b>
          </div>
          <div className="lab-top-actions">
            <span className={`lab-connection${connection === "offline" ? " offline" : ""}`}>
              <i />
              {connection === "connecting" ? "Ulanmoqda" : connection === "online" ? "Ulandi" : "Server topilmadi"}
            </span>
            <button type="button" className="lab-quiet-button" onClick={() => setPresent((v) => !v)}>
              <span>▣</span> Taqdimot rejimi
            </button>
          </div>
        </header>
        <main>
          <div className="lab-page-eyebrow">
            <span className="lab-mini-dot" /> NAZARIYADAN AMALIYOTGA
            <span className="lab-edition">36 BO‘LIM · O‘ZBEK TILIDA</span>
          </div>
          <section className="lab-hero">
            <div>
              <p className="lab-overline">WEB APPLICATION SECURITY</p>
              <h1>
                Tizimni tushun.
                <br />
                <span>Xavfsizlikni amalda ko‘r.</span>
              </h1>
              <p className="lab-hero-description">
                Browserdan databasegacha bo‘lgan yo‘lni o‘rganing.
                <br />
                So‘rov yuboring, natijani kuzating va himoyani sinab ko‘ring.
              </p>
              <div className="lab-hero-tags">
                <span>
                  <i className="lab-live-dot" /> Haqiqiy lokal API
                </span>
                <span>↔ Interaktiv mashqlar</span>
                <span>⌘ O‘qituvchi konspekti</span>
              </div>
            </div>
          </section>
          <div className="lab-stat-strip">
            <div>
              <span className="lab-stat-icon">▦</span>
              <b>36</b>
              <span>kichik amaliyot</span>
            </div>
            <div>
              <span className="lab-stat-icon">⇄</span>
              <b>Real HTTP</b>
              <span>request &amp; response</span>
            </div>
            <div>
              <span className="lab-stat-icon">◇</span>
              <b>3 ta zaiflik</b>
              <span>SQLi · XSS · IDOR</span>
            </div>
            <div>
              <span className="lab-stat-icon">◎</span>
              <b>Localhost</b>
              <span>o‘quv muhiti</span>
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
                  aria-label="Oldingi bo‘lim"
                  disabled={lesson.id <= 1}
                  onClick={() => goTo(lesson.id - 1)}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="lab-icon-button"
                  aria-label="Keyingi bo‘lim"
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
                    ⌘ Amaliyot
                  </button>
                  <button
                    type="button"
                    className={`lab-tab${tab === "theory" ? " active" : ""}`}
                    role="tab"
                    aria-selected={tab === "theory"}
                    onClick={() => setTab("theory")}
                  >
                    ▤ Qisqa nazariya
                  </button>
                  <button
                    type="button"
                    className={`lab-tab${tab === "teacher" ? " active" : ""}`}
                    role="tab"
                    aria-selected={tab === "teacher"}
                    onClick={() => setTab("teacher")}
                  >
                    ♧ O‘qituvchi uchun
                  </button>
                </div>
                <div className="lab-lesson-content">
                  {tab === "theory" && (
                    <>
                      <div className="lab-eyebrow">
                        <span className="lab-badge">▤ NAZARIYA</span>
                      </div>
                      <div className="lab-theory-text">
                        {lesson.theory.map((p) => (
                          <p key={p}>{p}</p>
                        ))}
                      </div>
                      <div className="lab-callout">
                        <b>Muhokama savoli:</b> {lesson.question}
                      </div>
                    </>
                  )}
                  {tab === "teacher" && (
                    <>
                      <div className="lab-eyebrow">
                        <span className="lab-badge">♧ O‘QITUVCHI UCHUN</span>
                      </div>
                      <div className="lab-teacher-step">{lesson.teacher}</div>
                      <div className="lab-teacher-timing">
                        <span>⏱ {lesson.minutes} daqiqa</span>
                        <span>{group.title}</span>
                      </div>
                      <div className="lab-callout">
                        <b>Yakuniy savol:</b> {lesson.question}
                      </div>
                    </>
                  )}
                  {tab === "practice" && (
                    <>
                      <div className="lab-eyebrow">
                        <span className={`lab-badge${lesson.real ? "" : " sim"}`}>
                          {lesson.real ? "⌘ HAQIQIY API" : "◇ SIMULYATSIYA"}
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
                  <span>{completed[lesson.id] ? "Bu bo‘lim yakunlandi. Xohlasangiz qayta ko‘rib chiqing." : "Bajaring, kuzating, xulosa qiling."}</span>
                  <button type="button" className="lab-primary-button" onClick={toggleComplete}>
                    {completed[lesson.id] ? "Yakunlangan" : "Bo‘limni yakunlash"} <span>✓</span>
                  </button>
                </div>
              </article>
              <aside className="lab-right-column">
                <section className="lab-mission-card">
                  <span className="lab-overline">SIZNING VAZIFANGIZ</span>
                  <h3>{lesson.task}</h3>
                  <p>{lesson.mission}</p>
                  <div className="lab-mission-divider" />
                  <span className="lab-overline">KUTILADIGAN NATIJA</span>
                  <p>{lesson.result}</p>
                  <span className="lab-time-pill">⏱ {lesson.minutes} daqiqa</span>
                </section>
                <section className="lab-principle-card">
                  <span>◇</span>
                  <h3>Eslab qoling</h3>
                  <p>{lesson.principle}</p>
                </section>
                <details className="lab-notes-card">
                  <summary>✎ Shaxsiy qaydlar</summary>
                  <textarea
                    placeholder="Bu mashqdan nimani o‘rgandingiz?"
                    aria-label="Shaxsiy qaydlar"
                    value={notes[lesson.id] ?? ""}
                    onChange={(e) => updateNote(e.target.value)}
                  />
                  <button
                    type="button"
                    className="lab-quiet-button"
                    onClick={() =>
                      downloadText(
                        `sabaq-dars-${lesson.id}-qaydlar.md`,
                        `# ${lesson.title}\n\n${notes[lesson.id] || "(qayd yo‘q)"}\n`,
                      )
                    }
                  >
                    Qaydlarni yuklab olish ↓
                  </button>
                </details>
              </aside>
            </div>
          </section>
          <section className="lab-journey">
            <div>
              <span className="lab-overline lab-teal">O‘QUV XARITASI</span>
              <h2>Bitta so‘rov. Butun arxitektura.</h2>
            </div>
            <div className="lab-journey-steps">
              {[
                [5, "01", "Frontend", "Ko‘rsatish"],
                [8, "02", "HTTP / API", "Aloqa"],
                [15, "03", "Backend", "Qaror"],
                [20, "04", "Database", "Saqlash"],
                [27, "05", "Security", "Ishonch"],
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
              <b>sabaq.</b> Bilim — amaliyot bilan mustahkamlanadi.
            </span>
            <span>
              Faqat lokal, sun’iy ma’lumotli laboratoriya <i className="lab-live-dot" />
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
