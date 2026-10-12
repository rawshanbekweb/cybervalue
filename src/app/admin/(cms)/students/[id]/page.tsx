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
import {
  deleteStudentAction,
  issueCertificateAction,
  setCertificateRevokedAction,
  signOutStudentAction,
} from "../actions";
import {
  CERTIFICATE_PATH,
  DEFAULT_CERTIFICATE_TITLE,
  formatCertificateCode,
} from "@/lib/student/certificate";
import { LEVEL_LABEL, LEVELS } from "@/lib/student/levels";
import { levelText } from "@/lib/student/results";

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
      certificates: { orderBy: { issuedAt: "desc" } },
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
          level: student.level,
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
      <h2>{t("Certificates")}</h2>
      {student.certificates.length > 0 && (
        <ul className="admin-certificates">
          {student.certificates.map((c) => (
            <li key={c.id}>
              <div>
                <strong>{c.title}</strong>
                {c.level && (
                  <span className="muted"> · {levelText(c.level, t)}</span>
                )}
                <span className="muted">
                  {" · "}
                  {c.issuedAt.toISOString().slice(0, 10)}
                </span>
                {c.revokedAt && (
                  <span className="admin-warn"> · {t("Revoked")}</span>
                )}
                <br />
                <a
                  href={`${CERTIFICATE_PATH}/${formatCertificateCode(c.code)}`}
                  target="_blank"
                  rel="noopener"
                >
                  {formatCertificateCode(c.code)}
                </a>
              </div>
              <form
                action={setCertificateRevokedAction.bind(
                  null,
                  c.id,
                  !c.revokedAt,
                )}
              >
                <button type="submit" className="button button-secondary">
                  {c.revokedAt ? t("Restore") : t("Revoke")}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <form
        action={issueCertificateAction.bind(null, student.id)}
        className="admin-form admin-certificate-form"
      >
        <div className="admin-field-row">
          <div className="admin-field">
            <label htmlFor="certificate-title">{t("Course title")}</label>
            <input
              id="certificate-title"
              name="title"
              className="admin-input"
              required
              maxLength={160}
              defaultValue={DEFAULT_CERTIFICATE_TITLE}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="certificate-level">{t("Level")}</label>
            <select
              id="certificate-level"
              name="level"
              className="admin-input"
              defaultValue={student.level}
            >
              <option value="">{t("Not shown")}</option>
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {t(LEVEL_LABEL[level])}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="muted">
          {t(
            "The student can print it from their page. Its QR code opens a public page that confirms the certificate; revoke it to mark it invalid there.",
          )}
        </p>
        <button type="submit" className="button button-primary">
          {t("Issue certificate")}
        </button>
      </form>
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
