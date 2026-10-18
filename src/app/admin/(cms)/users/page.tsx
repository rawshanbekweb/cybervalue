import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { UsersTable, type UserRow } from "@/components/admin/users-table";
import { LEVEL_LABEL, isLevel } from "@/lib/student/levels";

const KINDS = ["all", "student", "junior", "kids"] as const;
const STATUSES = ["all", "active", "blocked", "never", "inactive"] as const;
const DAY = 86_400_000;
// "Inactive" means nothing at all for this long: candidates for clean-up.
const INACTIVE_DAYS = 60;
const since = () => new Date(Date.now() - INACTIVE_DAYS * DAY);

export default async function AdminUsersPage({
  searchParams,
}: PageProps<"/admin/users">) {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  await requireOwner("/admin/users");
  const db = getDb();
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 80) : "";
  const kind = KINDS.find((k) => k === query.kind) ?? "all";
  const status = STATUSES.find((s) => s === query.status) ?? "all";
  const group = typeof query.group === "string" ? query.group : "";
  const cutoff = since();
  const base = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(group ? { group } : {}),
    ...(status === "active" || status === "blocked"
      ? { active: status === "active" }
      : {}),
  };
  // Students only record sign-ins; members also record activity.
  const where = {
    ...base,
    ...(status === "never" ? { lastLoginAt: null } : {}),
    ...(status === "inactive"
      ? {
          createdAt: { lt: cutoff },
          OR: [{ lastLoginAt: null }, { lastLoginAt: { lt: cutoff } }],
        }
      : {}),
  };
  const memberWhere = {
    ...base,
    ...(status === "never" ? { lastLoginAt: null } : {}),
    ...(status === "inactive"
      ? {
          createdAt: { lt: cutoff },
          AND: [
            { OR: [{ lastLoginAt: null }, { lastLoginAt: { lt: cutoff } }] },
            {
              OR: [{ lastActiveAt: null }, { lastActiveAt: { lt: cutoff } }],
            },
          ],
        }
      : {}),
  };
  const [students, juniors, kidsRows, groupRows] = db
    ? await Promise.all([
        kind === "junior" || kind === "kids"
          ? []
          : db.student.findMany({
              where,
              orderBy: { name: "asc" },
              take: 1000,
              select: {
                id: true,
                name: true,
                group: true,
                level: true,
                active: true,
                expiresAt: true,
                lastLoginAt: true,
                _count: { select: { progress: true, submissions: true } },
              },
            }),
        kind === "student" || kind === "kids"
          ? []
          : db.juniorMember.findMany({
              where: memberWhere,
              orderBy: { name: "asc" },
              take: 1000,
              select: {
                id: true,
                name: true,
                group: true,
                active: true,
                expiresAt: true,
                xp: true,
                lastActiveAt: true,
                lastLoginAt: true,
              },
            }),
        kind === "student" || kind === "junior"
          ? []
          : db.kidsMember.findMany({
              where: memberWhere,
              orderBy: { name: "asc" },
              take: 1000,
              select: {
                id: true,
                name: true,
                group: true,
                active: true,
                xp: true,
                lastActiveAt: true,
                lastLoginAt: true,
              },
            }),
        Promise.all([
          db.student.findMany({ distinct: ["group"], select: { group: true } }),
          db.juniorMember.findMany({
            distinct: ["group"],
            select: { group: true },
          }),
          db.kidsMember.findMany({
            distinct: ["group"],
            select: { group: true },
          }),
        ]),
      ])
    : [[], [], [], [[], [], []]];
  const groups = [
    ...new Set(
      groupRows
        .flat()
        .map((r) => r.group)
        .filter(Boolean),
    ),
  ].sort();
  const now = new Date();
  const statusOf = (u: {
    active: boolean;
    expiresAt: Date | null;
  }): UserRow["status"] =>
    !u.active
      ? "blocked"
      : u.expiresAt && u.expiresAt <= now
        ? "expired"
        : "active";
  const rows: UserRow[] = [
    ...students.map((s) => ({
      key: `s:${s.id}`,
      kind: "student" as const,
      href: `/admin/students/${s.id}`,
      name: s.name,
      group: s.group,
      status: statusOf(s),
      detail: [
        isLevel(s.level) ? t(LEVEL_LABEL[s.level]) : "",
        t("{done} completed · {submissions} submissions", {
          done: s._count.progress,
          submissions: s._count.submissions,
        }),
      ]
        .filter(Boolean)
        .join(" · "),
      lastActive: s.lastLoginAt ? formatDate(s.lastLoginAt, locale) : null,
    })),
    ...juniors.map((j) => {
      const last = j.lastActiveAt ?? j.lastLoginAt;
      return {
        key: `j:${j.id}`,
        kind: "junior" as const,
        href: `/admin/junior/${j.id}`,
        name: j.name,
        group: j.group,
        status: statusOf(j),
        detail: `${j.xp} XP`,
        lastActive: last ? formatDate(last, locale) : null,
      };
    }),
    ...kidsRows.map((k) => {
      const last = k.lastActiveAt ?? k.lastLoginAt;
      return {
        key: `k:${k.id}`,
        kind: "kids" as const,
        href: `/admin/kids/${k.id}`,
        name: k.name,
        group: k.group,
        status: k.active ? ("active" as const) : ("blocked" as const),
        detail: `${k.xp} XP`,
        lastActive: last ? formatDate(last, locale) : null,
      };
    }),
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("All users")}</h1>
          <p className="muted">
            {t(
              "{students} students, {juniors} Academy Junior and {kids} Academy Kids members. Select rows to move them to a group, allow or block access, sign them out or delete them.",
              {
                students: students.length,
                juniors: juniors.length,
                kids: kidsRows.length,
              },
            )}
          </p>
        </div>
      </div>
      <form method="get" className="admin-filters">
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
        empty={t("No users match these filters.")}
      />
    </div>
  );
}
