import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Download } from "lucide-react";
import { getAdminTranslator, getAdminLocale } from "@/lib/i18n/server";
import { getDb } from "@/lib/db";
import { requireStudent } from "@/lib/student/session";
import { materialForStudent } from "@/lib/student/materials";
import { gradeQuiz, publicQuiz, quizSchema } from "@/lib/student/quiz";
import { Markdown } from "@/components/markdown";
import { FlagForm, PracticeForm, QuizForm } from "@/components/student/forms";
import { markCompleteAction } from "../../../actions";

const KIND_LABEL = {
  LESSON: "Lesson",
  LAB: "Lab",
  PRACTICE: "Practice",
  QUIZ: "Test",
  CHALLENGE: "Personal lab",
} as const;

export default async function StudentMaterialPage({
  params,
}: PageProps<"/student/m/[slug]">) {
  const { slug } = await params;
  const student = await requireStudent();
  const material = await materialForStudent(student, slug);
  if (!material) notFound();
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const db = getDb()!;
  const [submissions, progress] = await Promise.all([
    db.studentSubmission.findMany({
      where: { studentId: student.id, materialId: material.id },
      orderBy: { createdAt: "desc" },
    }),
    db.studentProgress.findUnique({
      where: {
        studentId_materialId: {
          studentId: student.id,
          materialId: material.id,
        },
      },
    }),
  ]);
  const date = new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tashkent",
  });
  const quiz = quizSchema.safeParse(material.quiz);
  const answers = submissions[0]?.answers;
  const latest =
    quiz.success && Array.isArray(answers)
      ? gradeQuiz(quiz.data, answers)
      : null;
  const attemptsLeft =
    material.maxAttempts > 0
      ? Math.max(0, material.maxAttempts - submissions.length)
      : null;

  return (
    <article className="student-material">
      <Link href="/student" className="student-ghost student-back">
        <ArrowLeft size={16} aria-hidden="true" />
        {t("All materials")}
      </Link>
      <header className="student-material-head">
        <p className="student-label">{t(KIND_LABEL[material.kind])}</p>
        <h1 className="student-title">{material.title}</h1>
        {material.summary && <p className="student-lead">{material.summary}</p>}
      </header>

      {material.body && (
        <div className="student-prose">
          <Markdown>{material.body}</Markdown>
        </div>
      )}

      {(material.kind === "LESSON" || material.kind === "LAB") && (
        <div className="student-actions">
          {progress ? (
            <p className="student-done student-done-large">
              <Check size={18} aria-hidden="true" />
              {t("Completed on {date}", {
                date: date.format(progress.completedAt),
              })}
            </p>
          ) : (
            <form action={markCompleteAction.bind(null, material.slug)}>
              <button type="submit" className="student-button">
                {t("Mark as complete")}
              </button>
            </form>
          )}
        </div>
      )}

      {material.kind === "PRACTICE" && (
        <section className="student-work" aria-labelledby="practice-title">
          <h2 id="practice-title" className="student-heading-sm">
            {t("Your answer")}
          </h2>
          <PracticeForm slug={material.slug} />
          {submissions.length > 0 && (
            <>
              <h3 className="student-subtitle">{t("Submitted answers")}</h3>
              <ol className="student-history">
                {submissions.map((s) => (
                  <li key={s.id}>
                    <p className="student-meta">
                      {date.format(s.createdAt)}
                      {" · "}
                      {s.reviewedAt
                        ? s.score !== null
                          ? t("Reviewed · {score} points", { score: s.score })
                          : t("Reviewed")
                        : t("Waiting for review")}
                    </p>
                    <pre className="student-answer">{s.body}</pre>
                    {s.feedback && (
                      <div className="student-feedback">
                        <p className="student-label">{t("Teacher")}</p>
                        <p>{s.feedback}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      )}

      {material.kind === "CHALLENGE" && (
        <section className="student-work" aria-labelledby="lab-title">
          <h2 id="lab-title" className="student-heading-sm">
            {t("Your personal lab")}
          </h2>
          <p className="student-quiet">
            {t(
              "This file was generated for you alone. Investigate it, find your flag in the form CV{...} and submit it. Flags from classmates will not work.",
            )}
          </p>
          <a
            href={`/student/m/${material.slug}/artifact`}
            className="student-download"
            download
          >
            <Download size={18} aria-hidden="true" />
            {t("Download {name}", { name: material.artifactName })}
          </a>
          {progress ? (
            <p className="student-done student-done-large student-solved">
              <Check size={18} aria-hidden="true" />
              {t("Solved on {date}", {
                date: date.format(progress.completedAt),
              })}
            </p>
          ) : attemptsLeft === 0 ? (
            <p className="student-quiet">
              {t("You have used all attempts for this lab.")}
            </p>
          ) : (
            <>
              <p className="student-quiet">
                {attemptsLeft === null
                  ? t("Unlimited attempts.")
                  : t("Attempts left: {left} of {total}.", {
                      left: attemptsLeft,
                      total: material.maxAttempts,
                    })}
              </p>
              <FlagForm slug={material.slug} />
            </>
          )}
        </section>
      )}

      {material.kind === "QUIZ" && (
        <section className="student-work" aria-labelledby="quiz-title">
          <h2 id="quiz-title" className="student-heading-sm">
            {t("Test")}
          </h2>
          <p className="student-quiet">
            {attemptsLeft === null
              ? t("Unlimited attempts.")
              : t("Attempts left: {left} of {total}.", {
                  left: attemptsLeft,
                  total: material.maxAttempts,
                })}
          </p>
          {submissions.length > 1 && (
            <ol className="student-history student-history-inline">
              {submissions.map((s) => (
                <li key={s.id}>
                  <strong>
                    {s.score}/{s.maxScore}
                  </strong>
                  <span className="student-meta">
                    {date.format(s.createdAt)}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {latest && (
            <div className="student-review">
              <p className="student-score" role="status">
                {t("Latest result: {score} of {total}", {
                  score: latest.score,
                  total: latest.maxScore,
                })}
              </p>
              {/* Marks which questions were right, never the answer key. */}
              <ol className="student-review-list">
                {quiz.data!.map((question, i) => (
                  <li key={i}>
                    <span className="student-review-prompt">
                      {question.prompt}
                    </span>
                    <span
                      className={
                        latest.results[i]
                          ? "student-mark-ok"
                          : "student-mark-bad"
                      }
                    >
                      {latest.results[i] ? t("Correct") : t("Incorrect")}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {!quiz.success ? (
            <p className="student-quiet">
              {t("This test has no questions yet.")}
            </p>
          ) : attemptsLeft === 0 ? (
            <p className="student-quiet">
              {t("You have used all attempts for this test.")}
            </p>
          ) : (
            <QuizForm slug={material.slug} questions={publicQuiz(quiz.data)} />
          )}
        </section>
      )}
    </article>
  );
}
