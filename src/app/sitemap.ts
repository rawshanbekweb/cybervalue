import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/content";
import { site, collections, contentUrl } from "@/lib/site";
export const revalidate = 60;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!site.indexable) return [];
  const content = await getSitemapEntries();
  return [
    ...[
      "",
      "/about",
      "/activity",
      "/playground",
      "/playground/ctf",
      "/playground/missions",
      "/playground/studio",
      "/playground/html-basics",
      "/playground/web-security-lab",
      "/lessons/web-asoslari/index.html",
      ...Object.keys(collections).map((k) => `/${k}`),
    ].map((path) => ({ url: `${site.url}${path}` })),
    ...content.map((e) => ({
      url: `${site.url}${contentUrl(e)}`,
      lastModified: e.updatedAt,
    })),
  ];
}
