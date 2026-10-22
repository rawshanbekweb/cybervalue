import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";
import { roleOf, type StaffSession } from "@/lib/auth";
import { AdminNav, type AdminNavGroup } from "@/components/admin/admin-nav";
import { logoutAction } from "@/app/admin/actions";

// The sidebar both staff panels share: brand, search, menu, the way to the
// other panel (admins only) and sign-out.
export async function StaffShell({
  panel,
  session,
  groups,
  children,
}: {
  panel: "admin" | "teacher";
  session: StaffSession;
  groups: AdminNavGroup[];
  children: React.ReactNode;
}) {
  const t = await getAdminTranslator();
  const role = roleOf(session.user);
  const roleLabel = {
    owner: t("Owner"),
    admin: t("Admin"),
    teacher: t("Teacher"),
  };
  return (
    <div className="admin-shell container">
      <aside className="admin-sidebar">
        <Link href={`/${panel}`} className="admin-brand">
          {panel === "admin" ? t("cybervalue admin") : t("cybervalue teacher")}
        </Link>
        <form
          method="get"
          action="/teacher/search"
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
        <AdminNav groups={groups} />
        <div className="admin-sidebar-footer">
          {role !== "teacher" && (
            <Link
              href={panel === "admin" ? "/teacher" : "/admin"}
              className="button button-secondary"
            >
              {panel === "admin" ? t("Teacher panel") : t("Admin panel")}
            </Link>
          )}
          <span className="muted">
            {session.user.email} · {roleLabel[role]}
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
