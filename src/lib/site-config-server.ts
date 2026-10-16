import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getDb } from "./db";
import { env } from "./env";
import {
  parseSiteConfig,
  type SectionId,
  type SiteConfig,
} from "./site-config";

export const SITE_CONFIG_KEY = "site-config";

export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const setting = await getDb()
    ?.siteSetting.findUnique({ where: { key: SITE_CONFIG_KEY } })
    .catch(() => null);
  return parseSiteConfig(setting?.value);
});

/** Whether search engines may index the site: the admin's choice, else the env. */
export async function siteIndexable() {
  const { indexable } = await getSiteConfig();
  return indexable ?? env.SITE_INDEXABLE;
}

/** A switched-off section answers 404 until an admin opens it again. */
export async function requireSection(...ids: SectionId[]) {
  const { sections } = await getSiteConfig();
  if (ids.some((id) => !sections[id])) notFound();
}
