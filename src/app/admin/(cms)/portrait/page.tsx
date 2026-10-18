import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireOwner } from "@/lib/auth";
import { getHomePortrait } from "@/lib/home-portrait";
import { Constellation } from "@/components/constellation";
import { formatDate } from "@/components/ui";
import { PortraitUploadForm } from "@/components/portrait-upload";
import { resetHomePortraitAction, saveHomePortraitAction } from "./actions";

export default async function HomePortraitPage() {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  await requireOwner("/admin/portrait");
  const custom = await getHomePortrait();
  return (
    <div className="admin-page">
      <h1>{t("Home page portrait")}</h1>
      <p className="muted">
        {t(
          "The animated particle portrait beside the home page headline. Upload a photo to replace it; the change reaches the site within a minute.",
        )}
      </p>
      <div className="admin-portrait">
        <Constellation
          className="admin-portrait-canvas"
          layout="card"
          data={custom?.data}
        />
        <div className="admin-portrait-side">
          <p>
            {custom
              ? t("Uploaded portrait, updated {date}.", {
                  date: formatDate(custom.updatedAt, locale),
                })
              : t("The default portrait is shown.")}
          </p>
          <PortraitUploadForm
            action={saveHomePortraitAction}
            variant="admin"
            label={t("New photo")}
          />
          {custom && (
            <form action={resetHomePortraitAction}>
              <button type="submit" className="button button-secondary">
                {t("Restore the default portrait")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
