import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { HideOnConcept } from "@/components/hide-on-concept";
import { LocaleProvider } from "@/components/locale-provider";
import { site, navigation } from "@/lib/site";
import { getSocials } from "@/lib/content";
import { createTranslator, type Locale } from "@/lib/i18n";

// Document chrome shared by the public root layout and the admin root layout.
// The locale is a prop so this component never reads cookies itself, which
// keeps statically generated public pages static.
export async function SiteShell({
  locale,
  children,
}: Readonly<{ locale: Locale; children: React.ReactNode }>) {
  const socials = await getSocials();
  const t = createTranslator(locale);
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
