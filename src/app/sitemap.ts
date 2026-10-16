import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/content";
import { site, collections, contentUrl } from "@/lib/site";
import { siteIndexable } from "@/lib/site-config-server";
export const revalidate = 60;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!(await siteIndexable())) return [];
  const content = await getSitemapEntries();
  return [
    ...[
      "",
      "/about",
      "/activity",
      "/playground",
      "/playground/junior",
      "/playground/junior/secret",
      "/playground/linux-basics",
      "/playground/network-basics",
      "/playground/ctf",
      "/playground/missions",
      "/playground/studio",
      "/playground/defend",
      "/playground/html-basics",
      "/playground/web-security-lab",
      "/lessons/web-asoslari/index.html",
      "/lessons/private-ipv4/index.html",
      ...Object.keys(collections).map((k) => `/${k}`),
    ].map((path) => ({ url: `${site.url}${path}` })),
    ...content.map((e) => ({
      url: `${site.url}${contentUrl(e)}`,
      lastModified: e.updatedAt,
    })),
  ];
}
