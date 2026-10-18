import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { collections, collectionFor } from "@/lib/site";
import { formatDate } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { adminOverview } from "@/lib/admin/overview";
import { formatDue } from "@/lib/student/assignments";

export default async function AdminDashboardPage() {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const { scope } = await requireStaff("/admin");
  const db = getDb();
  const [overview, counts, recent] = db
    ? await Promise.all([
        adminOverview(db, scope),
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
          count: overview.reviews,
          href: "/admin/materials",
          text: t("practice answers wait for your review"),
        },
        {
          count: overview.missed,
          href: "/admin/assignments",
          text: t("deadlines passed this week — check who missed them"),
        },
        {
          count: overview.errors,
          href: "/admin/errors",
          text: t("unresolved site errors"),
        },
        {
          count: overview.live,
          href: "/admin/live",
          text: t("live quiz games are still open"),
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
              "Today's work first: what needs you, then how the class is doing.",
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
        <Link href="/admin/assignments" className="button button-primary">
          {t("New assignment")}
        </Link>
        <Link href="/admin/materials/new" className="button button-secondary">
          {t("New test or lesson")}
        </Link>
        <Link href="/admin/live" className="button button-secondary">
          {t("Start a live quiz")}
        </Link>
        <Link href="/admin/students" className="button button-secondary">
          {t("Add students")}
        </Link>
        {scope.owner && (
          <Link
            href="/admin/telegram#broadcast"
            className="button button-secondary"
          >
            {t("Telegram message")}
          </Link>
        )}
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

          <div className="admin-split">
            <section className="admin-panel" aria-labelledby="to-review">
              <h2 id="to-review">{t("Waiting for review")}</h2>
              {overview.reviewList.length ? (
                <ul className="admin-list">
                  {overview.reviewList.map((item) => (
                    <li key={item.id}>
                      <Link href={`/admin/materials/${item.material.id}`}>
                        {item.material.title}
                      </Link>
                      <span className="muted">
                        {item.student.name}
                        {item.student.group &&
                          ` · ${item.student.group}`} ·{" "}
                        {formatDate(item.createdAt, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">{t("No answers to review.")}</p>
              )}
            </section>
            <section className="admin-panel" aria-labelledby="due-soon">
              <h2 id="due-soon">{t("Due in the next 7 days")}</h2>
              {overview.upcoming.length ? (
                <ul className="admin-list">
                  {overview.upcoming.map((item) => (
                    <li key={item.id}>
                      <Link href="/admin/assignments">{item.title}</Link>
                      <span className="muted">
                        {item.group || t("All groups")} ·{" "}
                        {formatDue(item.dueAt, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">
                  {t("No deadlines this week.")}{" "}
                  <Link href="/admin/assignments">
                    {t("Give the class an assignment")}
                  </Link>
                </p>
              )}
            </section>
          </div>

          <h2>{t("Academy")}</h2>
          <div className="admin-cards">
            <Link href="/admin/class" className="admin-card">
              <span className="eyebrow">{t("Students")}</span>
              <strong>{overview.students}</strong>
              <span className="muted">
                {t("{today} today · {week} this week", {
                  today: overview.activeToday,
                  week: overview.activeWeek,
                })}
              </span>
            </Link>
            <Link href="/admin/results" className="admin-card">
              <span className="eyebrow">{t("Results")}</span>
              <strong>{overview.submissions}</strong>
              <span className="muted">
                {t("submissions in the last 7 days")}
              </span>
            </Link>
            <Link href="/admin/kids" className="admin-card">
              <span className="eyebrow">Academy Kids</span>
              <strong>{overview.kids}</strong>
              <span className="muted">
                {t("{active} active this week", {
                  active: overview.kidsActive,
                })}
              </span>
            </Link>
            <Link href="/admin/junior" className="admin-card">
              <span className="eyebrow">Academy Junior</span>
              <strong>{overview.juniors}</strong>
              <span className="muted">
                {t("{active} active this week · {xp} XP on average", {
                  active: overview.juniorsActive,
                  xp: overview.juniorXp,
                })}
              </span>
            </Link>
            {scope.owner && (
              <Link href="/admin/telegram" className="admin-card">
                <span className="eyebrow">Telegram</span>
                <strong>{overview.telegram}</strong>
                <span className="muted">{t("linked chats")}</span>
              </Link>
            )}
          </div>
        </>
      )}

      {scope.owner && (
        <details className="admin-details">
          <summary>{t("Site content")}</summary>
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
        </details>
      )}
    </div>
  );
}
