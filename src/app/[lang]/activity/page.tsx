import { getLocale, getTranslator } from "@/lib/i18n/server";
import { metadata } from "@/lib/seo";
import { getRecent } from "@/lib/content";
import { EntryCard, formatDate, ArrowLink } from "@/components/ui";
import { GitCommitHorizontal } from "lucide-react";
export const revalidate = 60;
export const generateMetadata = () =>
  metadata(
    "Activity",
    "A chronological record of published projects, security labs, research, CTF records, and resources by Rawshanbek Gayipbaev.",
    "/activity",
  );
export default async function Activity() {
  const t = await getTranslator();
  const locale = await getLocale();
  const entries = await getRecent(50);
  return (
    <div className="container page-content">
      <header className="page-header">
        <span className="eyebrow">{t("The logbook")}</span>
        <h1>{t("Progress leaves a trail.")}</h1>
        <p>
          {t(
            "A record of the work as it is published. Small steps, useful discoveries, and lessons carried forward.",
          )}
        </p>
      </header>
      {entries.length ? (
        <>
          <h2 className="visually-hidden">{t("Recent entries")}</h2>
          <ol className="timeline">
            {entries.map((e) => (
              <li key={e.id}>
                <time dateTime={e.publishedAt!.toISOString()}>
                  {formatDate(e.publishedAt!, locale)}
                </time>
                <EntryCard entry={e} />
              </li>
            ))}
          </ol>
          {entries.length === 50 && (
            <ArrowLink href="/search">{t("Browse the full archive")}</ArrowLink>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <GitCommitHorizontal size={28} />
          </div>
          <span className="eyebrow">{t("Ready for the first entry")}</span>
          <h2>{t("The record starts with real work.")}</h2>
          <p>
            {t(
              "New publications will appear here automatically. There are no published entries yet.",
            )}
          </p>
          <ArrowLink href="/work">{t("Explore the work archive")}</ArrowLink>
        </div>
      )}
    </div>
  );
}
