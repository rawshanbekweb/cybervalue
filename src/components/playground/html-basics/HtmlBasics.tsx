"use client";

import { useState } from "react";
import { useTranslator } from "@/components/locale-provider";
import { lessonRecord } from "@/lib/learning-progress";
import Link from "next/link";
import { HTML_LESSONS, type HtmlLesson } from "./lessons.data";
import { useLocalStorageState } from "../useLocalStorageState";
import { getLastCheck, setLastCheck, type Checked } from "./last-check";
import { useHashLessonId } from "../useHashLessonId";
import "./html-basics.css";

const PROGRESS_KEY = "htmldars:progress:v1";
const CODE_KEY = "htmldars:code:v1";
const TOTAL = HTML_LESSONS.length;

function lessonById(id: number): HtmlLesson {
  return HTML_LESSONS.find((l) => l.id === id) ?? HTML_LESSONS[0];
}

export function HtmlBasics() {
  const t = useTranslator();
  const [lessonId, setLessonId] = useHashLessonId(TOTAL, 1);
  const [storedProgress, setCompletedStored] = useLocalStorageState<unknown>(
    PROGRESS_KEY,
    {},
  );
  const [storedCode, setCodeByLessonStored] = useLocalStorageState<unknown>(
    CODE_KEY,
    {},
  );
  const completed = lessonRecord<boolean>(storedProgress, TOTAL, "boolean");
  const codeByLesson = lessonRecord<string>(storedCode, TOTAL, "string");
  const [checked, setCheckedState] = useState<Checked | null>(getLastCheck);
  const setChecked = (value: Checked | null) => {
    setLastCheck(value);
    setCheckedState(value);
  };

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

  const doneCount = Object.values(completed).filter(
    (value) => value === true,
  ).length;

  return (
    <div className="htb-root">
      <aside className="htb-side">
        <h1>{t("HTML Lessons")}</h1>
        <span className="htb-tag">{t("12 SHORT EXERCISES")}</span>
        <Link
          className="htb-assessment-link"
          href="/playground/html-basics/assessment"
        >
          {t("HTML test · one-time assessment →")}
        </Link>
        <div className="htb-progress-label">
          <span>{t("Progress")}</span>
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
                <span>{t(l.title)}</span>
                {completed[l.id] && <span className="htb-c">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="htb-main">
        <span className="htb-eyebrow">
          {t("Lesson {lesson} / {total}", { lesson: lesson.id, total: TOTAL })}
        </span>
        <h2>{t(lesson.title)}</h2>
        <p className="htb-intro">{t(lesson.intro)}</p>
        <div className="htb-task">
          <b>{t("Task:")}</b> {t(lesson.task)}
        </div>

        <div className="htb-grid">
          <div className="htb-panel">
            <h3>{t("Code (edit it)")}</h3>
            <textarea
              aria-label={t("Code (edit it)")}
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="htb-panel">
            <h3>{t("Result (live preview)")}</h3>
            <iframe sandbox="" srcDoc={code} title={t("Result")} />
          </div>
        </div>

        <div className="htb-button-row">
          <button className="htb-primary" type="button" onClick={runChecks}>
            {t("Check")}
          </button>
          <button
            className="htb-ghost"
            type="button"
            onClick={() => setCode(lesson.solution)}
          >
            {t("Sample solution")}
          </button>
          <button
            className="htb-ghost"
            type="button"
            onClick={() => {
              setCode(lesson.starter);
              setChecked(null);
            }}
          >
            {t("Start over")}
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
              {t(r.label)}
            </li>
          ))}
        </ul>
        {celebrate && (
          <div className="htb-celebrate show">
            {t("✓ All conditions passed! You can move on to the next lesson.")}
          </div>
        )}

        <div className="htb-footer-nav">
          <button
            className="htb-plain"
            type="button"
            disabled={lesson.id <= 1}
            onClick={() => goTo(lesson.id - 1)}
          >
            {t("← Previous lesson")}
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
            {t("Next lesson →")}
          </button>
        </div>
      </div>
    </div>
  );
}
