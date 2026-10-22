import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminTranslator } from "@/lib/i18n/server";
import { groupWhere, requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { quizSchema, quizToText } from "@/lib/student/quiz";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { MaterialForm } from "@/components/admin/student-forms";
import { SubmissionList } from "@/components/admin/submission-list";
import { ChallengeResults } from "@/components/admin/challenge-results";
import { QuestionStats } from "@/components/admin/question-stats";
import { questionStats } from "@/lib/student/quiz-stats";
import { deleteMaterialAction } from "../actions";

export default async function EditMaterialPage({
  params,
  searchParams,
}: PageProps<"/teacher/materials/[id]">) {
  const { id } = await params;
  const { created } = await searchParams;
  const t = await getAdminTranslator();
  const { scope } = await requireStaff(`/teacher/materials/${id}`);
  const db = getDb();
  if (!db) notFound();
  const material = await db.studentMaterial.findUnique({
    where: { id },
    include: {
      // Answers still waiting for review come first.
      // A teacher sees their own groups' answers only.
      submissions: {
        where: scope.owner ? {} : { student: groupWhere(scope) },
        orderBy: [
          { reviewedAt: { sort: "asc", nulls: "first" } },
          { createdAt: "desc" },
        ],
        take: 2000,
        include: { student: { select: { id: true, name: true, group: true } } },
      },
      _count: { select: { progress: true } },
    },
  });
  if (!material) notFound();
  const quiz = quizSchema.safeParse(material.quiz);
  const analysis =
    material.kind === "QUIZ" && quiz.success
      ? questionStats(
          quiz.data,
          material.submissions.map((s) => s.answers),
        )
      : null;
  const scores = material.submissions
    .filter((s) => s.score !== null && s.maxScore)
    .map((s) => s.score! / s.maxScore!);
  const average = scores.length
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)
    : 0;
  return (
    <div className="admin-page">
      <Link href="/teacher/materials" className="muted">
        ← {t("Student materials")}
      </Link>
      <h1>{material.title}</h1>
      {created === "1" && <p role="status">{t("Material created.")}</p>}
      <p className="muted">
        {material.kind === "QUIZ"
          ? t("{count} attempts · average {average}%", {
              count: material.submissions.length,
              average,
            })
          : material.kind === "CHALLENGE"
            ? t("{count} flag attempts", {
                count: material.submissions.length,
              })
            : material.kind === "PRACTICE"
              ? t("{count} answers submitted", {
                  count: material.submissions.length,
                })
              : t("{count} students marked it complete", {
                  count: material._count.progress,
                })}
      </p>
      <MaterialForm
        id={material.id}
        defaults={{
          slug: material.slug,
          kind: material.kind,
          title: material.title,
          summary: material.summary,
          body: material.body,
          quizText: quiz.success ? quizToText(quiz.data) : "",
          artifact: material.artifact,
          artifactName: material.artifactName,
          explanation: material.explanation,
          maxAttempts: material.maxAttempts,
          timeLimit: material.timeLimit,
          groups: material.groups.join(", "),
          levels: material.levels,
          position: material.position,
          published: material.published,
        }}
      />
      <form
        action={deleteMaterialAction.bind(null, material.id)}
        className="admin-danger-zone"
      >
        <ConfirmButton
          type="submit"
          className="button button-danger"
          message={t(
            "Move this material with all student answers to the trash? You can restore it for 30 days.",
          )}
        >
          {t("Delete material")}
        </ConfirmButton>
      </form>
      {material.kind === "CHALLENGE" && (
        <>
          <h2>{t("Results")}</h2>
          <ChallengeResults
            material={material}
            attempts={material.submissions}
          />
        </>
      )}
      {analysis && (
        <>
          <h2>{t("Question analysis")}</h2>
          <QuestionStats {...analysis} t={t} />
        </>
      )}
      {(material.kind === "PRACTICE" || material.kind === "QUIZ") && (
        <>
          <h2>{t("Submissions")}</h2>
          <SubmissionList
            submissions={material.submissions.map((s) => ({
              ...s,
              heading: s.student.group
                ? `${s.student.name} · ${s.student.group}`
                : s.student.name,
              href: `/teacher/students/${s.student.id}`,
              kind: material.kind,
              quiz: material.quiz,
            }))}
          />
        </>
      )}
    </div>
  );
}
