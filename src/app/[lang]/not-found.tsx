import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";
export default async function NotFound() {
  const t = await getTranslator();
  return (
    <div className="container error-page">
      <span className="eyebrow">{t("404 / Outside the archive")}</span>
      <h1>{t("This trail ends here.")}</h1>
      <p>
        {t(
          "The page may have moved, or the entry is not published. There is still plenty of room to explore.",
        )}
      </p>
      <Link className="button button-primary" href="/">
        {t("Back to overview ↗")}
      </Link>
      <Link className="button button-secondary" href="/search">
        {t("Search the archive")}
      </Link>
    </div>
  );
}
