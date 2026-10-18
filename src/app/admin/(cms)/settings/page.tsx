import { getAdminTranslator } from "@/lib/i18n/server";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { getSiteConfig } from "@/lib/site-config-server";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const t = await getAdminTranslator();
  await requireOwner("/admin/settings");
  const db = getDb();
  const [config, links] = await Promise.all([
    getSiteConfig(),
    db?.socialLink.findMany() ?? [],
  ]);
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Site settings")}</h1>
          <p className="muted">
            {t(
              "Sections, the announcement banner, home page text, contacts and search engines. Changes go live as soon as you save.",
            )}
          </p>
        </div>
      </div>
      {!db && (
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      )}
      <SettingsForm
        config={config}
        socials={Object.fromEntries(links.map((l) => [l.platform, l.url]))}
        envIndexable={env.SITE_INDEXABLE}
      />
    </div>
  );
}
