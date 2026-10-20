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
      "/akademiya",
      "/kids",
      "/junior",
      "/junior/secret",
      "/akademiya/linux-basics",
      "/akademiya/network-basics",
      "/akademiya/ctf",
      "/akademiya/missions",
      "/akademiya/studio",
      "/akademiya/defend",
      "/akademiya/html-basics",
      "/akademiya/web-security-lab",
      "/akademiya/intermediate",
      "/akademiya/http",
      "/akademiya/http-basics",
      "/akademiya/https",
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
