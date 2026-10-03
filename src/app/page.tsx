import { getLocale, getTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Fingerprint,
  FlaskConical,
  Layers3,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { LearningCatalog } from "@/components/learning-catalog";
import { MissionGateway } from "@/components/mission-gateway";
import { StudioGateway } from "@/components/studio-gateway";
import { CtfGateway } from "@/components/ctf-gateway";
import { PracticePreview } from "@/components/practice-preview";
import {
  SectionHeading,
  EntryCard,
  JsonLd,
  ArrowLink,
  formatDate,
} from "@/components/ui";
import { getFeatured, getRecent, getSocials } from "@/lib/content";
import { getLearningTracks } from "@/lib/learning";
import { metadata } from "@/lib/seo";
import { contentUrl, site } from "@/lib/site";
import "@/components/learning.css";
import "./home.css";

export const revalidate = 60;
export const generateMetadata = () =>
  metadata(
    "CyberValue — Cybersecurity & Software Development",
    site.description,
    "/",
  );

export default async function Home() {
  const t = await getTranslator();
  const locale = await getLocale();
  const [featured, recent, socials] = await Promise.all([
    getFeatured(),
    getRecent(4),
    getSocials(),
  ]);
  const tracks = getLearningTracks();
  const lessonCount = tracks.reduce(
    (total, track) => total + track.lessons.length,
    0,
  );
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
      <div className="cv-hero-wrap">
        <section className="cv-hero container" aria-labelledby="home-title">
          <div className="cv-hero-copy">
            <span className="cv-kicker">
              <span className="status-dot" />{" "}
              {t("THE CURIOSITY TO BUILD. THE MINDSET TO DEFEND.")}
            </span>
            <h1 id="home-title">
              {t("Understand.")}
              <br />
              {t("Build.")}
              <br />
              <span>{t("Outsmart.")}</span>
            </h1>
            <p>
              {t(
                "A hands-on space for cybersecurity and software development. Turn curiosity into working code, better questions, and stronger defenses.",
              )}
            </p>
            <div className="cv-hero-actions">
              <Link className="button button-primary" href="/playground">
                {t("Enter the playground")}
                <ArrowUpRight size={18} />
              </Link>
              <a className="cv-secondary-link" href="#explore">
                {t("Explore the platform")}
                <ArrowRight size={16} />
              </a>
            </div>
            <div className="cv-author">
              <Fingerprint size={28} />
              <div>
                <span>
                  {t("Built by")} {site.person}
                </span>
                <span>{t("Learn by doing. Share what you discover.")}</span>
              </div>
            </div>
          </div>
          <div className="cv-workspace">
            <div className="cv-workspace-caption">
              <span>
                <span className="status-dot" />{" "}
                {t("YOUR NEXT SKILL STARTS HERE")}
              </span>
              <span>{t("WORKSPACE / 01")}</span>
            </div>
            <PracticePreview />
            <div className="cv-workspace-note">
              <ShieldCheck size={15} />{" "}
              {t("Security exercises run against prepared sandbox data.")}
            </div>
          </div>
        </section>
        <div className="cv-stats container">
          <div>
            <strong>{lessonCount.toString().padStart(2, "0")}</strong>
            <span>{t("Hands-on lessons")}</span>
          </div>
          <div>
            <strong>{tracks.length.toString().padStart(2, "0")}</strong>
            <span>{t("Learning tracks")}</span>
          </div>
          <div>
            <Code2 size={26} />
            <span>{t("Code. Preview. Improve.")}</span>
          </div>
          <div>
            <ShieldCheck size={26} />
            <span>{t("Practice with purpose")}</span>
          </div>
        </div>
      </div>
      <div className="container">
        <section className="cv-section" id="explore">
          <div className="cv-section-intro">
            <div>
              <span className="eyebrow">{t("01 / THE PLAYGROUND")}</span>
              <h2>
                {t("Less watching.")}
                <br />
                <span>{t("More figuring it out.")}</span>
              </h2>
            </div>
            <p>
              {t(
                "Pick a path, work through a real exercise, and build understanding one lesson at a time.",
              )}
            </p>
          </div>
          <div className="gateway-grid">
            <CtfGateway />
            <MissionGateway />
            <StudioGateway />
          </div>
          <LearningCatalog tracks={tracks} />
        </section>
        <section className="cv-feature-band" aria-labelledby="method-title">
          <div>
            <span className="eyebrow">{t("THE CYBERVALUE METHOD")}</span>
            <h2 id="method-title">
              {t("Don’t just know the answer.")}
              <br />
              {t("Know why it works.")}
            </h2>
            <ArrowLink href="/about">
              {t("The thinking behind CyberValue")}
            </ArrowLink>
          </div>
          <ol>
            {[
              {
                icon: BookOpen,
                title: "Understand the system",
                text: "Start with the request, the data, and the trust boundary.",
              },
              {
                icon: Terminal,
                title: "Put it to the test",
                text: "Write the code. Inspect the response. Challenge your assumptions.",
              },
              {
                icon: ShieldCheck,
                title: "Make it stronger",
                text: "Connect each finding to the decision that prevents it.",
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
        {featured.length > 0 && (
          <section className="cv-section">
            <SectionHeading
              number="02"
              title={t("Built with intention")}
              href="/work"
              link={t("All work")}
            />
            <div className="entry-grid">
              {featured.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        )}
        <section className="cv-section" aria-labelledby="knowledge-title">
          <div className="cv-section-intro">
            <div>
              <span className="eyebrow">{t("THE KNOWLEDGE BASE")}</span>
              <h2 id="knowledge-title">{t("Follow your curiosity.")}</h2>
            </div>
            <ArrowLink href="/search">{t("Search the archive")}</ArrowLink>
          </div>
          <div className="cv-explore-grid">
            {[
              {
                href: "/work",
                icon: Code2,
                title: "Engineering",
                text: "Projects, architecture, and the decisions behind the build.",
                label: "Explore work",
              },
              {
                href: "/research",
                icon: Layers3,
                title: "Research & ideas",
                text: "Investigations into how systems behave and where trust breaks.",
                label: "Read the research",
              },
              {
                href: "/labs",
                icon: FlaskConical,
                title: "The field notebook",
                text: "Controlled experiments, methods, findings, and remediation.",
                label: "Browse lab writeups",
              },
              {
                href: "/resources",
                icon: BookOpen,
                title: "Your reference shelf",
                text: "Practical notes and resources to return to while you work.",
                label: "Explore resources",
              },
            ].map(({ href, icon: Icon, title, text, label }) => (
              <Link className="cv-explore-card" href={href} key={href}>
                <Icon size={24} strokeWidth={1.5} />
                <h3>{t(title)}</h3>
                <p>{t(text)}</p>
                <span>
                  {t(label)}
                  <ArrowUpRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        {recent.length > 0 && (
          <section className="cv-section">
            <SectionHeading
              number="↳"
              title={t("Fresh from the logbook")}
              href="/activity"
              link={t("All activity")}
            />
            <div className="cv-logbook">
              {recent.map((entry) => (
                <Link key={entry.id} href={contentUrl(entry)}>
                  <span className="cv-log-kind">
                    {t(
                      entry.kind === "PROJECT"
                        ? "Project"
                        : entry.kind === "LAB"
                          ? "Lab"
                          : entry.kind === "RESOURCE"
                            ? "Resource"
                            : entry.kind === "RESEARCH"
                              ? "Research"
                              : "CTF",
                    )}
                  </span>
                  <h3>{entry.title}</h3>
                  <span className="cv-log-date">
                    {entry.publishedAt && formatDate(entry.publishedAt, locale)}
                  </span>
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            </div>
          </section>
        )}
        <section className="cv-connect">
          <div className="cv-connect-symbol" aria-hidden="true">
            ↗
          </div>
          <div>
            <span className="eyebrow">
              {t("GOOD QUESTIONS LEAD TO GOOD WORK")}
            </span>
            <h2>
              {t("Let’s build something")}
              <br />
              {t("worth understanding.")}
            </h2>
            <p>
              {t(
                "Ideas, technical conversations, and thoughtful collaboration.",
              )}
            </p>
          </div>
          <div className="cv-connect-actions">
            <Link href="/about#connect" className="button button-primary">
              {t("Let’s connect")}
              <ArrowUpRight size={17} />
            </Link>
            {socials.length > 0 && (
              <div className="cv-socials">
                {socials.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    rel="me noopener noreferrer"
                  >
                    {social.platform}
                    <ArrowUpRight size={13} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
