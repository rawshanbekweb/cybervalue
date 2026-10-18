import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";
import { Constellation } from "@/components/student/constellation";

// Unknown student URLs (and notFound() inside the area) stay in the student
// design and language instead of Next's default page.
export default async function StudentNotFound() {
  const t = await getAdminTranslator();
  return (
    <div className="student-page">
      <header className="student-nav">
        <Link href="/student" className="student-logo">
          <span aria-hidden="true" className="student-logo-mark" />
          cybervalue
        </Link>
      </header>
      <main id="student-main" className="student-hero">
        <div className="student-hero-copy">
          <p className="student-label">{t("404 · Student area")}</p>
          <h1 className="student-display">{t("This page is not here.")}</h1>
          <p className="student-lead">
            {t(
              "The link may be incomplete or out of date. Your materials, tests and certificates are on the student area home page.",
            )}
          </p>
          <p className="student-not-found-actions">
            <Link href="/student" className="student-button">
              {t("Back to the student area")}
            </Link>
          </p>
        </div>
        <Constellation className="student-hero-art" />
      </main>
    </div>
  );
}
