import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDue } from "@/lib/student/assignments";

const PAGE_SIZE = 50;
const warning = new Set(["login.failure", "login.mfa_failure", "mfa.disable"]);

// What each recorded action means; the raw code stays visible next to it.
const ACTIONS: Record<string, string> = {
  "login.success": "Signed in",
  "login.failure": "Failed sign-in",
  "login.mfa_failure": "Wrong 2FA code",
  "login.recovery_code": "Signed in with a recovery code",
  logout: "Signed out",
  "mfa.enable": "2FA turned on",
  "mfa.disable": "2FA turned off",
  "password.change": "Password changed",
  "sessions.revoke": "Other sessions signed out",
  "content.create": "Content created",
  "content.update": "Content edited",
  "content.status": "Content status changed",
  "content.delete": "Content deleted",
  "file.upload": "File uploaded",
  "file.delete": "File deleted",
  "assessment.create": "HTML test created",
  "linux-ip-exam.review": "Linux and IP exam reviewed",
  "linux-ip-exam.retake": "Linux and IP exam retake allowed",
  "student.create": "Students added",
  "student.update": "Student edited",
  "student.level": "Student level set",
  "certificate.issue": "Certificate issued",
  "certificate.revoke": "Certificate revoked",
  "certificate.restore": "Certificate restored",
  "student.code_reset": "Student access code renewed",
  "student.delete": "Student deleted",
  "material.create": "Material created",
  "material.update": "Material edited",
  "material.delete": "Material deleted",
  "submission.review": "Answer reviewed",
  "portrait.update": "Portrait updated",
  "portrait.reset": "Portrait reset",
  "settings.update": "Site settings saved",
  "users.bulk": "Bulk action on users",
  "junior.create": "Junior members added",
  "junior.update": "Junior member edited",
  "junior.code_reset": "Junior access code renewed",
  "junior.progress_reset": "Junior progress reset",
  "junior.delete": "Junior member deleted",
  "junior.promote": "Junior member moved to the Academy",
  "assignment.create": "Assignment created",
  "assignment.delete": "Assignment deleted",
  "report.link": "Parent report link changed",
  "telegram.webhook": "Telegram bot connected",
  "telegram.unlink": "Telegram chat unlinked",
  "telegram.broadcast": "Telegram message sent",
  "data.export": "Data exported",
  "kids.create": "Kids members added",
  "kids.update": "Kids member edited",
  "kids.code_reset": "Kids access code renewed",
  "kids.progress_reset": "Kids progress reset",
  "kids.delete": "Kids member deleted",
  "kids.promote": "Kids member moved to Junior",
  "cleanup.run": "Clean-up run",
  "staff.create": "Team member added",
  "staff.update": "Team member changed",
  "staff.password_reset": "Team member password reset",
  "staff.delete": "Team member deleted",
  "group.rename": "Group renamed",
  "group.teachers": "Group teachers changed",
  "trash.restore": "Restored from the trash",
  "trash.purge": "Deleted from the trash",
  "trash.empty": "Trash emptied",
};

export default async function AuditPage({
  searchParams,
}: PageProps<"/admin/audit">) {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  await requireOwner("/admin/audit");
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Math.min(100, Number(pageParam) || 1));
  const db = getDb();
  const [events, total] = db
    ? await Promise.all([
        db.adminEvent.findMany({
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
        db.adminEvent.count(),
      ])
    : [[], 0];
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="admin-page">
      <h1>{t("Audit log")}</h1>
      <p className="muted">
        {t("{count} security events. Entries are kept for 180 days.", {
          count: total,
        })}
      </p>
      {!events.length ? (
        <p>{t("No events recorded yet.")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table admin-audit-table" tabIndex={0}>
            <thead>
              <tr>
                <th scope="col">{t("Time")}</th>
                <th scope="col">{t("Action")}</th>
                <th scope="col">{t("Target")}</th>
                <th scope="col">{t("Client")}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="admin-nowrap">
                    <time dateTime={event.createdAt.toISOString()}>
                      {formatDue(event.createdAt, locale)}
                    </time>
                  </td>
                  <td>
                    {warning.has(event.action) ? (
                      <strong className="admin-warn">
                        {t(ACTIONS[event.action] ?? event.action)}
                      </strong>
                    ) : (
                      t(ACTIONS[event.action] ?? event.action)
                    )}
                    <code className="admin-cell-detail">{event.action}</code>
                  </td>
                  <td className="admin-file-path">{event.target ?? "—"}</td>
                  <td>{event.client ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <nav className="admin-pagination" aria-label={t("Pages")}>
          {page > 1 ? (
            <Link href={`/admin/audit?page=${page - 1}`}>← {t("Newer")}</Link>
          ) : (
            <span />
          )}
          <span className="muted">
            {t("Page {page} of {pages}", { page, pages })}
          </span>
          {page < pages ? (
            <Link href={`/admin/audit?page=${page + 1}`}>{t("Older")} →</Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
