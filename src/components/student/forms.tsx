"use client";
import { useActionState } from "react";
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
export function QuizForm({
  slug,
  questions,
}: {
  slug: string;
  questions: PublicQuestion[];
}) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    submitQuizAction.bind(null, slug),
    undefined,
  );
  return (
    <form action={action} className="student-form">
      <ol className="student-quiz">
        {questions.map((question, i) => (
          <li key={i}>
            <fieldset>
              <legend className="student-question">{question.prompt}</legend>
              {question.options.map((option, j) => (
                <label key={j} className="student-option">
                  <input type="radio" name={`q${i}`} value={j} required />
                  <span>{option}</span>
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
