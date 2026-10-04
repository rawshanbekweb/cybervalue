import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";

const PAGE_SIZE = 200;
const warning = new Set(["login.failure", "login.mfa_failure", "mfa.disable"]);

export default async function AuditPage() {
  await requireAdmin("/admin/audit");
  const events =
    (await getDb()?.adminEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
    })) ?? [];
  return (
    <div className="admin-page">
      <h1>Audit log</h1>
      <p className="muted">
        Latest {PAGE_SIZE} security events. Entries are kept for 180 days.
      </p>
      {!events.length ? (
        <p>No events recorded yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Time (UTC)</th>
                <th scope="col">Event</th>
                <th scope="col">Target</th>
                <th scope="col">Client</th>
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
