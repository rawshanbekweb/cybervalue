"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  Lightbulb,
  PlayCircle,
} from "lucide-react";
import { useHashLessonId } from "../useHashLessonId";
import { useLocalStorageState } from "../useLocalStorageState";
import { useT } from "../network-lab/use-t";
import { Checkpoints } from "../checkpoint/Checkpoints";
import {
  restoreLessons,
  type CommonWidget,
  type Lesson,
} from "@/lib/anim-lab/types";
import {
  AnatomyWidget,
  QuizWidget,
  SequenceWidget,
  SortWidget,
} from "./widgets";
import "../network-lab/network-lab.css";
import "./anim-lab.css";

export type WidgetProps = { onSolved: (solved: boolean) => void };

/** Renders the widgets every animated lab shares. */
export function CommonWidgetView({
  widget,
  onSolved,
}: { widget: CommonWidget } & WidgetProps) {
  switch (widget.type) {
    case "sequence":
      return <SequenceWidget {...widget} onSolved={onSolved} />;
    case "anatomy":
      return <AnatomyWidget {...widget} onSolved={onSolved} />;
    case "sort":
      return <SortWidget {...widget} onSolved={onSolved} />;
    case "quiz":
      return <QuizWidget {...widget} onSolved={onSolved} />;
  }
}

/**
 * The layout of the animated beginner labs, the same as the IP lab: a hero
 * with progress, a lesson list, and a workspace where the lesson's widget
 * must be solved before Check passes. Copy comes in already translated.
 */
export function AnimLab<W>({
  lessons,
  progressKey,
  eyebrow,
  title,
  subtitle,
  description,
  badge,
  icon,
  checkpoints = [],
  video,
  back,
  renderWidget,
}: {
  lessons: Lesson<W>[];
  progressKey: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: React.ReactNode;
  checkpoints?: string[];
  /** The lab's narrated video lesson, when it has one. */
  video?: string;
  /** Where the back link leads; the Academy by default. */
  back?: { href: string; label: string };
  renderWidget: (widget: W, props: WidgetProps) => React.ReactNode;
}) {
  const { t, text } = useT();
  const [id, setId] = useHashLessonId(lessons.length);
  const [raw, setProgress] = useLocalStorageState<unknown>(progressKey, {});
  const progress = restoreLessons(raw, lessons);
  const done = Object.keys(progress).length;
  const lesson = lessons[id - 1];
  return (
    <div className="network-lab anim-lab">
      <Link className="nl-back" href={back?.href ?? "/akademiya"}>
        <ArrowLeft size={15} /> {back?.label ?? t("Academy")}
      </Link>
      <header className="nl-hero">
        <div>
          <span className="eyebrow">
            <span className="status-dot" /> {eyebrow}
          </span>
          <h1>
            {title}
            <br />
            <span>{subtitle}</span>
          </h1>
          <p>{description}</p>
          {video && (
            <Link className="nl-primary al-video-link" href={video}>
              <PlayCircle size={18} /> {t("Watch the video lesson")}
            </Link>
          )}
        </div>
        <div className="nl-course-card">
          <div>
            {icon}
            <strong>{badge}</strong>
            <span className="nl-live">{t("In your browser")}</span>
          </div>
          <p>
            {lessons.length} {t("practical lessons")} <span>·</span>{" "}
            {t("animated")}
          </p>
          <label htmlFor="al-progress">
            {t("Your progress")}{" "}
            <strong>
              {done}/{lessons.length}
            </strong>
          </label>
          <progress id="al-progress" value={done} max={lessons.length} />
          <small>
            {t(
              "Progress is saved in this browser. Signed-in students also keep it on their account, on every device.",
            )}
          </small>
        </div>
      </header>
      <div className="nl-layout">
        <aside className="nl-sidebar">
          <div className="nl-sidebar-title">
            <BookOpen size={16} />
            <h2>{t("Learning path")}</h2>
          </div>
          <nav aria-label={t("Lessons")}>
            {lessons.map((item, index) => (
              <div key={item.id}>
                {(index === 0 ||
                  item.group.en !== lessons[index - 1].group.en) && (
                  <h3>{text(item.group)}</h3>
                )}
                <a
                  href={`#lesson/${item.id}`}
                  className={item.id === id ? "active" : ""}
                  aria-current={item.id === id ? "step" : undefined}
                >
                  <span className={progress[item.id] ? "nl-done" : "nl-number"}>
                    {progress[item.id] ? (
                      <Check size={14} aria-label={t("Completed")} />
                    ) : (
                      String(item.id).padStart(2, "0")
                    )}
                  </span>
                  <span>{text(item.title)}</span>
                </a>
              </div>
            ))}
          </nav>
          {checkpoints.length > 0 && (
            <a className="nl-tool" href="#checkpoints">
              <ClipboardCheck size={17} />
              {t("Checkpoints")}
              <ArrowRight size={15} />
            </a>
          )}
        </aside>
        <Workspace
          key={lesson.id}
          lesson={lesson}
          total={lessons.length}
          completed={!!progress[lesson.id]}
          onComplete={() => setProgress({ ...progress, [lesson.id]: true })}
          onNext={() => setId(Math.min(lesson.id + 1, lessons.length))}
          renderWidget={renderWidget}
        />
      </div>
      {checkpoints.length > 0 && <Checkpoints ids={checkpoints} />}
    </div>
  );
}

