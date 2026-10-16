import Link from "next/link";
import { Inter } from "next/font/google";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { LocaleProvider } from "@/components/locale-provider";
import { site } from "@/lib/site";
import { getSiteConfig } from "@/lib/site-config-server";
import { pick } from "@/lib/site-config";
import { getSocials } from "@/lib/content";
import { createTranslator, type Locale } from "@/lib/i18n";

// Design.MD names Inter as the PPNeueMontreal substitute; latin-ext covers
// Uzbek letters and cyrillic covers the Russian-script fallbacks. Without a
// weight list Inter loads as one variable file per subset, which is smaller
// than four static weights and also renders in-between weights (450, 550).
const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

// Document chrome shared by the public root layout and the admin root layout.
// The locale is a prop so this component never reads cookies itself, which
// keeps statically generated public pages static.
export async function SiteShell({
  locale,
  children,
}: Readonly<{ locale: Locale; children: React.ReactNode }>) {
  const [socials, config] = await Promise.all([getSocials(), getSiteConfig()]);
  const t = createTranslator(locale);
  const open = config.sections;
  // Two directions up front; the author's portfolio lives under About.
  const navigation = [
    ...(open.junior ? [{ href: "/junior", label: "Academy Junior" }] : []),
    ...(open.academy ? [{ href: "/akademiya", label: "Academy" }] : []),
    { href: "/about", label: "About" },
  ];
  const announcement =
    config.announcement.enabled && pick(config.announcement.text, locale);
  return (
    <html
      lang={locale}
      className={inter.variable}
      data-scroll-behavior="smooth"
    >
      <body>
        <LocaleProvider locale={locale}>
          <a href="#main" className="skip-link">
            {t("Skip to content")}
          </a>
          {announcement && (
            <div className="site-announcement" role="note">
              <span className="status-dot" aria-hidden="true" />
              {config.announcement.href ? (
                <a href={config.announcement.href}>
                  {announcement}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ) : (
                <span>{announcement}</span>
              )}
            </div>
          )}
          <SiteHeader items={navigation} studentArea={open.studentArea} />
          <main id="main">{children}</main>
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
                {open.portfolio && (
                  <>
                    <Link href="/work">{t("Work")}</Link>
                    <Link href="/research">{t("Research")}</Link>
                    <Link href="/labs">{t("Lab write-ups")}</Link>
                    <Link href="/ctf">CTF</Link>
                    <Link href="/resources">{t("Resources")}</Link>
                  </>
                )}
                <Link href="/search">{t("Search the archive")}</Link>
                {config.email && (
                  <a href={`mailto:${config.email}`}>{config.email}</a>
                )}
                {socials.map((s) => (
                  <a key={s.platform} href={s.url} rel="me noopener noreferrer">
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
        </LocaleProvider>
      </body>
    </html>
  );
}
