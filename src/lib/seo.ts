import type { Metadata } from "next";
import { site } from "./site";

export function metadata(
  title: string,
  description: string,
  path: string,
  noindex = false,
): Metadata {
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
      locale: "en_US",
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
