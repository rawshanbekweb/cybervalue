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
          description: site.description,
          author: { "@id": `${site.url}/about#person` },
        }}
      />
      <div className="cv-hero-wrap">
        <section className="cv-hero container" aria-labelledby="home-title">
          <div className="cv-hero-copy">
            <span className="cv-kicker">
              <span className="status-dot" /> THE CURIOSITY TO BUILD. THE
              MINDSET TO DEFEND.
            </span>
            <h1 id="home-title">
              Understand.
              <br />
              Build.
              <br />
              <span>Outsmart.</span>
            </h1>
            <p>
              A hands-on space for cybersecurity and software development. Turn
              curiosity into working code, better questions, and stronger
              defenses.
            </p>
            <div className="cv-hero-actions">
              <Link className="button button-primary" href="/playground">
                Enter the playground <ArrowUpRight size={18} />
              </Link>
              <a className="cv-secondary-link" href="#explore">
                Explore the platform <ArrowRight size={16} />
              </a>
            </div>
            <div className="cv-author">
              <Fingerprint size={28} />
              <div>
                <span>Built by {site.person}</span>
                <span>Learn by doing. Share what you discover.</span>
              </div>
            </div>
          </div>
          <div className="cv-workspace">
            <div className="cv-workspace-caption">
              <span>
                <span className="status-dot" /> YOUR NEXT SKILL STARTS HERE
              </span>
              <span>WORKSPACE / 01</span>
            </div>
            <PracticePreview />
            <div className="cv-workspace-note">
              <ShieldCheck size={15} /> Security exercises run against prepared
              sandbox data.
            </div>
          </div>
        </section>
        <div className="cv-stats container">
          <div>
            <strong>{lessonCount.toString().padStart(2, "0")}</strong>
            <span>Hands-on lessons</span>
          </div>
          <div>
            <strong>{tracks.length.toString().padStart(2, "0")}</strong>
            <span>Learning tracks</span>
          </div>
          <div>
            <Code2 size={26} />
            <span>Code. Preview. Improve.</span>
          </div>
          <div>
            <ShieldCheck size={26} />
            <span>Practice with purpose</span>
          </div>
        </div>
      </div>
      <div className="container">
        <section className="cv-section" id="explore">
          <div className="cv-section-intro">
            <div>
              <span className="eyebrow">01 / THE PLAYGROUND</span>
              <h2>
                Less watching.
                <br />
                <span>More figuring it out.</span>
              </h2>
            </div>
            <p>
              Pick a path, work through a real exercise, and build understanding
              one lesson at a time.
            </p>
          </div>
          <CtfGateway />
          <MissionGateway />
          <StudioGateway />
          <LearningCatalog tracks={tracks} />
        </section>
        <section className="cv-feature-band" aria-labelledby="method-title">
          <div>
            <span className="eyebrow">THE CYBERVALUE METHOD</span>
            <h2 id="method-title">
              Don’t just know the answer.
              <br />
              Know why it works.
            </h2>
            <ArrowLink href="/about">The thinking behind CyberValue</ArrowLink>
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
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        {featured.length > 0 && (
          <section className="cv-section">
            <SectionHeading
              number="02"
              title="Built with intention"
              href="/work"
              link="All work"
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
              <span className="eyebrow">THE KNOWLEDGE BASE</span>
              <h2 id="knowledge-title">Follow your curiosity.</h2>
            </div>
            <ArrowLink href="/search">Search the archive</ArrowLink>
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
                <h3>{title}</h3>
                <p>{text}</p>
                <span>
                  {label}
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
              title="Fresh from the logbook"
              href="/activity"
              link="All activity"
            />
            <div className="cv-logbook">
              {recent.map((entry) => (
                <Link key={entry.id} href={contentUrl(entry)}>
                  <span className="cv-log-kind">
                    {entry.kind.toLowerCase()}
                  </span>
                  <h3>{entry.title}</h3>
                  <span className="cv-log-date">
                    {entry.publishedAt && formatDate(entry.publishedAt)}
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
            <span className="eyebrow">GOOD QUESTIONS LEAD TO GOOD WORK</span>
            <h2>
              Let’s build something
              <br />
              worth understanding.
            </h2>
            <p>Ideas, technical conversations, and thoughtful collaboration.</p>
          </div>
          <div className="cv-connect-actions">
            <Link href="/about#connect" className="button button-primary">
              Let’s connect <ArrowUpRight size={17} />
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
