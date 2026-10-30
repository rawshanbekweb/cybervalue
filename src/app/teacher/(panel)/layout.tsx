import { getAdminTranslator } from "@/lib/i18n/server";
import { requireAdmin, scopeOf } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { adminBadges } from "@/lib/admin/overview";
import type { AdminNavGroup } from "@/components/admin/admin-nav";
import { StaffShell } from "@/components/admin/staff-shell";

// The teacher panel: classes, learners, tests and grading. Teachers see
// their own groups; admins see every group.
export default async function TeacherPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const t = await getAdminTranslator();
  const session = await requireAdmin("/teacher");
  const scope = scopeOf(session);
  const db = getDb();
  const badges = db
    ? await adminBadges(db, scope).catch(() => ({ reviews: 0, errors: 0 }))
    : { reviews: 0, errors: 0 };
  const groups: AdminNavGroup[] = [
    {
      items: [
        { href: "/teacher", label: t("Dashboard") },
        { href: "/teacher/class", label: t("Class") },
      ],
    },
    {
      title: t("Teaching"),
      items: [
        { href: "/teacher/assignments", label: t("Assignments") },
        { href: "/teacher/materials", label: t("Student materials") },
        {
          href: "/teacher/grading",
          label: t("Grading"),
          badge: badges.reviews,
        },
        { href: "/teacher/results", label: t("Results") },
        { href: "/teacher/live", label: t("Live quiz") },
        { href: "/teacher/assessments", label: t("HTML baholash") },
        { href: "/teacher/linux-ip-exam", label: t("Linux va IP imtihoni") },
        { href: "/teacher/analytics", label: t("Analytics") },
      ],
    },
    {
      title: t("Learners"),
      items: [
        { href: "/teacher/groups", label: t("Groups") },
        { href: "/teacher/students", label: t("Students") },
        { href: "/teacher/junior", label: "Academy Junior" },
        { href: "/teacher/kids", label: "Academy Kids" },
        { href: "/teacher/intermediate", label: "Academy Intermediate" },
      ],
    },
    {
      items: [
        { href: "/teacher/trash", label: t("Trash") },
        { href: "/teacher/account", label: t("Account settings") },
      ],
    },
  ];
  return (
    <StaffShell panel="teacher" session={session} groups={groups}>
      {children}
    </StaffShell>
  );
}
