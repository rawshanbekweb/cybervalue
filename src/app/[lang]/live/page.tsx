import { getTranslator } from "@/lib/i18n/server";
import { metadata } from "@/lib/seo";
import { LivePlayer } from "@/components/live/live-player";

export const generateMetadata = () =>
  metadata(
    "Live quiz",
    "Join your class's live quiz with the code on the screen.",
    "/live",
    true,
  );

export default async function LivePage() {
  const t = await getTranslator();
  return (
    <div className="container page-content live-page">
      <header className="page-header">
        <span className="eyebrow">{t("Live quiz")}</span>
        <h1>
          {t("Live quiz.")}
          <br />
          <span>{t("Play along with your class.")}</span>
        </h1>
      </header>
      <LivePlayer />
    </div>
  );
}