function Workspace<W>({
  lesson,
  total,
  completed,
  onComplete,
  onNext,
  renderWidget,
}: {
  lesson: Lesson<W>;
  total: number;
  completed: boolean;
  onComplete: () => void;
  onNext: () => void;
  renderWidget: (widget: W, props: WidgetProps) => React.ReactNode;
}) {
  const { t, text } = useT();
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<"pass" | "fail" | null>(null);
  const report = (next: boolean) => {
    setSolved(next);
    setFeedback(null);
  };
  const check = () => {
    setFeedback(solved ? "pass" : "fail");
    if (solved) onComplete();
  };
  const last = lesson.id === total;
  return (
    <div className="nl-workspace">
      <header className="nl-lesson-header">
        <div>
          <span className="eyebrow">
            {t("LESSON")} {String(lesson.id).padStart(2, "0")} / {total} ·{" "}
            {lesson.minutes} {t("min")}
          </span>
          <h2>{text(lesson.title)}</h2>
        </div>
        {completed && (
          <span className="nl-complete-badge">
            <Check size={15} />
            {t("Completed")}
          </span>
        )}
      </header>
      <div className="nl-grid">
        <section className="nl-instructions" aria-label={t("Lesson and task")}>
          <p className="nl-intro">{text(lesson.intro)}</p>
          <p className="nl-analogy">
            <Lightbulb size={16} aria-hidden="true" />
            <span>{text(lesson.analogy)}</span>
          </p>
          <details className="nl-theory" open>
            <summary>
              <BookOpen size={16} />
              {t("Understand first")}
            </summary>
            <div>
              {lesson.theory.map((paragraph, i) => (
                <p key={i}>{text(paragraph)}</p>
              ))}
            </div>
          </details>
          <div className="nl-task">
            <span className="eyebrow">{t("TASK")}</span>
            <p>{text(lesson.task)}</p>
            <details className="nl-hint">
              <summary>{t("Need a hint?")}</summary>
              <p>{text(lesson.hint)}</p>
            </details>
            <div className="nl-task-actions">
              <button className="nl-primary nl-check" onClick={check}>
                <Check size={16} />
                {t("Check")}
              </button>
            </div>
            <div aria-live="polite">
              {feedback === "pass" && (
                <p className="nl-pass">{t("Correct! Lesson completed.")}</p>
              )}
              {feedback === "fail" && (
                <p className="nl-fail">
                  {t("Not yet. Look at the visual and open the hint.")}
                </p>
              )}
            </div>
            {(completed || feedback === "pass") && !last && (
              <button className="nl-next" onClick={onNext}>
                {t("Next lesson")}
                <ArrowRight size={16} />
              </button>
            )}
            {(completed || feedback === "pass") && last && (
              <p className="nl-finish">{t("All lessons done. Well done!")}</p>
            )}
          </div>
        </section>
        <section className="nl-visual" aria-label={t("Interactive exercise")}>
          {renderWidget(lesson.widget, { onSolved: report })}
        </section>
      </div>
    </div>
  );
}
