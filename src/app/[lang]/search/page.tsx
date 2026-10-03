import { getTranslator } from "@/lib/i18n/server";
import { metadata } from "@/lib/seo";
import { Archive, type SearchParams } from "@/components/archive";
export const generateMetadata = () =>
  metadata(
    "Search the archive",
    "Find published projects, security labs, research, CTF writeups, and technical resources on CyberValue.",
    "/search",
    true,
  );
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslator();
  return (
    <div className="container page-content">
      <header className="page-header">
        <span className="eyebrow">{t("Follow the thread")}</span>
        <h1>{t("Search the archive.")}</h1>
        <p>
          {t("One place to find the work, the questions, and the lessons.")}
        </p>
      </header>
      <Archive params={await searchParams} />
    </div>
  );
}
