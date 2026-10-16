"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ClipboardCheck, RotateCcw, Trophy, X } from "lucide-react";
import { useT } from "../network-lab/use-t";
import { checkpointMeta, type CheckpointMeta } from "@/lib/checkpoints/meta";
import type { Text } from "@/lib/network/ip";
import "./checkpoint.css";

type Best = Record<string, { percent: number; attempts: number }>;
type Status = { signedIn: boolean; name?: string; best?: Best };
type Asked = { ask: Text; code?: string; options: Text[] };
type Result = {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  saved: boolean;
  // Certificates this result just earned.
  certificates?: string[];
  correct: boolean[];
  review: { answer: number; explain: Text }[];
};

const ENDPOINT = "/student/api/checkpoint";

async function call(body: object) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return {
    ok: response.ok,
    status: response.status,
    data: await response.json(),
  };
}

// Checkpoint tests at the end of a lab. The server builds and grades the
// questions; a signed-in student's result goes to their page and the teacher.
export function Checkpoints({ ids }: { ids: string[] }) {
  const { t } = useT();
  const [status, setStatus] = useState<Status | null>(null);
  const refresh = () =>
    fetch(ENDPOINT)
      .then((r) => (r.ok ? r.json() : { signedIn: false }))
      .then(setStatus)
      .catch(() => setStatus({ signedIn: false }));
  useEffect(() => {
    refresh();
  }, []);
  return (
    <section id="checkpoints" className="cp-section" aria-labelledby="cp-title">
      <header className="cp-head">
        <span className="eyebrow">
          <span className="status-dot" /> {t("CHECKPOINTS")}
        </span>
        <h2 id="cp-title">
          {t("Got it?")} <span>{t("Prove it.")}</span>
        </h2>
        <p>
          {status?.signedIn
            ? t(
                "{name}, your result goes to your student page and your teacher.",
                { name: status.name ?? "" },
              )
            : t(
                "Fresh questions every time. Sign in to the student area first to save your result.",
              )}
          {status && !status.signedIn && (
            <>
              {" "}
              <Link href="/student/login" className="cp-link">
                {t("Student sign-in")}
              </Link>
            </>
          )}
        </p>
      </header>
      <div className="cp-list">
        {ids.map((id) => {
          const meta = checkpointMeta(id);
          return meta ? (
            <CheckpointCard
              key={id}
              meta={meta}
              best={status?.best?.[id]}
              onDone={refresh}
            />
          ) : null;
        })}
      </div>
    </section>
  );
}

function CheckpointCard({
  meta,
  best,
  onDone,
}: {
  meta: CheckpointMeta;
  best?: { percent: number; attempts: number };
  onDone: () => void;
}) {
  const { t, text } = useT();
  const [attempt, setAttempt] = useState<{
    token: string;
    questions: Asked[];
  } | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const start = async () => {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const { ok, data } = await call({ action: "start", id: meta.id });
      if (!ok) throw new Error();
      setAttempt(data);
      setAnswers(data.questions.map(() => null));
    } catch {
      setError(t("The checkpoint could not start. Try again shortly."));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!attempt) return;
    setBusy(true);
    setError("");
    try {
      const { ok, status, data } = await call({
        action: "submit",
        token: attempt.token,
        answers,
      });
      if (!ok)
        throw new Error(
          status === 409
            ? t("These questions were already graded.")
            : t(
                "Time ran out or something failed. Start the checkpoint again.",
              ),
        );
      setResult(data);
      onDone();
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "");
    } finally {
      setBusy(false);
    }
  };

  const answered = answers.filter((a) => a !== null).length;
  return (
    <article className="cp-card" aria-labelledby={`cp-${meta.id}`}>
      <div className="cp-card-head">
        <span className="cp-ring" aria-hidden="true">
          <ClipboardCheck size={18} />
        </span>
        <div>
          <h3 id={`cp-${meta.id}`}>{text(meta.title)}</h3>
          <p>
            {text(meta.covers)} · {t("pass")} {meta.pass}%
          </p>
        </div>
        {best && (
          <span
            className={`cp-best ${best.percent >= meta.pass ? "pass" : ""}`}
          >
            {best.percent >= meta.pass && (
              <Trophy size={13} aria-hidden="true" />
            )}
            {t("Best")} {best.percent}% · {best.attempts}{" "}
            {text({ uz: "urinish", en: best.attempts === 1 ? "try" : "tries" })}
          </span>
        )}
      </div>

      {!attempt && (
        <button
          type="button"
          className="button button-primary cp-start"
          onClick={start}
          disabled={busy}
        >
          {busy ? t("Preparing…") : t("Take the test")}
        </button>
      )}

      {attempt && (
        <form
          className="cp-form"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <ol>
            {attempt.questions.map((q, i) => {
              const review = result?.review[i];
              const right = result?.correct[i];
              return (
                <li key={i} className={result ? (right ? "ok" : "bad") : ""}>
                  <fieldset disabled={Boolean(result)}>
                    <legend>
                      {text(q.ask)}
                      {result && (
                        <span
                          className="cp-mark"
                          role="img"
                          aria-label={right ? t("Correct") : t("Wrong")}
                        >
                          {right ? <Check size={15} /> : <X size={15} />}
                        </span>
                      )}
                    </legend>
                    {q.code && <code className="cp-code">{q.code}</code>}
                    {q.options.map((option, j) => (
                      <label
                        key={j}
                        className={
                          review && j === review.answer ? "cp-right" : undefined
                        }
                      >
                        <input
                          type="radio"
                          name={`${meta.id}-${i}`}
                          checked={answers[i] === j}
                          onChange={() =>
                            setAnswers(answers.map((a, k) => (k === i ? j : a)))
                          }
                        />
                        <span>{text(option)}</span>
                      </label>
                    ))}
                    {review && !right && (
                      <p className="cp-explain">{text(review.explain)}</p>
                    )}
                  </fieldset>
                </li>
              );
            })}
          </ol>
          {!result ? (
            <div className="cp-actions">
              <span>
                {answered}/{attempt.questions.length} {t("answered")}
              </span>
              <button
                type="submit"
                className="button button-primary"
                disabled={busy}
              >
                {busy ? t("Checking…") : t("Submit")}
              </button>
            </div>
          ) : (
            <div
              className={`cp-result ${result.passed ? "pass" : ""}`}
              role="status"
            >
              <strong>
                {result.score}/{result.total} · {result.percent}%
              </strong>
              <span>
                {result.passed
                  ? t("Checkpoint passed!")
                  : t(
                      "You need {pass}% to pass. Review the lessons and try again.",
                      { pass: meta.pass },
                    )}
                {result.saved && ` ${t("Result saved.")}`}
              </span>
              {result.certificates?.map((title) => (
                <Link
                  key={title}
                  href="/student#certificates"
                  className="cp-award"
                >
                  {t("New certificate: {title}", { title })}
                </Link>
              ))}
              <button
                type="button"
                className="button button-secondary"
                onClick={start}
              >
                <RotateCcw size={14} aria-hidden="true" />{" "}
                {t("Try new questions")}
              </button>
            </div>
          )}
        </form>
      )}
      {error && (
        <p className="cp-error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}
