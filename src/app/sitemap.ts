import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/content";
import { site, collections, contentUrl } from "@/lib/site";
import { getSiteConfig, siteIndexable } from "@/lib/site-config-server";
import { closedSection } from "@/lib/site-config";
export const revalidate = 60;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!(await siteIndexable())) return [];
  const [content, config] = await Promise.all([
    getSitemapEntries(),
    getSiteConfig(),
  ]);
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
      "/intermediate",
      "/akademiya/http-basics",
      "/akademiya/http-basics/video",
      "/akademiya/https",
      "/akademiya/https/video",
      "/akademiya/bash",
      "/akademiya/bash/video",
      "/akademiya/ssh",
      "/akademiya/crypto",
      "/akademiya/crypto/video",
      "/lessons/web-asoslari/index.html",
      "/lessons/private-ipv4/index.html",
      ...Object.keys(collections).map((k) => `/${k}`),
    ]
      // Pages switched off in the site settings answer 404; leave them out.
      .filter((path) => !closedSection(config, path))
      .map((path) => ({ url: `${site.url}${path}` })),
    ...content.map((e) => ({
      url: `${site.url}${contentUrl(e)}`,
      lastModified: e.updatedAt,
    })),
  ];
}
