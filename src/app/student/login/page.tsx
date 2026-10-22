import { requireSection } from "@/lib/site-config-server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminTranslator } from "@/lib/i18n/server";
import { getStudentSession } from "@/lib/student/session";
import { Constellation } from "@/components/student/constellation";
import { StudentLoginForm } from "./login-form";
import { isStudentNext } from "@/lib/student/levels";

export async function generateMetadata() {
  const t = await getAdminTranslator();
  return { title: t("Sign in") };
}

export default async function StudentLoginPage({
  searchParams,
}: PageProps<"/student/login">) {
  await requireSection("studentArea");
  const asked = (await searchParams).next;
  const next = isStudentNext(asked) ? asked : undefined;
  // /student/continue also moves an old /student-only cookie to the site.
  if (await getStudentSession())
    redirect(
      next ? `/student/continue?to=${encodeURIComponent(next)}` : "/student",
    );
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
          <StudentLoginForm next={next} />
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
