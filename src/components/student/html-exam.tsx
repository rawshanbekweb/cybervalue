"use client";
import { useActionState } from "react";
import { useTranslator } from "@/components/locale-provider";
import { startHtmlExamAction } from "@/app/student/actions";

export type HtmlExamItem = {
  id: string;
  title: string;
  minutes: number;
  state: "ready" | "running" | "done";
  score: number | null;
};

// An HTML exam the teacher gave this account: start or continue it without
// the separate access code.
export function HtmlExamCard({ exam }: { exam: HtmlExamItem }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    startHtmlExamAction.bind(null, exam.id),
    undefined,
  );
  return (
    <li>
      <div className="student-item student-html-exam">
        <span className="student-item-title">{exam.title}</span>
        <span className="student-item-summary">
          {exam.state === "done"
            ? exam.score === null
              ? t("Handed in. Your teacher will check it.")
              : t("Handed in · {score} of 90 points before review", {
                  score: exam.score,
                })
            : t("HTML exam · {minutes} minutes, one attempt", {
                minutes: exam.minutes,
              })}
        </span>
        {exam.state !== "done" && (
          <form action={action} className="student-item-status">
            <button type="submit" className="student-button" disabled={pending}>
              {exam.state === "running"
                ? t("Continue the exam")
                : t("Start the exam")}
            </button>
            {state?.error && (
              <span role="alert" className="student-error">
                {state.error}
              </span>
            )}
          </form>
        )}
      </div>
    </li>
  );
}
