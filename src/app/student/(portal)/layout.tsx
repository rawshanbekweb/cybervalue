import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";
import { requireStudent } from "@/lib/student/session";
import { LanguageSwitcher } from "@/components/language-switcher";
import { studentLogoutAction } from "../actions";

export default async function StudentPortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const t = await getAdminTranslator();
  const student = await requireStudent();
  return (
    <div className="student-page">
      <header className="student-nav">
        <Link href="/student" className="student-logo">
          <span aria-hidden="true" className="student-logo-mark" />
          cybervalue
        </Link>
        <nav aria-label={t("Student area")} className="student-nav-links">
          <Link href="/student#lessons">{t("Lessons")}</Link>
          <Link href="/student#labs">{t("Labs")}</Link>
          <Link href="/student#practice">{t("Practice")}</Link>
          <Link href="/student#tests">{t("Tests")}</Link>
        </nav>
        <div className="student-nav-end">
          <LanguageSwitcher />
          <span className="student-nav-name">{student.name}</span>
          <form action={studentLogoutAction}>
            <button type="submit" className="student-ghost">
              {t("Sign out")}
            </button>
          </form>
        </div>
      </header>
      <main id="student-main">{children}</main>
    </div>
  );
}
