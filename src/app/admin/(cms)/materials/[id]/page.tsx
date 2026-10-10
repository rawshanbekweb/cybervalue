import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminTranslator } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { quizSchema, quizToText } from "@/lib/student/quiz";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { MaterialForm } from "@/components/admin/student-forms";
import { SubmissionList } from "@/components/admin/submission-list";
import { deleteMaterialAction } from "../actions";

export default async function EditMaterialPage({
  params,
  searchParams,
}: PageProps<"/admin/materials/[id]">) {
  const { id } = await params;
  const { created } = await searchParams;
  const t = await getAdminTranslator();
  await requireAdmin(`/admin/materials/${id}`);
  const db = getDb();
  if (!db) notFound();
  const material = await db.studentMaterial.findUnique({
    where: { id },
    include: {
      // Answers still waiting for review come first.
      submissions: {
        orderBy: [
          { reviewedAt: { sort: "asc", nulls: "first" } },
          { createdAt: "desc" },
        ],
        take: 300,
        include: { student: { select: { id: true, name: true, group: true } } },
      },
      _count: { select: { progress: true } },
    },
  });
  if (!material) notFound();
  const quiz = quizSchema.safeParse(material.quiz);
  const scores = material.submissions
    .filter((s) => s.score !== null && s.maxScore)
    .map((s) => s.score! / s.maxScore!);
  const average = scores.length
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)
    : 0;
  return (
    <div className="admin-page">
      <Link href="/admin/materials" className="muted">
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
          maxAttempts: material.maxAttempts,
          groups: material.groups.join(", "),
          position: material.position,
          published: material.published,
        }}
      />
      <form action={deleteMaterialAction.bind(null, material.id)}>
        <ConfirmButton
          type="submit"
          className="button button-secondary"
          message={t(
            "Delete this material with all student answers? This cannot be undone.",
          )}
        >
          {t("Delete material")}
        </ConfirmButton>
      </form>
      {(material.kind === "PRACTICE" || material.kind === "QUIZ") && (
        <>
          <h2>{t("Submissions")}</h2>
          <SubmissionList
            submissions={material.submissions.map((s) => ({
              ...s,
              heading: s.student.group
                ? `${s.student.name} · ${s.student.group}`
                : s.student.name,
              href: `/admin/students/${s.student.id}`,
              kind: material.kind,
            }))}
          />
        </>
      )}
    </div>
  );
}
