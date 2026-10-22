import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { siteIndexable } from "@/lib/site-config-server";

export const revalidate = 300;
export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: (await siteIndexable())
      ? {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/admin",
            "/teacher",
            "/student",
            "/api",
            "/login",
            "/private",
            "/internal",
            "/downloads/",
          ],
        }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
