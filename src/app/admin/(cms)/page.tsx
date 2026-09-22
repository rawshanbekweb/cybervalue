import Link from "next/link";
import { getDb } from "@/lib/db";
import { collections, collectionFor } from "@/lib/site";
import { formatDate } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  await requireAdmin("/admin");
  const db = getDb();
  const [counts, recent] = db
    ? await Promise.all([
        db.content.groupBy({ by: ["kind", "status"], _count: true }),
        db.content.findMany({
          orderBy: { updatedAt: "desc" },
          take: 10,
          select: {
            id: true,
            kind: true,
            slug: true,
            title: true,
            status: true,
            updatedAt: true,
          },
        }),
      ])
    : [[], []];

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>
      {!db && (
        <p className="admin-error">
          DATABASE_URL is not configured — nothing can be read or written.
        </p>
      )}
      <div className="admin-cards">
        {Object.entries(collections).map(([key, value]) => {
          const total = counts
            .filter((c) => c.kind === value.kind)
            .reduce((sum, c) => sum + c._count, 0);
          const published =
            counts.find(
              (c) => c.kind === value.kind && c.status === "PUBLISHED",
            )?._count ?? 0;
          const drafts =
            counts.find((c) => c.kind === value.kind && c.status === "DRAFT")
              ?._count ?? 0;
          const archived =
            counts.find((c) => c.kind === value.kind && c.status === "ARCHIVED")
              ?._count ?? 0;
          return (
            <Link key={key} href={`/admin/${key}`} className="admin-card">
              <span className="eyebrow">{value.title}</span>
              <strong>{total}</strong>
              <span className="muted">{published} published</span>
              <span className="muted">
                {drafts} drafts · {archived} archived
              </span>
            </Link>
          );
        })}
      </div>
      <h2>Recently updated</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Kind</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((entry) => (
            <tr key={entry.id}>
              <td>
                <Link
                  href={`/admin/${collectionFor(entry.kind)}/${entry.slug}`}
                >
                  {entry.title}
                </Link>
              </td>
              <td>{entry.kind}</td>
              <td>{entry.status}</td>
              <td>{formatDate(entry.updatedAt)}</td>
            </tr>
          ))}
          {recent.length === 0 && (
            <tr>
              <td colSpan={4} className="muted">
                Nothing yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
