import type { Metadata } from "next";
import { site } from "./site";
import { getLocale, getTranslator } from "./i18n/server";

export async function metadata(
  title: string,
  description: string,
  path: string,
  noindex = false,
): Promise<Metadata> {
  const t = await getTranslator();
  const locale = await getLocale();
  title = t(title);
  description = t(description);
  const fullTitle = path === "/" ? title : `${title} | ${site.name}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: `${site.url}${path === "/" ? "" : path}` },
    robots: { index: site.indexable && !noindex, follow: true },
    openGraph: {
      type: "website",
      title: fullTitle,
      description,
      url: `${site.url}${path}`,
      siteName: site.name,
      locale: locale === "uz" ? "uz_UZ" : "en_US",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "CyberValue — Cybersecurity × Software Development",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/opengraph-image"],
    },
  };
}
