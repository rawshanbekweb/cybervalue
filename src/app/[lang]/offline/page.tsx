import Link from "next/link";
import { getTranslator } from "@/lib/i18n/server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Offline",
    "This page is not saved on this device yet.",
    "/offline",
    true,
  );

// Shown by the service worker when a page was never opened before and there
// is no connection.
export default async function OfflinePage() {
  const t = await getTranslator();
  return (
    <div className="container page-content offline-page">
      <header className="page-header">
        <span className="eyebrow">{t("Offline")}</span>
        <h1>
          {t("No connection.")}
          <br />
          <span>{t("Your labs still work.")}</span>
        </h1>
        <p>
          {t(
            "This page is not saved on this device yet. Pages and labs you have opened before open without internet, and lesson progress is kept in this browser until you are back online.",
          )}
        </p>
      </header>
      <Link className="button button-primary" href="/akademiya">
        {t("Open the Academy")}
      </Link>
    </div>
  );
}
