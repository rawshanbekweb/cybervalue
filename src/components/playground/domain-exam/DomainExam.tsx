"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useT } from "../network-lab/use-t";
import { useExamGuard } from "@/components/resource-exam/exam-guard";
import {
  DOMAIN_EXAM_MINUTES,
  DOMAIN_EXAM_PASS,
  domainExamPath,
  type ExamAnswers,
  type ExamQuestion,
  type ExamResult,
  type ExamState,
} from "@/lib/domain-exam/content";
import type { Text } from "@/lib/anim-lab/types";
import "@/components/resource-exam/resource-exam.css";
import "@/components/resource-exam/linux-ip-exam.css";

/** Answers are saved on the server this long after the last change. */
const SAVE_DELAY = 2000;

type Phase = "intro" | "working" | "pending" | "result";
type DomainInfo = { id: string; title: Text; modules: number };

const clock = (seconds: number) => {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
};

// A domain's final exam: one question set per attempt, saved on the server
// as the student works, graded on submit, shown only after a teacher
// approves it (/teacher/domain-exams).
export function DomainExam({
  domain,
  initial,
  certificate = null,
}: {
  domain: DomainInfo;
  initial: ExamState;
  // The code of the certificate an approved pass earned.
  certificate?: string | null;
}) {
  const { t, text } = useT();
  const api = `${domainExamPath(domain.id)}/api`;
  const post = useCallback(
    async (body: object, keepalive = false) => {
      const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Something went wrong.");
      return data as ExamState;
    },
    [api],
  );

  const [phase, setPhase] = useState<Phase>(
    initial.kind === "pending"
      ? "pending"
      : initial.kind === "approved"
        ? "result"
        : "intro",
  );
  const resumable = initial.kind === "running";
  const [questions, setQuestions] = useState<ExamQuestion[]>(
    initial.kind === "running" ? initial.questions : [],
  );
  const [answers, setAnswers] = useState<ExamAnswers>(
    initial.kind === "running" ? initial.answers : {},
  );
  const [leaves, setLeaves] = useState(
    initial.kind === "running" ? initial.leaves : 0,
  );
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const submitted = useRef(false);
  const answersRef = useRef<ExamAnswers>(answers);
  const leavesRef = useRef(leaves);
  const saveTimer = useRef(0);

  /** Save the answers so far; a lost save is retried by the next one. */
  const save = useCallback(
    (keepalive = false) => {
      window.clearTimeout(saveTimer.current);
      if (submitted.current) return;
      post(
        {
          action: "save",
          answers: answersRef.current,
          leaves: leavesRef.current,
        },
        keepalive,
      )
        .then((state) => {
          if (state.kind === "pending") {
            submitted.current = true;
            setPhase("pending");
          }
        })
        .catch(() => {});
    },
    [post],
  );

  const onLeave = useCallback(() => {
    if (submitted.current) return;
    leavesRef.current += 1;
    setLeaves(leavesRef.current);
    save(true);
  }, [save]);
  const guard = useExamGuard(phase === "working", onLeave);

  // Closing the tab keeps the last answers.
  useEffect(() => {
    if (phase !== "working") return;
    const flush = () => save(true);
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [phase, save]);

  const submit = useCallback(
    async (current: ExamAnswers) => {
      if (submitted.current) return;
      submitted.current = true;
      window.clearTimeout(saveTimer.current);
      setBusy(true);
      setError("");
      try {
        await post({
          action: "submit",
          answers: current,
          leaves: leavesRef.current,
        });
        setPhase("pending");
        if (document.fullscreenElement)
          document.exitFullscreen().catch(() => {});
        window.scrollTo({ top: 0 });
      } catch (caught) {
        submitted.current = false;
        setError(
          caught instanceof Error
            ? caught.message
            : "Couldn’t send. Your answers are saved; try again.",
        );
      } finally {
        setBusy(false);
        setConfirming(false);
      }
    },
    [post],
  );

  useEffect(() => {
    if (phase !== "working") return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) void submit(answersRef.current);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, deadline, submit]);

  const answered = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined).length,
    [questions, answers],
  );
  const remaining =
    phase === "working" && now
      ? Math.ceil((deadline - now) / 1000)
      : DOMAIN_EXAM_MINUTES * 60;

  async function begin() {
    setBusy(true);
    setError("");
    try {
      const state = await post({ action: "start" });
      if (state.kind === "pending") {
        submitted.current = true;
        setPhase("pending");
        return;
      }
      if (state.kind !== "running") throw new Error("Something went wrong.");
      setQuestions(state.questions);
      answersRef.current = state.answers;
      setAnswers(state.answers);
      leavesRef.current = state.leaves;
      setLeaves(state.leaves);
      // The server's clock decides; this browser only counts down.
      const start = Date.now();
      setDeadline(start + state.remaining);
      setNow(start);
      submitted.current = false;
      guard.fullscreen();
      setPhase("working");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Something went wrong.",
      );
    } finally {
      setBusy(false);
    }
  }

  function pick(id: string, option: number) {
    const next = { ...answersRef.current, [id]: option };
    answersRef.current = next;
    setAnswers(next);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => save(), SAVE_DELAY);
    setConfirming(false);
  }

  const title = text(domain.title);
  const back = (
    <Link
      className="button button-secondary"
      href={`/intermediate#${domain.id}`}
    >
      {t("Back to the roadmap")}
    </Link>
  );

  if (initial.kind === "staff")
    return (
      <div className="rx-shell">
        <Intro title={title} />
        <section className="rx-card">
          <h2>{t("Exams are taken from a student account")}</h2>
          <p>
            {t(
              "Students at the Intermediate level sit this exam from their own account. Their answers and results are listed for review on the teacher panel.",
            )}
          </p>
          <div className="rx-actions">
            <Link
              className="button button-primary"
              href="/teacher/domain-exams"
            >
              {t("Open exam results")}
            </Link>
            {back}
          </div>
        </section>
      </div>
    );

  if (phase === "pending")
    return (
      <div className="rx-shell">
        <section className="rx-card rx-result" aria-live="polite">
          <span className="rx-eyebrow">{t("ANSWERS RECEIVED")}</span>
          <h1>{t("Your result is with your teacher")}</h1>
          <p>
            {t(
              "Your answers are saved. Once your teacher reviews and approves them, your score, the right answers and an explanation for every question appear on this page.",
            )}
          </p>
          <div className="rx-actions">
            <Link className="button button-primary" href="/student">
              {t("My page")}
            </Link>
            {back}
          </div>
        </section>
      </div>
    );

  if (phase === "result" && initial.kind === "approved")
    return (
      <Result
        title={title}
        result={initial.result}
        leaves={initial.leaves}
        note={initial.note}
        back={back}
        certificate={certificate}
      />
    );

  if (phase === "intro")
    return (
      <div className="rx-shell">
        <Intro title={title} />
        <section className="rx-card">
          <h2>{t("Rules")}</h2>
          <ul>
            <li>
              {t(
                "{count} questions from all {modules} modules of the domain, {minutes} minutes. The time starts when you press “Start the exam”, and your answers are sent automatically when it runs out.",
                {
                  count:
                    initial.kind === "new" ? initial.count : questions.length,
                  modules: domain.modules,
                  minutes: DOMAIN_EXAM_MINUTES,
                },
              )}
            </li>
            <li>
              {t(
                "The exam opens full screen. Copying, pasting, selecting text, right-clicking and printing are switched off, and leaving the exam window hides the questions and is recorded.",
              )}
            </li>
            <li>
              {t(
                "Your answers are saved as you go. You sit the exam once; your teacher can allow a retake.",
              )}
            </li>
            <li>
              {t(
                "You pass with {pass}%. The result appears after your teacher approves it, with an explanation for every question.",
                { pass: DOMAIN_EXAM_PASS },
              )}
            </li>
          </ul>
          {error && (
            <p role="alert" className="rx-error">
              {t(error)}
            </p>
          )}
          <div className="rx-actions">
            <button
              className="button button-primary"
              disabled={busy}
              onClick={() => void begin()}
            >
              {resumable ? t("Continue the exam") : t("Start the exam")}
            </button>
            {back}
          </div>
        </section>
      </div>
    );

  const empty = questions.length - answered;
  return (
    <div className="rx-shell lip-guard">
      <header className="rx-toolbar">
        <div>
          <span className="rx-eyebrow">{t("FINAL EXAM")}</span>
          <div className="rx-progress">
            {t("{done} of {count} answered", {
              done: answered,
              count: questions.length,
            })}
            {leaves > 0 && (
              <span className="lip-leaves">
                {" "}
                · {t("left the window: {count}", { count: leaves })}
              </span>
            )}
          </div>
        </div>
        <div
          className={`rx-timer ${remaining <= 300 ? "rx-timer-low" : ""}`}
          role="timer"
          aria-label={t("Time left")}
        >
          {clock(remaining)}
        </div>
        <div className="rx-submit">
          {confirming ? (
            <>
              <span>
                {empty > 0
                  ? `${t("{count} unanswered.", { count: empty })} `
                  : ""}
                {t("Submit now?")}
              </span>
              <button
                className="button button-primary"
                disabled={busy}
                onClick={() => void submit(answers)}
              >
                {busy ? t("Sending…") : t("Yes, submit")}
              </button>
              <button
                className="button button-secondary"
                onClick={() => setConfirming(false)}
              >
                {t("Cancel")}
              </button>
            </>
          ) : (
            <button
              className="button button-primary"
              onClick={() => setConfirming(true)}
            >
              {t("Submit")}
            </button>
          )}
        </div>
      </header>
      {error && (
        <p role="alert" className="rx-error">
          {t(error)}
        </p>
      )}

      {guard.hidden && (
        <div className="lip-cover" role="alertdialog" aria-modal="true">
          <div className="rx-card">
            <h2>{t("You left the exam window")}</h2>
            <p>
              {t(
                "The questions are hidden while another window, app or screenshot tool is in front. This was recorded: {count} times.",
                { count: leaves },
              )}
            </p>
            <button className="button button-primary" onClick={guard.back}>
              {t("Back to the exam")}
            </button>
          </div>
        </div>
      )}

      <div className="lip-body" aria-hidden={guard.hidden || undefined}>
        <section className="rx-card" aria-label={title}>
          {questions.map((q, index) => (
            <fieldset key={q.id} className="rx-question">
              <legend>
                <span className="rx-num">{index + 1}</span>
                {text(q.ask)}
                <small>{text(q.module)}</small>
              </legend>
              {q.code && <pre className="rx-scene">{q.code}</pre>}
              {q.options.map((option, optionIndex) => (
                <label key={optionIndex} className="rx-option">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === optionIndex}
                    onChange={() => pick(q.id, optionIndex)}
                  />
                  <span>{text(option)}</span>
                </label>
              ))}
            </fieldset>
          ))}
        </section>
      </div>
    </div>
  );
}

