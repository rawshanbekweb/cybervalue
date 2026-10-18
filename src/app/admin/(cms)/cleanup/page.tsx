import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { CLEANUPS, cleanupPreview } from "@/lib/admin/cleanup";
import { CleanupButton } from "@/components/admin/cleanup-button";

export default async function AdminCleanupPage() {
  const t = await getAdminTranslator();
  await requireOwner("/admin/cleanup");
  const db = getDb();
  const preview = db ? await cleanupPreview(db) : null;
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Clean-up")}</h1>
          <p className="muted">
            {t(
              "Remove what is no longer needed. Each step shows how much it deletes first; deleted data cannot be restored, so download a backup on the System status page before a big clean-up.",
            )}
          </p>
        </div>
        <Link href="/admin/status" className="button button-secondary">
          {t("Backup first")}
        </Link>
      </div>
      {!preview ? (
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      ) : (
        <div className="admin-cleanup">
          {CLEANUPS.map((c) => (
            <section
              key={c.id}
              className="admin-panel"
              aria-labelledby={`cleanup-${c.id}`}
            >
              <div className="admin-cleanup-head">
                <h2 id={`cleanup-${c.id}`}>{t(c.title)}</h2>
                <span
                  className={`admin-badge ${preview[c.id].count ? "" : "is-zero"}`}
                >
                  {preview[c.id].count}
                </span>
              </div>
              <p className="muted">{t(c.detail)}</p>
              {preview[c.id].names.length > 0 && (
                <p className="admin-cleanup-names">
                  {preview[c.id].names.join(", ")}
                  {preview[c.id].count > preview[c.id].names.length && " …"}
                </p>
              )}
              <CleanupButton
                id={c.id}
                count={preview[c.id].count}
                people={c.people}
              />
            </section>
          ))}
          <section className="admin-panel" aria-labelledby="cleanup-more">
            <h2 id="cleanup-more">{t("Also")}</h2>
            <ul className="admin-list">
              <li>
                <Link href="/admin/users">{t("Delete chosen users")}</Link>
                <span className="muted">
                  {t("Filter, tick the rows and choose “Delete permanently”.")}
                </span>
              </li>
              <li>
                <Link href="/admin/files">{t("Unused files")}</Link>
                <span className="muted">
                  {t("Files that no page uses can be deleted there.")}
                </span>
              </li>
              <li>
                <Link href="/admin/materials">{t("Student materials")}</Link>
                <span className="muted">
                  {t("Delete a material from its own page.")}
                </span>
              </li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
