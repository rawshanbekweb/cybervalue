import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { HideOnConcept } from "@/components/hide-on-concept";
import { site, navigation } from "@/lib/site";
import { getSocials } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  title: {
    default: "CyberValue — Cybersecurity & Software Development",
    template: "%s | CyberValue",
  },
  description: site.description,
  robots: { index: site.indexable, follow: true },
};
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
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
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
                <p>Curiosity. Practice. Evidence.</p>
              </div>
              <div className="footer-links">
                <Link href="/activity">Activity</Link>
                <Link href="/search">Search the archive</Link>
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
              <span>Think critically. Build securely.</span>
              <a href="#main">Back to top ↑</a>
            </div>
          </footer>
        </HideOnConcept>
      </body>
    </html>
  );
}
