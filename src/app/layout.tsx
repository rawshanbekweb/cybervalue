import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { HideOnConcept } from "@/components/hide-on-concept";
import { site, navigation } from "@/lib/site";
import { getSocials } from "@/lib/content";
import { LocaleProvider } from "@/components/locale-provider";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import "./globals.css";

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
export const viewport: Viewport = {
  themeColor: "#101211",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const socials = await getSocials();
  const locale = await getLocale();
  const t = await getTranslator();
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body>
        <LocaleProvider locale={locale}>
          <a href="#main" className="skip-link">
            {t("Skip to content")}
          </a>
          <SiteHeader items={navigation} />
          <main id="main">{children}</main>
          <HideOnConcept>
            <footer className="site-footer container">
              <div className="footer-top">
                <div>
                  <Link className="wordmark" href="/">
                    cyber<span>value</span>
                    <span className="brand-period">.</span>
                  </Link>
                  <p>{t("Curiosity. Practice. Evidence.")}</p>
                </div>
                <div className="footer-links">
                  <Link href="/activity">{t("Activity")}</Link>
                  <Link href="/search">{t("Search the archive")}</Link>
                  {socials.map((s) => (
                    <a
                      key={s.platform}
                      href={s.url}
                      rel="me noopener noreferrer"
                    >
                      {s.platform}
                      <ArrowUpRight size={13} />
                    </a>
                  ))}
                </div>
              </div>
              <div className="footer-bottom">
                <span>
                  © {new Date().getFullYear()} {site.person}
                </span>
                <span>{t("Think critically. Build securely.")}</span>
                <a href="#main">{t("Back to top ↑")}</a>
              </div>
            </footer>
          </HideOnConcept>
        </LocaleProvider>
      </body>
    </html>
  );
}
