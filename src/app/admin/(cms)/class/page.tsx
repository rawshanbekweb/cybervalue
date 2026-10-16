import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { CHECKPOINT_META } from "@/lib/checkpoints/meta";
import { REASON_TEXT } from "@/lib/student/class";
import { classGroups, loadClass } from "@/lib/student/class-data";
import { dayIndex } from "@/lib/student/xp";
import { formatDue, targetName } from "@/lib/student/assignments";

const DAY = 86_400_000;

export default async function AdminClassPage({
  searchParams,
}: PageProps<"/admin/class">) {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  await requireAdmin("/admin/class");
  const db = getDb();
  if (!db)
    return (
      <div className="admin-page">
        <h1>{t("Class")}</h1>
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      </div>
    );
  const query = await searchParams;
  const groups = await classGroups(db);
  const requested = typeof query.group === "string" ? query.group : "";
  const group = groups.includes(requested) ? requested : "";
  const now = new Date().getTime();
  const [{ rows, classCompletion, assignments }, juniors] = await Promise.all([
    loadClass(db, group, now),
    db.juniorMember.findMany({
      where: { active: true, ...(group ? { group } : {}) },
      select: { xp: true, lastActiveAt: true },
    }),
  ]);
  const week = now - 7 * DAY;
  const active = rows.filter(
    (r) => r.standing.lastActive && r.standing.lastActive.getTime() >= week,
  ).length;
  const avg = (values: number[]) =>
    values.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : null;
  const averageXp = avg(rows.map((r) => r.standing.xp));
  const testAverage = avg(
    rows.flatMap((r) =>
      r.standing.average === null ? [] : [r.standing.average],
    ),
  );
  const checkpointRuns = rows.flatMap((r) =>
    CHECKPOINT_META.filter(
      (c) => r.standing.checkpoints[c.id] !== undefined,
    ).map((c) => r.standing.checkpoints[c.id] >= c.pass),
  );
  const flagged = rows.filter((r) => r.reasons.length > 0);
  // Actions per day over the last two weeks, all students together.
  const days = Array.from({ length: 14 }, (_, i) =>
    rows.reduce((sum, r) => sum + r.standing.days[i], 0),
  );
  const peak = Math.max(1, ...days);
  const today = dayIndex(now);
  const dayLabel = (i: number) =>
    formatDate(new Date((today - 13 + i) * DAY), locale).replace(
      /,? \d{4}$/,
      "",
    );
  const juniorActive = juniors.filter(
    (j) => j.lastActiveAt && j.lastActiveAt.getTime() >= week,
  ).length;
  const exportHref = `/admin/class/export${group ? `?group=${encodeURIComponent(group)}` : ""}`;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Class")}</h1>
          <p className="muted">
            {t(
              "Progress, activity and who needs help, for students and Academy Junior members.",
            )}
          </p>
        </div>
        <a href={exportHref} className="button button-primary" download>
          {t("Weekly report (CSV)")}
        </a>
      </div>

      <form method="get" className="admin-filters">
        <div className="admin-field">
          <label htmlFor="class-group">{t("Group")}</label>
          <select
            id="class-group"
            name="group"
            className="admin-input"
            defaultValue={group}
          >
            <option value="">{t("All groups")}</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="button button-secondary">
          {t("Apply")}
        </button>
      </form>

      <div className="admin-cards">
        <div className="admin-card">
          <span className="eyebrow">{t("Students")}</span>
          <strong>{rows.length}</strong>
          <span className="muted">
            {t("{active} active this week", { active })}
          </span>
        </div>
        <div className="admin-card">
          <span className="eyebrow">{t("Completion")}</span>
          <strong>{Math.round(classCompletion * 100)}%</strong>
          <span className="muted">
            {t("average XP {xp}", { xp: averageXp ?? 0 })}
          </span>
        </div>
        <div className="admin-card">
          <span className="eyebrow">{t("Test average")}</span>
          <strong>{testAverage === null ? "—" : `${testAverage}%`}</strong>
          <span className="muted">
            {checkpointRuns.length
              ? t("{passed} of {total} lab checkpoints passed", {
                  passed: checkpointRuns.filter(Boolean).length,
                  total: checkpointRuns.length,
                })
              : t("No lab checkpoints yet")}
          </span>
        </div>
        <div className="admin-card">
          <span className="eyebrow">{t("Needs attention")}</span>
          <strong>{flagged.length}</strong>
          <span className="muted">{t("see the list below")}</span>
        </div>
        <Link
          href={`/admin/junior${group ? `?group=${encodeURIComponent(group)}` : ""}`}
          className="admin-card"
        >
          <span className="eyebrow">Academy Junior</span>
          <strong>{juniors.length}</strong>
          <span className="muted">
            {t("{active} active this week · {xp} XP on average", {
              active: juniorActive,
              xp: avg(juniors.map((j) => j.xp)) ?? 0,
            })}
          </span>
        </Link>
      </div>

      <h2>{t("Activity, last 14 days")}</h2>
      <figure className="admin-activity">
        <div className="admin-activity-bars" aria-hidden="true">
          {days.map((count, i) => (
            <span
              key={i}
              className="admin-activity-bar"
              data-tip={`${dayLabel(i)}: ${count}`}
              style={{ height: `${Math.max(2, (count / peak) * 100)}%` }}
            />
          ))}
        </div>
        <div className="admin-activity-axis" aria-hidden="true">
          <span>{dayLabel(0)}</span>
          <span>{dayLabel(13)}</span>
        </div>
        <figcaption className="muted">
          {t(
            "Completed materials, submissions and lab checkpoint attempts per day.",
          )}
        </figcaption>
        <table className="visually-hidden">
          <caption>{t("Activity, last 14 days")}</caption>
          <tbody>
            {days.map((count, i) => (
              <tr key={i}>
                <th scope="row">{dayLabel(i)}</th>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>

      <h2>{t("Needs attention")}</h2>
      {flagged.length === 0 ? (
        <p className="muted">{t("Everyone is on track.")}</p>
      ) : (
        <ul className="admin-attention">
          {flagged.map((row) => (
            <li key={row.id}>
              <Link href={`/admin/students/${row.id}`}>{row.name}</Link>
              <span className="muted">
                {row.group && `${row.group} · `}
                {row.reasons.map((r) => t(REASON_TEXT[r])).join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="admin-section-head">
        <h2>{t("Assignments")}</h2>
        <Link
          href={`/admin/assignments${group ? `?group=${encodeURIComponent(group)}` : ""}`}
        >
          {t("Set an assignment")}
        </Link>
      </div>
      {assignments.length === 0 ? (
        <p className="muted">{t("No assignments in the last 30 days.")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t("Assignment")}</th>
                <th scope="col">{t("Deadline")}</th>
                <th scope="col">{t("Done")}</th>
                <th scope="col">{t("Missed")}</th>
              </tr>
            </thead>
            <tbody>
              {[...assignments].reverse().map((a) => {
                const done = a.students.filter(
                  (s) => s.status === "done" || s.status === "late",
                ).length;
                const missed = a.students.filter((s) => s.status === "missed");
                return (
                  <tr key={a.id}>
                    <td>
                      {a.title}
                      <span className="admin-cell-detail">
                        {[
                          !group && (a.group || t("Every student")),
                          targetName(a, locale, t),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </td>
                    <td>{formatDue(a.dueAt, locale)}</td>
                    <td>
                      {done}/{a.students.length}
                    </td>
                    <td>
                      {missed.length === 0
                        ? "—"
                        : missed.map((s, i) => (
                            <span key={s.id}>
                              {i > 0 && ", "}
                              <Link href={`/admin/students/${s.id}`}>
                                {s.name}
                              </Link>
                            </span>
                          ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2>{t("Students")}</h2>
      {rows.length === 0 ? (
        <p className="muted">{t("No students yet.")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t("Name")}</th>
                <th scope="col">{t("Rank")}</th>
                <th scope="col">XP</th>
                <th scope="col">{t("Completed")}</th>
                <th scope="col">{t("Test average")}</th>
                <th scope="col">{t("Lab checkpoints")}</th>
                <th scope="col">{t("This week")}</th>
                <th scope="col">{t("Last activity")}</th>
              </tr>
            </thead>
            <tbody>
              {[...rows]
                .sort((a, b) => b.standing.xp - a.standing.xp)
                .map(({ id, name, group: g, standing: s, reasons }) => (
                  <tr key={id}>
                    <td>
                      <Link href={`/admin/students/${id}`}>{name}</Link>
                      {(!group || reasons.length > 0) && (
                        <span className="admin-cell-detail">
                          {[
                            !group && g,
                            reasons.length > 0 && t(REASON_TEXT[reasons[0]]),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </td>
                    <td>{s.rank.title[locale]}</td>
                    <td>
                      <strong>{s.xp}</strong>
                    </td>
                    <td>
                      <span
                        className="admin-meter"
                        role="img"
                        aria-label={`${s.done}/${s.available}`}
                      >
                        <span
                          style={{
                            width: `${s.available ? (s.done / s.available) * 100 : 0}%`,
                          }}
                        />
                      </span>{" "}
                      {s.done}/{s.available}
                    </td>
                    <td>{s.average === null ? "—" : `${s.average}%`}</td>
                    <td>
                      {CHECKPOINT_META.map((c) => {
                        const best = s.checkpoints[c.id];
                        return (
                          <span
                            key={c.id}
                            className={`admin-chip ${best === undefined ? "" : best >= c.pass ? "ok" : "warn"}`}
                            title={c.title[locale]}
                          >
                            {best === undefined ? "—" : `${best}%`}
                          </span>
                        );
                      })}
                    </td>
                    <td>
                      {s.week}
                      {s.streakWeeks > 1 && (
                        <span className="admin-cell-detail">
                          {t("{weeks}-week streak", { weeks: s.streakWeeks })}
                        </span>
                      )}
                    </td>
                    <td>
                      {s.lastActive ? formatDate(s.lastActive) : t("Never")}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
