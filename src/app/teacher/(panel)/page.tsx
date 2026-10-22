import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { adminOverview } from "@/lib/admin/overview";
import { formatDue } from "@/lib/student/assignments";

export default async function TeacherDashboardPage() {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const { scope } = await requireStaff("/teacher");
  const db = getDb();
  const overview = db ? await adminOverview(db, scope) : null;

  const attention = overview
    ? [
        {
          count: overview.reviews,
          href: "/teacher/materials",
          text: t("practice answers wait for your review"),
        },
        {
          count: overview.missed,
          href: "/teacher/assignments",
          text: t("deadlines passed this week — check who missed them"),
        },
        {
          count: overview.live,
          href: "/teacher/live",
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
        <Link href="/teacher/assignments" className="button button-primary">
          {t("New assignment")}
        </Link>
        <Link href="/teacher/materials/new" className="button button-secondary">
          {t("New test or lesson")}
        </Link>
        <Link href="/teacher/live" className="button button-secondary">
          {t("Start a live quiz")}
        </Link>
        <Link href="/teacher/students" className="button button-secondary">
          {t("Add students")}
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

          <div className="admin-split">
            <section className="admin-panel" aria-labelledby="to-review">
              <h2 id="to-review">{t("Waiting for review")}</h2>
              {overview.reviewList.length ? (
                <ul className="admin-list">
                  {overview.reviewList.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/teacher/grading?material=${item.material.id}`}
                      >
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
                      <Link href="/teacher/assignments">{item.title}</Link>
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
                  <Link href="/teacher/assignments">
                    {t("Give the class an assignment")}
                  </Link>
                </p>
              )}
            </section>
          </div>

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
          </div>
        </>
      )}
    </div>
  );
}
