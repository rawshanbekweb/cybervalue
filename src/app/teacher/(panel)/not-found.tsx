import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";

export default async function TeacherNotFound() {
  const t = await getAdminTranslator();
  return (
    <div className="admin-page">
      <span className="eyebrow">404</span>
      <h1>{t("This page does not exist.")}</h1>
      <p className="muted">
        {t("The link may be old, or the item was deleted.")}
      </p>
      <p>
        <Link href="/teacher" className="button button-primary">
          {t("Back to the dashboard")}
        </Link>
      </p>
    </div>
  );
}
