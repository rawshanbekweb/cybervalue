import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import {
  filtersQuery,
  INACTIVE_DAYS,
  listGroupNames,
  listUsers,
  PAGE_SIZE,
  readFilters,
  SORTS,
} from "@/lib/admin/users-list";
import { UsersTable, type UserRow } from "@/components/admin/users-table";
import { LEVEL_LABEL, isLevel } from "@/lib/student/levels";

export default async function AdminUsersPage({
  searchParams,
}: PageProps<"/admin/users">) {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  await requireOwner("/admin/users");
  const db = getDb();
  const query = await searchParams;
  const filters = readFilters(query);
  const { q, kind, status, group, sort, dir } = filters;
  const [all, groups] = db
    ? await Promise.all([listUsers(db, filters), listGroupNames(db)])
    : [[], []];
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  const counts = { student: 0, junior: 0, kids: 0 };
  for (const u of all) counts[u.kind]++;
  const rows: UserRow[] = all
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    .map((u) => ({
      key: u.key,
      kind: u.kind,
      href: `/admin/${u.kind === "student" ? "students" : u.kind}/${u.id}`,
      name: u.name,
      group: u.group,
      status: u.status,
      detail:
        u.kind === "student"
          ? [
              isLevel(u.level) ? t(LEVEL_LABEL[u.level]) : "",
              t("{done} completed · {submissions} submissions", {
                done: u.done ?? 0,
                submissions: u.submissions ?? 0,
              }),
            ]
              .filter(Boolean)
              .join(" · ")
          : `${u.xp ?? 0} XP`,
      lastActive: u.last ? formatDate(u.last, locale) : null,
    }));
  // Clicking the sorted column flips its direction; another column starts
  // ascending, except "last activity", where the latest first is more useful.
  const sortHref = Object.fromEntries(
    SORTS.map((key) => [
      key,
      `/admin/users${filtersQuery(filters, {
        sort: key,
        dir:
          key === sort
            ? dir === "asc"
              ? "desc"
              : "asc"
            : key === "last"
              ? "desc"
              : "asc",
        page: 1,
      })}`,
    ]),
  ) as Record<(typeof SORTS)[number], string>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("All users")}</h1>
          <p className="muted">
            {t(
              "{students} students, {juniors} Academy Junior and {kids} Academy Kids members. Select rows to move them to a group, allow or block access, sign them out or delete them.",
              {
                students: counts.student,
                juniors: counts.junior,
                kids: counts.kids,
              },
            )}
          </p>
        </div>
        <a
          href={`/admin/users/export${filtersQuery(filters, { page: 1 })}`}
          className="button button-secondary"
          download
        >
          {t("Download CSV")}
        </a>
      </div>
      <form method="get" className="admin-filters">
        {sort !== "name" && <input type="hidden" name="sort" value={sort} />}
        {dir !== "asc" && <input type="hidden" name="dir" value={dir} />}
        <div className="admin-field admin-search-field">
          <label htmlFor="users-q">{t("Search by name")}</label>
          <input
            id="users-q"
            name="q"
            className="admin-input"
            defaultValue={q}
            maxLength={80}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="users-kind">{t("Type")}</label>
          <select
            id="users-kind"
            name="kind"
            className="admin-input"
            defaultValue={kind}
          >
            <option value="all">{t("Everyone")}</option>
            <option value="student">{t("Students")}</option>
            <option value="junior">Academy Junior</option>
            <option value="kids">Academy Kids</option>
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="users-group">{t("Group")}</label>
          <select
            id="users-group"
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
        <div className="admin-field">
          <label htmlFor="users-status">{t("Status")}</label>
          <select
            id="users-status"
            name="status"
            className="admin-input"
            defaultValue={status}
          >
            <option value="all">{t("Any status")}</option>
            <option value="active">{t("Access allowed")}</option>
            <option value="blocked">{t("Blocked")}</option>
            <option value="never">{t("Never signed in")}</option>
            <option value="inactive">
              {t("Inactive for {days} days", { days: INACTIVE_DAYS })}
            </option>
          </select>
        </div>
        <button type="submit" className="button button-secondary">
          {t("Apply")}
        </button>
      </form>
      <UsersTable
        key={JSON.stringify(query)}
        rows={rows}
        sort={sort}
        dir={dir}
        sortHref={sortHref}
        empty={t("No users match these filters.")}
      />
      {pages > 1 && (
        <nav className="admin-pagination" aria-label={t("Pages")}>
          {page > 1 ? (
            <Link
              href={`/admin/users${filtersQuery(filters, { page: page - 1 })}`}
            >
              ← {t("Previous")}
            </Link>
          ) : (
            <span />
          )}
          <span className="muted">
            {t("Page {page} of {pages}", { page, pages })} ·{" "}
            {t("{count} users", { count: all.length })}
          </span>
          {page < pages ? (
            <Link
              href={`/admin/users${filtersQuery(filters, { page: page + 1 })}`}
            >
              {t("Next")} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