function Intro({ title }: { title: string }) {
  const { t } = useT();
  return (
    <section className="rx-intro">
      <span className="rx-eyebrow">
        {t("ACADEMY INTERMEDIATE · FINAL EXAM")}
      </span>
      <h1>{title}</h1>
      <p>
        {t(
          "One exam across every module of the domain. It checks what you kept from the labs, and your teacher sees exactly where to help next.",
        )}
      </p>
    </section>
  );
}

function Result({
  title,
  result,
  leaves,
  note,
  back,
  certificate,
}: {
  title: string;
  result: ExamResult;
  leaves: number;
  note: string;
  back: React.ReactNode;
  certificate: string | null;
}) {
  const { t, text } = useT();
  return (
    <div className="rx-shell">
      <section className="rx-card rx-result" aria-labelledby="dx-result">
        <span className="rx-eyebrow">{t("RESULT APPROVED")}</span>
        <h1 id="dx-result">{title}</h1>
        <p className="rx-score">
          {t("{score} of {total} · {percent}%", {
            score: result.score,
            total: result.total,
            percent: result.percent,
          })}{" "}
          — {result.passed ? t("Passed") : t("Not passed yet")}
        </p>
        {leaves > 0 && (
          <p>
            {t("You left the exam window {count} times.", { count: leaves })}
          </p>
        )}
        {note && (
          <p>
            <b>{t("From your teacher:")}</b> {note}
          </p>
        )}
        <div className="rx-actions">
          {certificate && (
            <Link
              className="button button-primary"
              href={`/student/certificate/${certificate}`}
            >
              {t("Open your certificate")}
            </Link>
          )}
          {back}
        </div>
      </section>
      <section className="rx-card" aria-label={t("Every question")}>
        {result.items.map((item, index) => (
          <article
            key={item.id}
            className={`rx-review ${item.correct ? "rx-ok" : "rx-bad"}`}
          >
            <h4>
              <span aria-hidden="true">{item.correct ? "✓" : "✗"}</span>
              {index + 1}. {text(item.ask)}
              <small>{text(item.module)}</small>
            </h4>
            {item.code && <pre className="rx-scene">{item.code}</pre>}
            <p>
              <b>{t("Your answer:")}</b>{" "}
              {item.picked === null
                ? t("No answer")
                : text(item.options[item.picked])}
            </p>
            {!item.correct && (
              <p>
                <b>{t("Right answer:")}</b> {text(item.options[item.answer])}
              </p>
            )}
            <p className="rx-explain">{text(item.explain)}</p>
            <p>
              <Link href={item.href}>
                {t("Revisit: {module}", { module: text(item.module) })} →
              </Link>
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
