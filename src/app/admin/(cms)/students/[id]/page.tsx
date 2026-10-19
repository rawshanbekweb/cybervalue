import Link from "next/link";
import { ParentAccess } from "@/components/admin/parent-access";
import { notFound } from "next/navigation";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { loadStandings } from "@/lib/student/standing";
import { CHECKPOINT_META } from "@/lib/checkpoints/meta";
import { requireMember } from "@/lib/staff-guard";
import { getDb } from "@/lib/db";
import { studentHistory } from "@/lib/admin/analytics";
import { ActivityHistory } from "@/components/admin/activity-history";
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
  await requireMember("student", id, `/admin/students/${id}`);
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
  const locale = await getAdminLocale();
  const [standings, checkpoints, parentChats, ownChats, history] =
    await Promise.all([
      loadStandings(db, [student]),
      db.studentCheckpoint.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      db.telegramChat.count({
        where: { subject: `parent:student:${student.id}` },
      }),
      db.telegramChat.count({ where: { subject: `student:${student.id}` } }),
      studentHistory(db, student.id, locale),
    ]);
  const standing = standings.get(student.id)!;
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
      <div className="admin-cards">
        <div className="admin-card">
          <span className="eyebrow">{t("Rank")}</span>
          <strong>{standing.xp} XP</strong>
          <span className="muted">{standing.rank.title[locale]}</span>
        </div>
        <div className="admin-card">
          <span className="eyebrow">{t("Completed")}</span>
          <strong>
            {standing.done}/{standing.available}
          </strong>
          <span className="muted">
            {standing.average === null
              ? t("No tests yet")
              : t("test average {percent}%", { percent: standing.average })}
          </span>
        </div>
        <div className="admin-card">
          <span className="eyebrow">{t("This week")}</span>
          <strong>{standing.week}</strong>
          <span className="muted">
            {t("{weeks}-week streak", { weeks: standing.streakWeeks })}
          </span>
        </div>
        <div className="admin-card">
          <span className="eyebrow">{t("Badges")}</span>
          <strong>{standing.badges.length}</strong>
          <span className="muted">
            {standing.lastActive
              ? `${t("Last activity")}: ${standing.lastActive.toISOString().slice(0, 10)}`
              : t("No activity yet")}
          </span>
        </div>
      </div>
      <ActivityHistory
        days={history.days}
        from={history.from}
        items={history.items}
        locale={locale}
        t={t}
      />
      <h2>{t("Lab checkpoints")}</h2>
      {checkpoints.length === 0 ? (
        <p className="muted">{t("No lab checkpoints yet")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t("Checkpoint")}</th>
                <th scope="col">{t("Score")}</th>
                <th scope="col">{t("Date")}</th>
              </tr>
            </thead>
            <tbody>
              {checkpoints.map((c) => {
                const meta = CHECKPOINT_META.find((m) => m.id === c.checkpoint);
                const percent = Math.round((c.score / c.total) * 100);
                return (
                  <tr key={c.id}>
                    <td>{meta ? meta.title[locale] : c.checkpoint}</td>
                    <td>
                      <span
                        className={`admin-chip ${meta && percent >= meta.pass ? "ok" : "warn"}`}
                      >
                        {percent}%
                      </span>{" "}
                      {c.score}/{c.total}
                    </td>
                    <td>
                      {c.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <h2>{t("Details")}</h2>
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
            className="button button-danger"
            message={t(
              "Move this student with all answers and progress to the trash? You can restore them for 30 days.",
            )}
          >
            {t("Delete student")}
          </ConfirmButton>
        </form>
      </div>
      <p className="muted">
        Telegram:{" "}
        {ownChats
          ? t("the student gets assignment reminders in Telegram.")
          : t(
              "the student has not linked Telegram yet (the button is on their own page).",
            )}
      </p>
      <ParentAccess
        kind="student"
        id={student.id}
        token={student.reportToken}
        chats={parentChats}
        t={t}
      />
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
