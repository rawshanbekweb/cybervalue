import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { groupWhere, requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { CreateKidsForm } from "@/components/admin/kids-forms";
import { ALL_MISSIONS, GAME_IDS, GAMES } from "@/lib/kids/games";
import { kidsToday } from "@/lib/kids/extras";
import { kidsLevel, restoreKidsProgress } from "@/lib/kids/progress";
import { kidSummary } from "@/lib/kids/summary";
import { KidStageCell } from "@/components/admin/kid-stage";

const weekAgo = () => Date.now() - 7 * 86_400_000;

export default async function AdminKidsPage({
  searchParams,
}: PageProps<"/teacher/kids">) {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const { scope } = await requireStaff("/teacher/kids");
  const { group: groupParam } = await searchParams;
  const group = typeof groupParam === "string" ? groupParam : "";
  const db = getDb();
  const [members, groups] = db
    ? await Promise.all([
        db.kidsMember.findMany({
          where: { ...groupWhere(scope), ...(group ? { group } : {}) },
          orderBy: [{ xp: "desc" }, { name: "asc" }],
          take: 1000,
          select: {
            id: true,
            name: true,
            group: true,
            active: true,
            xp: true,
            progress: true,
            lastActiveAt: true,
          },
        }),
        db.kidsMember.findMany({
          where: { group: { not: "" }, ...groupWhere(scope) },
          distinct: ["group"],
          orderBy: { group: "asc" },
          select: { group: true },
        }),
      ])
    : [[], []];
  const week = weekAgo();
  const today = kidsToday();
  const active = members.filter(
    (m) => m.lastActiveAt && m.lastActiveAt.getTime() >= week,
  ).length;
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Academy Kids</h1>
          <p className="muted">
            {t(
              "Children aged 7–10 hack games with code, solve mazes and ciphers, and climb three stages in every game. Create codes here; children enter them at /kids.",
            )}
          </p>
        </div>
      </div>
      {!db && (
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      )}
      <div className="admin-cards">
        <div className="admin-card">
          <span className="eyebrow">{t("Children")}</span>
          <strong>{members.length}</strong>
          <span className="muted">
            {t("{active} active this week", { active })}
          </span>
        </div>
        <div className="admin-card">
          <span className="eyebrow">{t("Missions")}</span>
          <strong>{ALL_MISSIONS.length}</strong>
          <span className="muted">
            {t("in {count} games", { count: GAME_IDS.length })}
          </span>
        </div>
      </div>
      <CreateKidsForm />
      <form method="get" className="admin-filters">
        <div className="admin-field">
          <label htmlFor="kids-group">{t("Group")}</label>
          <select
            id="kids-group"
            name="group"
            className="admin-input"
            defaultValue={group}
          >
            <option value="">{t("All groups")}</option>
            {groups.map((g) => (
              <option key={g.group} value={g.group}>
                {g.group}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="button button-secondary">
          {t("Apply")}
        </button>
      </form>
      {members.length === 0 ? (
        <p className="muted">{t("No children yet.")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t("Name")}</th>
                <th scope="col">{t("Group")}</th>
                <th scope="col">{t("Level")}</th>
                <th scope="col">XP</th>
                <th scope="col">{t("Missions")}</th>
                {Object.values(GAMES).map((g) => (
                  <th scope="col" key={g.id}>
                    {g.title[locale]}
                  </th>
                ))}
                <th scope="col">{t("Streak")}</th>
                <th scope="col">{t("Last activity")}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const progress = restoreKidsProgress(m.progress);
                const done = progress.done.length;
                const summary = kidSummary(progress, today);
                return (
                  <tr key={m.id}>
                    <td>
                      <Link href={`/teacher/kids/${m.id}`}>{m.name}</Link>
                      {!m.active && (
                        <span className="admin-cell-detail">
                          {t("Blocked")}
                        </span>
                      )}
                    </td>
                    <td>{m.group || "—"}</td>
                    <td>{kidsLevel(m.xp).level.title[locale]}</td>
                    <td>{m.xp}</td>
                    <td>
                      {done}/{ALL_MISSIONS.length}
                    </td>
                    {summary.games.map((g) => (
                      <td key={g.id}>
                        <KidStageCell game={g} t={t} />
                      </td>
                    ))}
                    <td>
                      {summary.streak > 0
                        ? t("{days} days", { days: summary.streak })
                        : "—"}
                    </td>
                    <td>
                      {m.lastActiveAt
                        ? formatDate(m.lastActiveAt, locale)
                        : t("Never")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
