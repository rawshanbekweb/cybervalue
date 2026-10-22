import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { collections, collectionFor } from "@/lib/site";
import { formatDate } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { adminOverview } from "@/lib/admin/overview";

export default async function AdminDashboardPage() {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  await requireOwner("/admin");
  const db = getDb();
  const [overview, counts, recent] = db
    ? await Promise.all([
        adminOverview(db),
        db.content.groupBy({ by: ["kind", "status"], _count: true }),
        db.content.findMany({
          orderBy: { updatedAt: "desc" },
          take: 8,
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
    : [null, [], []];

  const attention = overview
    ? [
        {
          count: overview.errors,
          href: "/admin/errors",
          text: t("unresolved site errors"),
        },
      ].filter((item) => item.count > 0)
    : [];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Dashboard")}</h1>
          <p className="muted">
            {t(
              "The site at a glance: content, people and anything that needs fixing. Classes and grading are in the teacher panel.",
            )}
          </p>
        </div>
      </div>
      {!db && (
        <p className="admin-error">
          {t(
            "DATABASE_URL is not configured — nothing can be read or written.",
          )}
        </p>
      )}

      <nav className="admin-quick" aria-label={t("Quick actions")}>
        <Link href="/admin/work/new" className="button button-primary">
          {t("New entry")}
        </Link>
        <Link href="/admin/team" className="button button-secondary">
          {t("Add a team member")}
        </Link>
        <Link
          href="/admin/telegram#broadcast"
          className="button button-secondary"
        >
          {t("Telegram message")}
        </Link>
        <Link href="/teacher" className="button button-secondary">
          {t("Teacher panel")}
        </Link>
      </nav>

      {overview && (
        <>
          <section className="admin-panel" aria-labelledby="attention">
            <h2 id="attention">{t("Needs attention")}</h2>
            {attention.length ? (
              <ul className="admin-attention">
                {attention.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <span className="admin-badge">{item.count}</span>
                      <span>{item.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">
                {t("All clear: nothing is waiting for you right now.")}
              </p>
            )}
          </section>

          <h2>{t("Academy")}</h2>
          <div className="admin-cards">
            <Link href="/teacher/class" className="admin-card">
              <span className="eyebrow">{t("Students")}</span>
              <strong>{overview.students}</strong>
              <span className="muted">
                {t("{today} today · {week} this week", {
                  today: overview.activeToday,
                  week: overview.activeWeek,
                })}
              </span>
            </Link>
            <Link href="/teacher/results" className="admin-card">
              <span className="eyebrow">{t("Results")}</span>
              <strong>{overview.submissions}</strong>
              <span className="muted">
                {t("submissions in the last 7 days")}
              </span>
            </Link>
            <Link href="/teacher/kids" className="admin-card">
              <span className="eyebrow">Academy Kids</span>
              <strong>{overview.kids}</strong>
              <span className="muted">
                {t("{active} active this week", {
                  active: overview.kidsActive,
                })}
              </span>
            </Link>
            <Link href="/teacher/junior" className="admin-card">
              <span className="eyebrow">Academy Junior</span>
              <strong>{overview.juniors}</strong>
              <span className="muted">
                {t("{active} active this week · {xp} XP on average", {
                  active: overview.juniorsActive,
                  xp: overview.juniorXp,
                })}
              </span>
            </Link>
            <Link href="/admin/telegram" className="admin-card">
              <span className="eyebrow">Telegram</span>
              <strong>{overview.telegram}</strong>
              <span className="muted">{t("linked chats")}</span>
            </Link>
          </div>
        </>
      )}

      <>
        <h2>{t("Site content")}</h2>
        <div className="admin-cards">
          {Object.entries(collections).map(([key, value]) => {
            const of = (status?: string) =>
              counts
                .filter(
                  (c) =>
                    c.kind === value.kind && (!status || c.status === status),
                )
                .reduce((sum, c) => sum + c._count, 0);
            return (
              <Link key={key} href={`/admin/${key}`} className="admin-card">
                <span className="eyebrow">{t(value.title)}</span>
                <strong>{of()}</strong>
                <span className="muted">
                  {t(
                    "{published} published · {drafts} drafts · {archived} archived",
                    {
                      published: of("PUBLISHED"),
                      drafts: of("DRAFT"),
                      archived: of("ARCHIVED"),
                    },
                  )}
                </span>
              </Link>
            );
          })}
        </div>
        <h3>{t("Recently updated")}</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("Title")}</th>
                <th>{t("Kind")}</th>
                <th>{t("Status")}</th>
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
                  <td>{formatDate(entry.updatedAt, locale)}</td>
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
      </>
    </div>
  );
}
