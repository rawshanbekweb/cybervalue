import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { CreateJuniorsForm } from "@/components/admin/junior-forms";
import { groupStats, juniorRow } from "@/lib/junior/admin";
import { MISSIONS } from "@/lib/junior/content";
import { TOTAL_EXERCISES } from "@/lib/junior/cipher-content";

const SORTS = ["xp", "name", "active"] as const;

export default async function AdminJuniorPage({
  searchParams,
}: PageProps<"/admin/junior">) {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  await requireAdmin("/admin/junior");
  const query = await searchParams;
  const group = typeof query.group === "string" ? query.group : "";
  const sort = SORTS.find((s) => s === query.sort) ?? "xp";
  const db = getDb();
  const members = db
    ? await db.juniorMember.findMany({
        orderBy: [{ group: "asc" }, { name: "asc" }],
        take: 2000,
        select: {
          id: true,
          name: true,
          group: true,
          codename: true,
          active: true,
          expiresAt: true,
          progress: true,
          lastLoginAt: true,
          lastActiveAt: true,
          createdAt: true,
        },
      })
    : [];
  const now = new Date().getTime();
  const all = members.map((member) => juniorRow(member, now));
  const groups = groupStats(all, now);
  const rows = all.filter((row) => !group || row.group === group);
  rows.sort((a, b) =>
    sort === "name"
      ? a.name.localeCompare(b.name)
      : sort === "active"
        ? (b.lastActiveAt?.getTime() ?? 0) - (a.lastActiveAt?.getTime() ?? 0)
        : b.xp - a.xp || a.name.localeCompare(b.name),
  );
  const week = now - 7 * 86_400_000;
  const activeWeek = rows.filter(
    (row) => row.lastActiveAt && row.lastActiveAt.getTime() >= week,
  ).length;
  const averageXp = rows.length
    ? Math.round(rows.reduce((sum, row) => sum + row.xp, 0) / rows.length)
    : 0;
  const caseSolved = rows.filter((row) => row.story).length;
  const exportHref = `/admin/junior/export${group ? `?group=${encodeURIComponent(group)}` : ""}`;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Academy Junior</h1>
          <p className="muted">
            {t(
              "{count} members · sign-in page: /playground/junior (access code)",
              { count: members.length },
            )}
          </p>
        </div>
        <a href={exportHref} className="button button-primary" download>
          {t("Download CSV")}
        </a>
      </div>
      {!db && (
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      )}

      <div className="admin-cards">
        <div className="admin-card">
          <span className="eyebrow">{t("Members")}</span>
          <strong>{rows.length}</strong>
          <span className="muted">{group || t("All groups")}</span>
        </div>
        <div className="admin-card">
          <span className="eyebrow">{t("Active this week")}</span>
          <strong>{activeWeek}</strong>
          <span className="muted">
            {t("saved progress in the last 7 days")}
          </span>
        </div>
        <div className="admin-card">
          <span className="eyebrow">{t("Average XP")}</span>
          <strong>{averageXp}</strong>
          <span className="muted">
            {t("{count} solved the Cyber HQ case", { count: caseSolved })}
          </span>
        </div>
        <div className="admin-card">
          <span className="eyebrow">{t("Groups")}</span>
          <strong>{groups.length}</strong>
          <span className="muted">
            {groups[0]
              ? t("Leading: {group} · {xp} XP on average", {
                  group: groups[0].group || t("No group"),
                  xp: groups[0].averageXp,
                })
              : "—"}
          </span>
        </div>
      </div>

      {groups.length > 1 && (
        <>
          <h2>{t("Groups")}</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">{t("Group")}</th>
                  <th scope="col">{t("Members")}</th>
                  <th scope="col">{t("Active this week")}</th>
                  <th scope="col">{t("Average XP")}</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.group}>
                    <td>
                      <Link
                        href={`/admin/junior?group=${encodeURIComponent(g.group)}`}
                      >
                        {g.group || t("No group")}
                      </Link>
                    </td>
                    <td>{g.members}</td>
                    <td>{g.active}</td>
                    <td>{g.averageXp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <CreateJuniorsForm />

      <h2>{t("Members and results")}</h2>
      <form method="get" className="admin-filters">
        <div className="admin-field">
          <label htmlFor="junior-group">{t("Group")}</label>
          <select
            id="junior-group"
            name="group"
            className="admin-input"
            defaultValue={group}
          >
            <option value="">{t("All groups")}</option>
            {groups
              .map((g) => g.group)
              .filter(Boolean)
              .sort()
              .map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="junior-sort">{t("Sort by")}</label>
          <select
            id="junior-sort"
            name="sort"
            className="admin-input"
            defaultValue={sort}
          >
            <option value="xp">XP</option>
            <option value="name">{t("Name")}</option>
            <option value="active">{t("Last activity")}</option>
          </select>
        </div>
        <button type="submit" className="button button-secondary">
          {t("Apply")}
        </button>
      </form>
      {rows.length === 0 ? (
        <p className="muted">{t("No members yet.")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t("Name")}</th>
                <th scope="col">{t("Group")}</th>
                <th scope="col">{t("Rank")}</th>
                <th scope="col">XP</th>
                <th scope="col">{t("Missions")}</th>
                <th scope="col">{t("Exercises")}</th>
                <th scope="col">{t("Case")}</th>
                <th scope="col">{t("Daily · streak")}</th>
                <th scope="col">{t("Last activity")}</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/admin/junior/${row.id}`}>{row.name}</Link>
                    {row.codename && (
                      <span className="admin-cell-detail">{row.codename}</span>
                    )}
                  </td>
                  <td>{row.group || "—"}</td>
                  <td>{row.rank.title[locale]}</td>
                  <td>
                    <strong>{row.xp}</strong>
                  </td>
                  <td>
                    {row.missions}/{MISSIONS.length}
                  </td>
                  <td>
                    <span
                      className="admin-meter"
                      role="img"
                      aria-label={`${row.exercises}/${TOTAL_EXERCISES}`}
                    >
                      <span
                        style={{
                          width: `${(row.exercises / TOTAL_EXERCISES) * 100}%`,
                        }}
                      />
                    </span>{" "}
                    {row.exercises}/{TOTAL_EXERCISES}
                  </td>
                  <td>{row.story ? t("Solved") : "—"}</td>
                  <td>
                    {row.daily} · {row.streak}
                  </td>
                  <td>
                    {row.lastActiveAt
                      ? formatDate(row.lastActiveAt)
                      : t("Never")}
                  </td>
                  <td>
                    {row.status === "blocked" ? (
                      <span className="admin-warn">{t("Blocked")}</span>
                    ) : row.status === "expired" ? (
                      <span className="admin-warn">{t("Expired")}</span>
                    ) : (
                      t("Active")
                    )}
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
