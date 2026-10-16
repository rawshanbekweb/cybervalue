import { getAdminTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { collections, collectionFor } from "@/lib/site";
import { formatDate } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const t = await getAdminTranslator();
  await requireAdmin("/admin");
  const db = getDb();
  const week = new Date(new Date().getTime() - 7 * 86_400_000);
  const [counts, recent, academy] = db
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
        Promise.all([
          db.student.count(),
          db.student.count({ where: { lastLoginAt: { gte: week } } }),
          db.studentSubmission.count({ where: { createdAt: { gte: week } } }),
          db.juniorMember.aggregate({ _count: true, _avg: { xp: true } }),
          db.juniorMember.count({ where: { lastActiveAt: { gte: week } } }),
        ]),
      ])
    : [[], [], null];

  return (
    <div className="admin-page">
      <h1>{t("Dashboard")}</h1>
      {!db && (
        <p className="admin-error">
          {t(
            "DATABASE_URL is not configured — nothing can be read or written.",
          )}
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
              <span className="muted">
                {t(
                  "{published} published · {drafts} drafts · {archived} archived",
                  {
                    published,
                    drafts,
                    archived,
                  },
                )}
              </span>
            </Link>
          );
        })}
      </div>
      {academy && (
        <>
          <h2>{t("Academy")}</h2>
          <div className="admin-cards">
            <Link href="/admin/students" className="admin-card">
              <span className="eyebrow">{t("Students")}</span>
              <strong>{academy[0]}</strong>
              <span className="muted">
                {t("{active} signed in this week · {submissions} submissions", {
                  active: academy[1],
                  submissions: academy[2],
                })}
              </span>
            </Link>
            <Link href="/admin/results" className="admin-card">
              <span className="eyebrow">{t("Results")}</span>
              <strong>{academy[2]}</strong>
              <span className="muted">
                {t("submissions in the last 7 days")}
              </span>
            </Link>
            <Link href="/admin/junior" className="admin-card">
              <span className="eyebrow">Academy Junior</span>
              <strong>{academy[3]._count}</strong>
              <span className="muted">
                {t("{active} active this week · {xp} XP on average", {
                  active: academy[4],
                  xp: Math.round(academy[3]._avg.xp ?? 0),
                })}
              </span>
            </Link>
          </div>
        </>
      )}
      <h2>{t("Recently updated")}</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>{t("Title")}</th>
            <th>{t("Kind")}</th>
            <th>Status</th>
            <th>{t("Updated")}</th>
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
                {t("Nothing yet.")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
