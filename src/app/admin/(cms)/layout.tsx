import { getAdminTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { collections } from "@/lib/site";
import { logoutAction } from "../actions";

export default async function AdminCmsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const t = await getAdminTranslator();
  const session = await requireAdmin();
  return (
    <div className="admin-shell container">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          {t("cybervalue admin")}
        </Link>
        <nav className="admin-nav" aria-label={t("Admin sections")}>
          <Link href="/admin">{t("Dashboard")}</Link>
          <Link href="/admin/settings">{t("Site settings")}</Link>
          <p className="admin-nav-group">{t("Learning")}</p>
          <Link href="/admin/class">{t("Class")}</Link>
          <Link href="/admin/assignments">{t("Assignments")}</Link>
          <Link href="/admin/live">{t("Live quiz")}</Link>
          <Link href="/admin/telegram">Telegram</Link>
          <Link href="/admin/users">{t("All users")}</Link>
          <Link href="/admin/students">{t("Students")}</Link>
          <Link href="/admin/junior">Academy Junior</Link>
          <Link href="/admin/materials">{t("Student materials")}</Link>
          <Link href="/admin/results">{t("Results")}</Link>
          <Link href="/admin/assessments">{t("HTML baholash")}</Link>
          <p className="admin-nav-group">{t("Site content")}</p>
          {Object.entries(collections).map(([key, value]) => (
            <Link key={key} href={`/admin/${key}`}>
              {t(value.title)}
            </Link>
          ))}
          <Link href="/admin/files">{t("File library")}</Link>
          <Link href="/admin/portrait">{t("Home page portrait")}</Link>
          <p className="admin-nav-group">{t("Security")}</p>
          <Link href="/admin/audit">{t("Audit log")}</Link>
          <Link href="/admin/account">{t("Account settings")}</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <span className="muted">{session.user.email}</span>
          <form action={logoutAction}>
            <button type="submit" className="button button-secondary">
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
