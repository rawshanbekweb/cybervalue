import { getAdminTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { requireAdmin, scopeOf } from "@/lib/auth";
import { collections } from "@/lib/site";
import { getDb } from "@/lib/db";
import { adminBadges } from "@/lib/admin/overview";
import { AdminNav, type AdminNavGroup } from "@/components/admin/admin-nav";
import { logoutAction } from "../actions";

export default async function AdminCmsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const t = await getAdminTranslator();
  const session = await requireAdmin();
  const scope = scopeOf(session);
  const db = getDb();
  const badges = db
    ? await adminBadges(db, scope).catch(() => ({ reviews: 0, errors: 0 }))
    : { reviews: 0, errors: 0 };
  const groups: AdminNavGroup[] = [
    {
      items: [
        { href: "/admin", label: t("Dashboard") },
        { href: "/admin/settings", label: t("Site settings") },
      ],
    },
    {
      title: t("Learning"),
      items: [
        { href: "/admin/class", label: t("Class") },
        { href: "/admin/assignments", label: t("Assignments") },
        { href: "/admin/live", label: t("Live quiz") },
        { href: "/admin/telegram", label: "Telegram" },
        { href: "/admin/groups", label: t("Groups") },
        { href: "/admin/users", label: t("All users") },
        { href: "/admin/students", label: t("Students") },
        { href: "/admin/kids", label: "Academy Kids" },
        { href: "/admin/junior", label: "Academy Junior" },
        {
          href: "/admin/materials",
          label: t("Student materials"),
          badge: badges.reviews,
        },
        { href: "/admin/results", label: t("Results") },
        { href: "/admin/assessments", label: t("HTML baholash") },
      ],
    },
    {
      title: t("Site content"),
      items: [
        ...Object.entries(collections).map(([key, value]) => ({
          href: `/admin/${key}`,
          label: t(value.title),
        })),
        { href: "/admin/files", label: t("File library") },
        { href: "/admin/portrait", label: t("Home page portrait") },
      ],
    },
    {
      title: t("Security"),
      items: [
        { href: "/admin/status", label: t("System status") },
        { href: "/admin/errors", label: t("Errors"), badge: badges.errors },
        { href: "/admin/cleanup", label: t("Clean-up") },
        { href: "/admin/trash", label: t("Trash") },
        { href: "/admin/team", label: t("Team") },
        { href: "/admin/audit", label: t("Audit log") },
        { href: "/admin/account", label: t("Account settings") },
      ],
    },
  ];
  // Teachers see their own work; the rest belongs to the owner.
  const TEACHER = new Set([
    "/admin",
    "/admin/class",
    "/admin/assignments",
    "/admin/live",
    "/admin/students",
    "/admin/junior",
    "/admin/kids",
    "/admin/groups",
    "/admin/materials",
    "/admin/results",
    "/admin/assessments",
    "/admin/trash",
    "/admin/account",
  ]);
  const nav = scope.owner
    ? groups
    : groups
        .map((g) => ({
          ...g,
          items: g.items.filter((i) => TEACHER.has(i.href)),
        }))
        .filter((g) => g.items.length);
  return (
    <div className="admin-shell container">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          {t("cybervalue admin")}
        </Link>
        <form
          method="get"
          action="/admin/search"
          role="search"
          className="admin-sidebar-search"
        >
          <label htmlFor="admin-global-search" className="visually-hidden">
            {t("Search the admin")}
          </label>
          <input
            id="admin-global-search"
            name="q"
            type="search"
            className="admin-input"
            placeholder={t("Search people, materials…")}
            minLength={2}
            maxLength={80}
          />
        </form>
        <AdminNav groups={nav} />
        <div className="admin-sidebar-footer">
          <span className="muted">
            {session.user.email}
            {!scope.owner && ` · ${t("Teacher")}`}
          </span>
          <form action={logoutAction}>
            <button type="submit" className="button button-secondary">
              {t("Log out")}
            </button>
          </form>
        </div>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
