import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminTranslator } from "@/lib/i18n/server";
import { getStudentSession } from "@/lib/student/session";
import { Constellation } from "@/components/student/constellation";
import { StudentLoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function StudentLoginPage() {
  if (await getStudentSession()) redirect("/student");
  const t = await getAdminTranslator();
  return (
    <div className="student-page">
      <header className="student-nav">
        <Link href="/" className="student-logo">
          <span aria-hidden="true" className="student-logo-mark" />
          cybervalue
        </Link>
        <Link href="/" className="student-ghost">
          {t("Public site")}
        </Link>
      </header>
      <main id="student-main" className="student-hero">
        <div className="student-hero-copy">
          <p className="student-label">{t("Student area")}</p>
          <h1 className="student-display">
            {t("Learn beyond the public page.")}
          </h1>
          <p className="student-lead">
            {t(
              "Private labs, tests and practice prepared by your teacher. Enter the access code you were given.",
            )}
          </p>
          <StudentLoginForm />
          <p className="student-quiet">
            {t(
              "No code? Ask your teacher. Codes are personal — do not share yours.",
            )}
          </p>
        </div>
        <Constellation className="student-hero-art" />
      </main>
    </div>
  );
}
