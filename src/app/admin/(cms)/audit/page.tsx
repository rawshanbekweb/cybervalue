import { getAdminTranslator } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";

const PAGE_SIZE = 200;
const warning = new Set(["login.failure", "login.mfa_failure", "mfa.disable"]);

export default async function AuditPage() {
  const t = await getAdminTranslator();
  await requireAdmin("/admin/audit");
  const events =
    (await getDb()?.adminEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
    })) ?? [];
  return (
    <div className="admin-page">
      <h1>{t("Audit log")}</h1>
      <p className="muted">
        {t("Latest {count} security events. Entries are kept for 180 days.", {
          count: PAGE_SIZE,
        })}
      </p>
      {!events.length ? (
        <p>{t("No events recorded yet.")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t("Time (UTC)")}</th>
                <th scope="col">{t("Action")}</th>
                <th scope="col">{t("Target")}</th>
                <th scope="col">{t("Client")}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    <time dateTime={event.createdAt.toISOString()}>
                      {event.createdAt
                        .toISOString()
                        .slice(0, 19)
                        .replace("T", " ")}
                    </time>
                  </td>
                  <td>
                    {warning.has(event.action) ? (
                      <strong className="admin-warn">{event.action}</strong>
                    ) : (
                      event.action
                    )}
                  </td>
                  <td>{event.target ?? "—"}</td>
                  <td>{event.client ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
