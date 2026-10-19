import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";
import { quizSchema } from "@/lib/student/quiz";
import { answerReview } from "@/lib/student/quiz-stats";
import { ReviewForm } from "./student-forms";

type Row = {
  id: string;
  heading: string;
  href: string;
  kind: string;
  body: string;
  answers?: unknown;
  /** The material's questions, to show a quiz attempt answer by answer. */
  quiz?: unknown;
  score: number | null;
  maxScore: number | null;
  feedback: string;
  reviewedAt: Date | null;
  createdAt: Date;
};

const stamp = (date: Date) =>
  date.toISOString().slice(0, 16).replace("T", " ") + " UTC";

// Shared by a student's page (heading = material), a material's page
// (heading = student) and the grading queue. Quiz attempts show the server
// score and each answer; practice answers carry a review form.
export async function SubmissionList({ submissions }: { submissions: Row[] }) {
  const t = await getAdminTranslator();
  if (!submissions.length) return <p className="muted">{t("Nothing yet.")}</p>;
  return (
    <ol className="student-submissions">
      {submissions.map((s) => (
        <li key={s.id}>
          <p>
            <Link href={s.href}>
              <strong>{s.heading}</strong>
            </Link>{" "}
            <span className="muted">{stamp(s.createdAt)}</span>
          </p>
          {s.kind === "QUIZ" ? (
            <QuizAttempt row={s} t={t} />
          ) : (
            <>
              <pre className="student-submission-body">{s.body}</pre>
              {!s.reviewedAt && (
                <p className="admin-warn">{t("Waiting for review")}</p>
              )}
              <ReviewForm id={s.id} score={s.score} feedback={s.feedback} />
            </>
          )}
        </li>
      ))}
    </ol>
  );
}

function QuizAttempt({
  row,
  t,
}: {
  row: Row;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const quiz = quizSchema.safeParse(row.quiz);
  const review = quiz.success ? answerReview(quiz.data, row.answers) : null;
  return (
    <>
      <p>
        {t("Test result: {score} of {total}", {
          score: row.score ?? 0,
          total: row.maxScore ?? 0,
        })}
      </p>
      {review && (
        <details className="admin-answers">
          <summary>{t("Answers question by question")}</summary>
          <ol>
            {review.map((item, i) => (
              <li key={i} className={item.right ? "ok" : "wrong"}>
                <strong>{item.prompt}</strong>
                <span>
                  {item.right ? "✓" : "✗"} {item.chosen ?? t("No answer")}
                  {!item.right &&
                    ` · ${t("Right answer: {answer}", { answer: item.answer })}`}
                </span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </>
  );
}
