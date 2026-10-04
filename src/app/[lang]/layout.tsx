import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { site } from "@/lib/site";
import { isLocale, locales } from "@/lib/i18n";
import { getTranslator } from "@/lib/i18n/server";
import "../globals.css";

export const viewport: Viewport = {
  themeColor: "#101211",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

// Public pages are prerendered once per language. proxy.ts rewrites each
// request to its language segment, so visitors still see unprefixed URLs.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    metadataBase: new URL(site.url),
    applicationName: site.name,
    title: {
      default: t("CyberValue — Cybersecurity & Software Development"),
      template: "%s | CyberValue",
    },
    description: t(site.description),
    robots: { index: site.indexable, follow: true },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <SiteShell locale={lang}>{children}</SiteShell>;
}
