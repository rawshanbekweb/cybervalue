"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  Globe,
  Lightbulb,
  Send,
} from "lucide-react";
import { useHashLessonId } from "../useHashLessonId";
import { useLocalStorageState } from "../useLocalStorageState";
import { useT } from "../network-lab/use-t";
import {
  goalMet,
  LESSONS,
  PROGRESS_KEY,
  restoreProgress,
  sameOrigin,
  type Flag,
  type Goal,
  type Lesson,
  type Question,
  type Widget,
} from "@/lib/http/curriculum";
import { formatResponse, parseRequest, serve } from "@/lib/http/server";
import type { Text } from "@/lib/network/ip";
import { Checkpoints } from "../checkpoint/Checkpoints";
import "../network-lab/network-lab.css";
import "./http-lab.css";

// Academy Intermediate · HTTP in depth. The same lesson layout as the
// networking lab; the widgets talk to a pretend server in the browser.
export function HttpLab() {
  const { t, text } = useT();
  const [id, setId] = useHashLessonId(LESSONS.length);
  const [raw, setProgress] = useLocalStorageState<unknown>(PROGRESS_KEY, {});
  const progress = restoreProgress(raw);
  const done = Object.keys(progress).length;
  const lesson = LESSONS[id - 1];
  return (
    <div className="network-lab">
      <Link className="nl-back" href="/intermediate">
        <ArrowLeft size={15} /> Academy Intermediate
      </Link>
      <header className="nl-hero">
        <div>
          <span className="eyebrow">
            <span className="status-dot" />{" "}
            {t("WEB APPLICATION SECURITY · MODULE 1")}
          </span>
          <h1>
            {t("HTTP in depth.")}
            <br />
            <span>{t("Read the web the way a tester does.")}</span>
          </h1>
          <p>
            {t(
              "Write raw requests to a training server, follow redirects, sign in with cookies, and see how the browser’s rules and security headers protect users.",
            )}
          </p>
        </div>
        <div className="nl-course-card">
          <div>
            <Globe size={22} />
            <strong>{t("HTTP / LAB")}</strong>
            <span className="nl-live">{t("In your browser")}</span>
          </div>
          <p>
            {LESSONS.length} {t("practical lessons")} <span>·</span>{" "}
            {t("training server")}
          </p>
          <label htmlFor="hl-progress">
            {t("Your progress")}{" "}
            <strong>
              {done}/{LESSONS.length}
            </strong>
          </label>
          <progress id="hl-progress" value={done} max={LESSONS.length} />
          <small>
            {t(
              "The server here is a simulation in your browser. Practise only on systems you own or have written permission to test.",
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
          <nav aria-label={t("HTTP lessons")}>
            {LESSONS.map((item, index) => (
              <div key={item.id}>
                {(index === 0 ||
                  item.group.en !== LESSONS[index - 1].group.en) && (
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
          <a className="nl-tool" href="#checkpoints">
            <ClipboardCheck size={17} />
            {t("Checkpoints")}
            <ArrowRight size={15} />
          </a>
        </aside>
        <Workspace
          key={lesson.id}
          lesson={lesson}
          completed={!!progress[lesson.id]}
          onComplete={() => setProgress({ ...progress, [lesson.id]: true })}
          onNext={() => setId(Math.min(lesson.id + 1, LESSONS.length))}
        />
      </div>
      <Checkpoints ids={["http-1"]} />
    </div>
  );
}

function Workspace({
  lesson,
  completed,
  onComplete,
  onNext,
}: {
  lesson: Lesson;
  completed: boolean;
  onComplete: () => void;
  onNext: () => void;
}) {
  const { t, text } = useT();
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<"pass" | "fail" | null>(null);
  const check = () => {
    setFeedback(solved ? "pass" : "fail");
    if (solved) onComplete();
  };
  const last = lesson.id === LESSONS.length;
  return (
    <div className="nl-workspace">
      <header className="nl-lesson-header">
        <div>
          <span className="eyebrow">
            {t("LESSON")} {String(lesson.id).padStart(2, "0")} /{" "}
            {LESSONS.length} · {lesson.minutes} {t("min")}
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
                  {t("Not yet. Look at the exercise and open the hint.")}
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
              <p className="nl-finish">
                {t("All lessons done. Prove it in the checkpoint below.")}
              </p>
            )}
          </div>
        </section>
        <section className="nl-visual" aria-label={t("Interactive exercise")}>
          <WidgetView
            widget={lesson.widget}
            checked={feedback !== null}
            onSolved={(next) => {
              setSolved(next);
              setFeedback(null);
            }}
          />
        </section>
      </div>
    </div>
  );
}

function WidgetView({
  widget,
  checked,
  onSolved,
}: {
  widget: Widget;
  checked: boolean;
  onSolved: (solved: boolean) => void;
}) {
  switch (widget.type) {
    case "request":
      return (
        <RequestWidget
          start={widget.start}
          goal={widget.goal}
          onSolved={onSolved}
        />
      );
    case "choice":
      return (
        <ChoiceWidget
          questions={widget.questions}
          checked={checked}
          onSolved={onSolved}
        />
      );
    case "flags":
      return (
        <FlagsWidget
          prompt={widget.prompt}
          flags={widget.flags}
          right={widget.right}
          onSolved={onSolved}
        />
      );
    case "origin":
      return (
        <OriginWidget
          base={widget.base}
          urls={widget.urls}
          checked={checked}
          onSolved={onSolved}
        />
      );
  }
}

function RequestWidget({
  start,
  goal,
  onSolved,
}: {
  start: string;
  goal: Goal;
  onSolved: (solved: boolean) => void;
}) {
  const { t, text } = useT();
  const [raw, setRaw] = useState(start);
  const [reply, setReply] = useState<
    | { kind: "response"; text: string; status: number }
    | { kind: "error"; line: number; message: Text }
    | null
  >(null);
  const [history, setHistory] = useState<string[]>([]);
  const send = () => {
    const parsed = parseRequest(raw);
    if (!parsed.ok) {
      setReply({ kind: "error", line: parsed.line, message: parsed.message });
      return;
    }
    const response = serve(parsed.request);
    setReply({
      kind: "response",
      text: formatResponse(response),
      status: response.status,
    });
    setHistory((old) =>
      [
        `${parsed.request.method} ${parsed.request.path} → ${response.status}`,
        ...old,
      ].slice(0, 5),
    );
    // A goal met once stays met, even if the student keeps experimenting.
    if (goalMet(goal, parsed.request, response)) onSolved(true);
  };
  return (
    <div className="nl-card hl-request">
      <label className="hl-label" htmlFor="hl-raw">
        {t("Raw HTTP request")}
      </label>
      <textarea
        id="hl-raw"
        className="hl-raw"
        value={raw}
        rows={8}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        onChange={(e) => setRaw(e.target.value.slice(0, 2000))}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") send();
        }}
      />
      <div className="nl-task-actions">
        <button className="nl-primary" onClick={send}>
          <Send size={16} aria-hidden="true" /> {t("Send")}
        </button>
        <button className="nl-ghost" onClick={() => setRaw(start)}>
          {t("Start over")}
        </button>
      </div>
      <div aria-live="polite">
        {reply?.kind === "error" && (
          <p className="nl-fail">
            {t("Line {line}", { line: reply.line })}: {text(reply.message)}
          </p>
        )}
        {reply?.kind === "response" && (
          <>
            <span className="hl-label">{t("Server response")}</span>
            <pre
              className={`hl-response status-${Math.floor(reply.status / 100)}xx`}
              tabIndex={0}
            >
              {reply.text}
            </pre>
          </>
        )}
      </div>
      {history.length > 0 && (
        <ol className="hl-history" aria-label={t("Sent requests")}>
          {history.map((line, i) => (
            <li key={i}>
              <code>{line}</code>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ChoiceWidget({
  questions,
  checked,
  onSolved,
}: {
  questions: Question[];
  checked: boolean;
  onSolved: (solved: boolean) => void;
}) {
  const { text } = useT();
  const [answers, setAnswers] = useState<(number | null)[]>(
    questions.map(() => null),
  );
  const choose = (q: number, option: number) => {
    const next = answers.map((a, i) => (i === q ? option : a));
    setAnswers(next);
    onSolved(next.every((a, i) => a === questions[i].answer));
  };
  return (
    <div className="nl-card hl-choice">
      {questions.map((q, i) => (
        <fieldset key={i}>
          <legend>{text(q.ask)}</legend>
          {q.options.map((option, j) => (
            <label key={j} className="hl-option">
              <input
                type="radio"
                name={`hl-q${i}`}
                checked={answers[i] === j}
                onChange={() => choose(i, j)}
              />
              {text(option)}
            </label>
          ))}
          {checked && answers[i] !== null && (
            <p className={answers[i] === q.answer ? "nl-pass" : "nl-fail"}>
              {text(q.explain)}
            </p>
          )}
        </fieldset>
      ))}
    </div>
  );
}

function FlagsWidget({
  prompt,
  flags,
  right,
  onSolved,
}: {
  prompt: Text;
  flags: Flag[];
  right: string[];
  onSolved: (solved: boolean) => void;
}) {
  const { t, text } = useT();
  const [chosen, setChosen] = useState<string[]>([]);
  const toggle = (id: string) => {
    const next = chosen.includes(id)
      ? chosen.filter((x) => x !== id)
      : [...chosen, id];
    setChosen(next);
    onSolved(
      next.length === right.length && right.every((id) => next.includes(id)),
    );
  };
  const picked = flags.filter((f) => chosen.includes(f.id));
  return (
    <div className="nl-card hl-flags">
      <pre className="hl-response" tabIndex={0}>
        {text(prompt)}
        {picked.map((f) => `\n${f.code}`).join("")}
      </pre>
      <fieldset>
        <legend>{t("Choose what to add")}</legend>
        {flags.map((flag) => (
          <label key={flag.id} className="hl-option">
            <input
              type="checkbox"
              checked={chosen.includes(flag.id)}
              onChange={() => toggle(flag.id)}
            />
            <code>{flag.code}</code>
            <span className="hl-about">{text(flag.about)}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

function OriginWidget({
  base,
  urls,
  checked,
  onSolved,
}: {
  base: string;
  urls: { url: string; same: boolean }[];
  checked: boolean;
  onSolved: (solved: boolean) => void;
}) {
  const { t } = useT();
  const [marks, setMarks] = useState<(boolean | null)[]>(urls.map(() => null));
  const mark = (i: number, same: boolean) => {
    const next = marks.map((m, j) => (j === i ? same : m));
    setMarks(next);
    onSolved(next.every((m, j) => m === sameOrigin(base, urls[j].url)));
  };
  return (
    <div className="nl-card hl-choice">
      <p className="hl-label">
        {t("Compared with")} <code>{base}</code>
      </p>
      {urls.map((u, i) => (
        <fieldset key={u.url}>
          <legend>
            <code>{u.url}</code>
          </legend>
          <label className="hl-option">
            <input
              type="radio"
              name={`hl-o${i}`}
              checked={marks[i] === true}
              onChange={() => mark(i, true)}
            />
            {t("Same origin")}
          </label>
          <label className="hl-option">
            <input
              type="radio"
              name={`hl-o${i}`}
              checked={marks[i] === false}
              onChange={() => mark(i, false)}
            />
            {t("Different origin")}
          </label>
          {checked && marks[i] !== null && (
            <p className={marks[i] === u.same ? "nl-pass" : "nl-fail"}>
              {marks[i] === u.same ? t("Right.") : t("Look again.")}
            </p>
          )}
        </fieldset>
      ))}
    </div>
  );
}
