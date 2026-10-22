import { getAdminTranslator } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { requireAdmin, scopeOf } from "@/lib/auth";
import { collections } from "@/lib/site";
import { getDb } from "@/lib/db";
import { adminBadges } from "@/lib/admin/overview";
import type { AdminNavGroup } from "@/components/admin/admin-nav";
import { StaffShell } from "@/components/admin/staff-shell";

// The admin panel runs the site. Teaching lives in /teacher, so teachers
// are sent there.
export default async function AdminCmsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const t = await getAdminTranslator();
  const session = await requireAdmin();
  const scope = scopeOf(session);
  if (!scope.owner) redirect("/teacher");
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
      title: t("People"),
      items: [
        { href: "/admin/users", label: t("All users") },
        { href: "/admin/team", label: t("Team") },
        { href: "/admin/telegram", label: "Telegram" },
      ],
    },
    {
      title: t("Security"),
      items: [
        { href: "/admin/status", label: t("System status") },
        { href: "/admin/errors", label: t("Errors"), badge: badges.errors },
        { href: "/admin/cleanup", label: t("Clean-up") },
        { href: "/admin/audit", label: t("Audit log") },
        { href: "/admin/account", label: t("Account settings") },
      ],
    },
  ];
  return (
    <StaffShell panel="admin" session={session} groups={groups}>
      {children}
    </StaffShell>
  );
}
