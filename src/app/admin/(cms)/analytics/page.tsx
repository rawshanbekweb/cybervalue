import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { loadAnalytics } from "@/lib/admin/analytics";
import { Meter, StatTile, WeeklyColumns } from "@/components/admin/charts";

export default async function AnalyticsPage() {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const { scope } = await requireStaff("/admin/analytics");
  const db = getDb();
  const data = db ? await loadAnalytics(db, scope) : null;
  if (!data)
    return (
      <div className="admin-page">
        <h1>{t("Analytics")}</h1>
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      </div>
    );
  const maxCompleted = Math.max(1, ...data.groups.map((g) => g.completed ?? 0));
  const maxAnswers = Math.max(1, ...data.groups.map((g) => g.answers));
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Analytics")}</h1>
          <p className="muted">
            {scope.owner
              ? t(
                  "How {people} learners are doing: the last 7 days, 12 weeks of activity and the groups side by side.",
                  { people: data.people },
                )
              : t(
                  "How the {people} learners in your groups are doing: the last 7 days, 12 weeks of activity and the groups side by side.",
                  { people: data.people },
                )}
          </p>
        </div>
      </div>

      <h2>{t("Last 7 days")}</h2>
      <div className="admin-cards">
        <StatTile
          label={t("Active learners")}
          value={data.current.active}
          previous={data.previous.active}
          t={t}
        />
        <StatTile
          label={t("Answers sent")}
          value={data.current.answers}
          previous={data.previous.answers}
          t={t}
        />
        <StatTile
          label={t("Materials completed")}
          value={data.current.completed}
          previous={data.previous.completed}
          t={t}
        />
        <StatTile
          label={t("Checkpoints passed")}
          value={data.current.passed}
          previous={data.previous.passed}
          t={t}
        />
      </div>

      <h2>{t("Last 12 weeks")}</h2>
      <div className="admin-charts">
        <WeeklyColumns
          title={t("Active students per week")}
          caption={t("Signed in, answered or completed something")}
          values={data.activeStudents}
          from={data.from}
          locale={locale}
          t={t}
        />
        <WeeklyColumns
          title={t("Work done per week")}
          caption={t("Answers, completed materials and checkpoint attempts")}
          values={data.work}
          from={data.from}
          locale={locale}
          t={t}
        />
        <WeeklyColumns
          title={t("Active Junior and Kids members per week")}
          caption={t("Recorded from now on; earlier weeks stay empty")}
          values={data.activeMembers}
          from={data.from}
          locale={locale}
          t={t}
        />
      </div>

      <h2>{t("Groups side by side")}</h2>
      {data.groups.length === 0 ? (
        <p className="muted">{t("No groups yet.")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t("Group")}</th>
                <th scope="col">{t("People")}</th>
                <th scope="col">{t("Active this week")}</th>
                <th scope="col">{t("Materials completed, average")}</th>
                <th scope="col">{t("Quiz score, 30 days")}</th>
                <th scope="col">{t("Answers, 30 days")}</th>
                <th scope="col">{t("XP, average")}</th>
              </tr>
            </thead>
            <tbody>
              {data.groups.map((g) => {
                const people = g.students + g.members;
                const share = people
                  ? Math.round((g.active / people) * 100)
                  : 0;
                return (
                  <tr key={g.name}>
                    <th scope="row">
                      <Link
                        href={`/admin/class?group=${encodeURIComponent(g.name)}`}
                      >
                        {g.name}
                      </Link>
                    </th>
                    <td>{people}</td>
                    <td>
                      <Meter
                        value={share}
                        max={100}
                        text={`${g.active} · ${share}%`}
                      />
                    </td>
                    <td>
                      {g.completed === null ? (
                        "—"
                      ) : (
                        <Meter
                          value={g.completed}
                          max={maxCompleted}
                          text={String(g.completed)}
                        />
                      )}
                    </td>
                    <td>
                      {g.score === null ? (
                        "—"
                      ) : (
                        <Meter value={g.score} max={100} text={`${g.score}%`} />
                      )}
                    </td>
                    <td>
                      <Meter
                        value={g.answers}
                        max={maxAnswers}
                        text={String(g.answers)}
                      />
                    </td>
                    <td>{g.xp ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted">
        {t(
          "Each learner’s own history is on their page: open a student, Junior or Kids member.",
        )}
      </p>
    </div>
  );
}
