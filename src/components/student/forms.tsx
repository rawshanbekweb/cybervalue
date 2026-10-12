"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslator } from "@/components/locale-provider";
import {
  submitFlagAction,
  submitPracticeAction,
  submitQuizAction,
} from "@/app/student/actions";
import type { PublicQuestion } from "@/lib/student/quiz";

export function PracticeForm({ slug }: { slug: string }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    submitPracticeAction.bind(null, slug),
    undefined,
  );
  return (
    <form action={action} className="student-form">
      <label htmlFor="practice-body" className="student-field-label">
        {t("Write your solution, findings or a link to your work")}
      </label>
      <textarea
        id="practice-body"
        name="body"
        required
        rows={10}
        maxLength={20000}
        className="student-input student-textarea"
        key={state?.at ?? "draft"}
        defaultValue={state?.draft}
      />
      {state?.error && (
        <p className="student-error" role="alert">
          {t(state.error)}
        </p>
      )}
      {state?.success && (
        <p className="student-success" role="status">
          {t(state.success)}
        </p>
      )}
      <button type="submit" className="student-button" disabled={pending}>
        {pending ? t("Sending…") : t("Submit")}
      </button>
    </form>
  );
}

// The page re-renders after a graded attempt and shows its result, so the
// form itself only reports errors.
const clock = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
};

// Counts down from the server's remaining time (not the device clock, which
// may be wrong) and submits whatever is answered when it reaches zero. The
// server enforces the deadline either way.
function QuizTimer({
  msLeft,
  formRef,
}: {
  msLeft: number;
  formRef: React.RefObject<HTMLFormElement | null>;
}) {
  const t = useTranslator();
  const [left, setLeft] = useState(msLeft);
  useEffect(() => {
    const end = performance.now() + msLeft;
    let sent = false;
    const tick = () => {
      const now = end - performance.now();
      setLeft(now);
      if (now <= 0 && !sent && formRef.current) {
        sent = true;
        // Unanswered questions must not block the automatic submission.
        formRef.current.noValidate = true;
        formRef.current.requestSubmit();
      }
    };
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [msLeft, formRef]);
  return (
    <p
      className={`student-timer${left < 60_000 ? " is-urgent" : ""}`}
      role="timer"
      aria-label={t("Time left")}
    >
      <span>{t("Time left")}</span>
      <strong>{clock(left)}</strong>
    </p>
  );
}

export function QuizForm({
  slug,
  questions,
  msLeft,
}: {
  slug: string;
  questions: PublicQuestion[];
  // Set on a timed test: milliseconds until the deadline.
  msLeft?: number;
}) {
  const t = useTranslator();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    submitQuizAction.bind(null, slug),
    undefined,
  );
  return (
    <form ref={formRef} action={action} className="student-form">
      {msLeft !== undefined && <QuizTimer msLeft={msLeft} formRef={formRef} />}
      <ol className="student-quiz">
        {questions.map((question) => (
          <li key={question.index}>
            <fieldset>
              <legend className="student-question">{question.prompt}</legend>
              {question.options.map((option) => (
                <label key={option.value} className="student-option">
                  <input
                    type="radio"
                    name={`q${question.index}`}
                    value={option.value}
                    required
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>
          </li>
        ))}
      </ol>
      {state?.error && (
        <p className="student-error" role="alert">
          {t(state.error)}
        </p>
      )}
      <button type="submit" className="student-button" disabled={pending}>
        {pending ? t("Checking…") : t("Submit answers")}
      </button>
    </form>
  );
}

export function FlagForm({ slug }: { slug: string }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    submitFlagAction.bind(null, slug),
    undefined,
  );
  return (
    <form action={action} className="student-form">
      <label htmlFor="flag" className="student-field-label">
        {t("Flag")}
      </label>
      <input
        id="flag"
        name="flag"
        required
        maxLength={200}
        autoComplete="off"
        spellCheck={false}
        placeholder="CV{...}"
        aria-invalid={state?.error ? true : undefined}
        aria-describedby={state?.error ? "flag-error" : undefined}
        className="student-input student-flag-input"
      />
      {state?.error && (
        <p id="flag-error" className="student-error" role="alert">
          {t(state.error, state.values)}
        </p>
      )}
      <button type="submit" className="student-button" disabled={pending}>
        {pending ? t("Checking…") : t("Check flag")}
      </button>
    </form>
  );
}
