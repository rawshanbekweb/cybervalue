import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminTranslator } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { SubmissionList } from "@/components/admin/submission-list";
import {
  ResetCodeForm,
  StudentEditForm,
} from "@/components/admin/student-forms";
import { deleteStudentAction, signOutStudentAction } from "../actions";

// The date input shows the Tashkent calendar day the access ends on.
const toDateInput = (date: Date | null) =>
  date
    ? new Date(date.getTime() + 5 * 3_600_000).toISOString().slice(0, 10)
    : "";

export default async function AdminStudentPage({
  params,
}: PageProps<"/admin/students/[id]">) {
  const { id } = await params;
  const t = await getAdminTranslator();
  await requireAdmin(`/admin/students/${id}`);
  const db = getDb();
  if (!db) notFound();
  const student = await db.student.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          sessions: { where: { expiresAt: { gt: new Date() } } },
          progress: true,
        },
      },
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          material: { select: { title: true, kind: true, id: true } },
        },
      },
    },
  });
  if (!student) notFound();
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/students" className="muted">
            ← {t("Students")}
          </Link>
          <h1>{student.name}</h1>
          <p className="muted">
            {t("{done} materials completed · {sessions} open sessions", {
              done: student._count.progress,
              sessions: student._count.sessions,
            })}
          </p>
        </div>
      </div>
      <StudentEditForm
        student={{
          id: student.id,
          name: student.name,
          group: student.group,
          note: student.note,
          active: student.active,
          expiresAt: toDateInput(student.expiresAt),
        }}
      />
      <h2>{t("Access")}</h2>
      <div className="admin-row-actions">
        <ResetCodeForm id={student.id} name={student.name} />
        <form action={signOutStudentAction.bind(null, student.id)}>
          <button type="submit" className="button button-secondary">
            {t("Sign out everywhere")}
          </button>
        </form>
        <form action={deleteStudentAction.bind(null, student.id)}>
          <ConfirmButton
            type="submit"
            className="button button-secondary"
            message={t(
              "Delete this student with all answers and progress? This cannot be undone.",
            )}
          >
            {t("Delete student")}
          </ConfirmButton>
        </form>
      </div>
      <h2>{t("Submissions")}</h2>
      <SubmissionList
        submissions={student.submissions.map((s) => ({
          ...s,
          heading: s.material.title,
          href: `/admin/materials/${s.material.id}`,
          kind: s.material.kind,
        }))}
      />
    </div>
  );
}
