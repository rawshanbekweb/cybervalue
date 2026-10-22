import { getLocale, getTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { Directions } from "@/components/directions";
import { Constellation } from "@/components/constellation";
import { CardSpotlight } from "@/components/card-spotlight";
import { SectionHeading, EntryCard, JsonLd } from "@/components/ui";
import { getFeatured } from "@/lib/content";
import { homePortraitVersion } from "@/lib/home-portrait";
import { metadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { pick } from "@/lib/site-config";
import { getSiteConfig } from "@/lib/site-config-server";
import "../home.css";

export const revalidate = 60;
export const generateMetadata = () =>
  metadata(
    "Cybervalue Academy — learn cybersecurity by doing it",
    "Two learning paths: Academy Junior for school students and hands-on Academy labs for networks, Linux, the web and security.",
    "/",
  );

export default async function Home() {
  const t = await getTranslator();
  const locale = await getLocale();
  const [featured, portraitVersion, config] = await Promise.all([
    getFeatured(),
    homePortraitVersion(),
    getSiteConfig(),
  ]);
  const open = config.sections;
  const title = pick(config.hero.title, locale);
  const lead = pick(config.hero.lead, locale);
  return (
    <div className="cv-home">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: site.url,
          description: t(site.description),
          author: { "@id": `${site.url}/about#person` },
        }}
      />
      <CardSpotlight selector=".direction, .entry-card" />
      <div className="cv-hero-wrap">
        <Constellation
          className="cv-constellation"
          src={
            portraitVersion ? `/api/portrait?v=${portraitVersion}` : undefined
          }
        />
        <section className="cv-hero container" aria-labelledby="home-title">
          <div className="cv-hero-copy">
            <span className="cv-kicker">
              <span className="status-dot" /> {t("CYBERVALUE ACADEMY")}
            </span>
            <h1 id="home-title">
              {title || (
                <>
                  {t("Learn cybersecurity")}
                  <br />
                  <span>{t("by doing it.")}</span>
                </>
              )}
            </h1>
            <p>
              {lead ||
                t(
                  "Four paths, one goal: understand how systems work and how to protect them. Pick the one that fits your age and level.",
                )}
            </p>
            <div className="cv-hero-actions">
              {open.junior && (
                <Link className="button button-primary" href="/junior">
                  {t("Academy Junior")}
                  <ArrowUpRight size={18} />
                </Link>
              )}
              {open.academy && (
                <Link className="cv-secondary-link" href="/akademiya">
                  {t("Academy labs")}
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
      <div className="container">
        <section className="cv-section" aria-labelledby="paths-title">
          <div className="cv-section-intro">
            <div>
              <span className="eyebrow">{t("CHOOSE YOUR PATH")}</span>
              <h2 id="paths-title">
                {t("From the first game to real labs.")}{" "}
                <span>{t("One way of learning.")}</span>
              </h2>
            </div>
            <p>
              {t(
                "Each path starts from zero and grows with you: Kids, then Junior, then the Academy and Intermediate. Your teacher gives you an access code.",
              )}
            </p>
          </div>
          <Directions t={t} config={config} headingLevel={3} />
        </section>
        <section className="cv-feature-band" aria-labelledby="method-title">
          <div>
            <span className="eyebrow">{t("HOW IT WORKS")}</span>
            <h2 id="method-title">
              {t("Don’t just know the answer.")}
              <br />
              {t("Know why it works.")}
            </h2>
          </div>
          <ol>
            {[
              {
                icon: BookOpen,
                title: "Understand the idea",
                text: "A short explanation with an everyday picture, never a wall of theory.",
              },
              {
                icon: Terminal,
                title: "Try it yourself",
                text: "Every lesson ends in a hands-on task that checks your answer at once.",
              },
              {
                icon: ShieldCheck,
                title: "Prove what you learned",
                text: "Checkpoint tests, XP and certificates show your progress to you and your teacher.",
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <li key={title}>
                <span className="cv-step">0{index + 1}</span>
                <Icon size={19} />
                <div>
                  <h3>{t(title)}</h3>
                  <p>{t(text)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        {open.portfolio && featured.length > 0 && (
          <section className="cv-section">
            <SectionHeading
              number="↳"
              title={t("From the author’s work")}
              href="/about"
              link={t("About the author")}
            />
            <div className="entry-grid">
              {featured.slice(0, 3).map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
