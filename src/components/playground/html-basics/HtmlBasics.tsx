"use client";

import { useState } from "react";
import Link from "next/link";
import { HTML_LESSONS, type HtmlLesson } from "./lessons.data";
import { useLocalStorageState } from "../useLocalStorageState";
import { useHashLessonId } from "../useHashLessonId";
import "./html-basics.css";

const PROGRESS_KEY = "htmldars:progress:v1";
const CODE_KEY = "htmldars:code:v1";
const TOTAL = HTML_LESSONS.length;

function lessonById(id: number): HtmlLesson {
  return HTML_LESSONS.find((l) => l.id === id) ?? HTML_LESSONS[0];
}

export function HtmlBasics() {
  const [lessonId, setLessonId] = useHashLessonId(TOTAL, 1);
  const [completed, setCompletedStored] = useLocalStorageState<
    Record<number, boolean>
  >(PROGRESS_KEY, {});
  const [codeByLesson, setCodeByLessonStored] = useLocalStorageState<
    Record<number, string>
  >(CODE_KEY, {});
  const [checked, setChecked] = useState<{
    lessonId: number;
    code: string;
    results: { label: string; pass: boolean }[];
  } | null>(null);

  const lesson = lessonById(lessonId);
  const code = codeByLesson[lesson.id] ?? lesson.starter;
  const checkResults =
    checked?.lessonId === lesson.id && checked.code === code
      ? checked.results
      : null;
  const celebrate = checkResults?.every((result) => result.pass) ?? false;

  const goTo = (id: number) => {
    if (!HTML_LESSONS.some((l) => l.id === id)) id = 1;
    setLessonId(id);
    setChecked(null);
  };

  const setCode = (value: string) => {
    setCodeByLessonStored({ ...codeByLesson, [lesson.id]: value });
  };

  const runChecks = () => {
    const results = lesson.checks.map((c) => ({
      label: c.label,
      pass: !!c.test(code),
    }));
    setChecked({ lessonId: lesson.id, code, results });
    const allPass = results.every((r) => r.pass);
    if (allPass) {
      setCompletedStored({ ...completed, [lesson.id]: true });
    }
  };

  const doneCount = Object.keys(completed).length;

  return (
    <div className="htb-root">
      <aside className="htb-side">
        <h1>HTML Lessons</h1>
        <span className="htb-tag">12 SHORT EXERCISES</span>
        <Link
          className="htb-assessment-link"
          href="/playground/html-basics/assessment"
        >
          HTML sinovi · bir martalik baholash →
        </Link>
        <div className="htb-progress-label">
          <span>Progress</span>
          <strong>
            {doneCount} / {TOTAL}
          </strong>
        </div>
        <div className="htb-progress-track">
          <i style={{ width: `${Math.round((doneCount / TOTAL) * 100)}%` }} />
        </div>
        <ul className="htb-nav">
          {HTML_LESSONS.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                className={l.id === lessonId ? "active" : ""}
                onClick={() => goTo(l.id)}
              >
                <span className="htb-n">{String(l.id).padStart(2, "0")}</span>
                <span>{l.title}</span>
                {completed[l.id] && <span className="htb-c">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main className="htb-main">
        <span className="htb-eyebrow">
          LESSON {lesson.id} / {TOTAL}
        </span>
        <h2>{lesson.title}</h2>
        <p className="htb-intro">{lesson.intro}</p>
        <div className="htb-task">
          <b>Task:</b> {lesson.task}
        </div>

        <div className="htb-grid">
          <div className="htb-panel">
            <h3>Code (edit it)</h3>
            <textarea
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="htb-panel">
            <h3>Result (live preview)</h3>
            <iframe sandbox="" srcDoc={code} title="Result" />
          </div>
        </div>

        <div className="htb-button-row">
          <button className="htb-primary" type="button" onClick={runChecks}>
            Check
          </button>
          <button
            className="htb-ghost"
            type="button"
            onClick={() => setCode(lesson.solution)}
          >
            Sample solution
          </button>
          <button
            className="htb-ghost"
            type="button"
            onClick={() => {
              setCode(lesson.starter);
              setChecked(null);
            }}
          >
            Start over
          </button>
        </div>

        <ul className="htb-checklist">
          {(
            checkResults ??
            lesson.checks.map((c) => ({ label: c.label, pass: undefined }))
          ).map((r, i) => (
            <li
              key={i}
              className={r.pass === undefined ? "" : r.pass ? "pass" : "fail"}
            >
              <span className="htb-mark">
                {r.pass === undefined ? "•" : r.pass ? "✓" : "✕"}
              </span>
              {r.label}
            </li>
          ))}
        </ul>
        {celebrate && (
          <div className="htb-celebrate show">
            ✓ All conditions passed! You can move on to the next lesson.
          </div>
        )}

        <div className="htb-footer-nav">
          <button
            className="htb-plain"
            type="button"
            disabled={lesson.id <= 1}
            onClick={() => goTo(lesson.id - 1)}
          >
            ← Previous lesson
          </button>
          <span>
            {lesson.id} / {TOTAL}
          </span>
          <button
            className="htb-plain"
            type="button"
            disabled={lesson.id >= TOTAL}
            onClick={() => goTo(lesson.id + 1)}
          >
            Next lesson →
          </button>
        </div>
      </main>
    </div>
  );
}
