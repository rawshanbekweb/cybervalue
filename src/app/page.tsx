import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Crosshair,
  Code2,
  ShieldCheck,
  GitBranch,
} from "lucide-react";
import { SecurityDiagram } from "@/components/security-diagram";
import { HackerLanding } from "@/components/concept/HackerLanding";
import {
  SectionHeading,
  EntryCard,
  ArchiveTile,
  JsonLd,
  ArrowLink,
} from "@/components/ui";
import { getFeatured, getRecent, getSocials } from "@/lib/content";
import { metadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 60;
export const generateMetadata = () =>
  metadata(
    "CyberValue — Cybersecurity & Software Development",
    site.description,
    "/",
  );
export default async function Home() {
  const [featured, research, labs, ctf, resources, activity, socials] =
    await Promise.all([
      getFeatured(),
      getRecent(3, "RESEARCH"),
      getRecent(2, "LAB"),
      getRecent(2, "CTF"),
      getRecent(2, "RESOURCE"),
      getRecent(4),
      getSocials(),
    ]);
  return (
    <>
      <HackerLanding />
      <div className="container">
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
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="status-dot" />A PERSONAL PURSUIT OF BETTER
              SECURITY
            </div>
            <p className="hero-name">Rawshanbek Kayipbaev</p>
            <h1>
              Understand the risk.
              <br />
              Build something
              <br />
              <span>that stands up to it.</span>
            </h1>
            <p className="hero-description">
              Cybersecurity × Software Development.
              <br />
              Exploring application security, building with intention, and
              documenting the lessons along the way.
            </p>
            <div className="hero-actions">
              <Link href="/work" className="button button-primary">
                View my work
                <ArrowUpRight size={18} />
              </Link>
              <Link href="/research" className="button button-secondary">
                Explore research
                <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-footnote">
              <span className="short-line" />
              Real practice. Thoughtful engineering. Work you can verify.
            </div>
          </div>
          <SecurityDiagram />
        </section>
        <section className="focus-section" aria-labelledby="focus-heading">
          <div className="focus-label">
            <span className="eyebrow">
              <span className="status-dot" />
              The direction
            </span>
            <h2 id="focus-heading">Current focus</h2>
          </div>
          <div className="focus-item">
            <Crosshair size={20} />
            <div>
              <h3>Application security</h3>
              <p>Understand where trust breaks.</p>
            </div>
          </div>
          <div className="focus-item">
            <Code2 size={20} />
            <div>
              <h3>Secure development</h3>
              <p>Make security part of the build.</p>
            </div>
          </div>
          <div className="focus-item">
            <ShieldCheck size={20} />
            <div>
              <h3>Learning through practice</h3>
              <p>Test. Reflect. Document.</p>
            </div>
          </div>
        </section>
        <section className="section">
          <SectionHeading
            number="01"
            title="Selected work"
            href="/work"
            link="All work"
          />
          {featured.length ? (
            <div className="entry-grid">
              {featured.map((e) => (
                <EntryCard key={e.id} entry={e} />
              ))}
            </div>
          ) : (
            <div className="work-empty">
              <div className="empty-art" aria-hidden="true">
                <div className="code-window">
                  <span />
                  <span />
                  <span />
                  <GitBranch size={40} strokeWidth={1} />
                  <i />
                  <i />
                  <i />
                </div>
                <span className="art-corner">[ work in progress ]</span>
              </div>
              <div>
                <span className="eyebrow">An archive built on evidence</span>
                <h3>
                  The work comes first.
                  <br />
                  The case study follows.
                </h3>
                <p>
                  This is where projects will be documented: the problem, the
                  architecture, the security decisions, and what was learned.
                </p>
                <ArrowLink href="/work">Explore the work archive</ArrowLink>
              </div>
              <span className="empty-status">
                <span className="status-dot" />
                No featured projects yet
              </span>
            </div>
          )}
        </section>
        <section className="section">
          <SectionHeading
            number="02"
            title="From curiosity to understanding"
            href="/research"
            link="All research"
          />
          {research.length > 0 && (
            <div className="entry-grid recent-research">
              {research.map((e) => (
                <EntryCard key={e.id} entry={e} />
              ))}
            </div>
          )}
          <div className="archive-grid">
            <ArchiveTile collection="research" />
            <ArchiveTile collection="labs" />
            <ArchiveTile collection="ctf" />
          </div>
        </section>
        {labs.length > 0 && (
          <section className="section">
            <SectionHeading number="03" title="Latest labs" href="/labs" />
            <div className="entry-grid">
              {labs.map((e) => (
                <EntryCard entry={e} key={e.id} />
              ))}
            </div>
          </section>
        )}
        {ctf.length > 0 && (
          <section className="section">
            <SectionHeading number="04" title="CTF field notes" href="/ctf" />
            <div className="entry-grid">
              {ctf.map((e) => (
                <EntryCard entry={e} key={e.id} />
              ))}
            </div>
          </section>
        )}
        <section className="section lower-grid">
          <div>
            <SectionHeading
              number="05"
              title="The resource shelf"
              href="/resources"
              link="Browse"
            />
            {resources.length ? (
              resources.map((e) => <EntryCard key={e.id} entry={e} />)
            ) : (
              <div className="resource-preview">
                <span className="resource-symbol" aria-hidden="true">
                  ↳
                </span>
                <div>
                  <h3>Notes worth keeping close.</h3>
                  <p>
                    A growing home for technical references and downloadable
                    resources. The first resources will appear here when
                    published.
                  </p>
                  <ArrowLink href="/resources">Visit the library</ArrowLink>
                </div>
              </div>
            )}
          </div>
          <div>
            <SectionHeading
              number="06"
              title="In the logbook"
              href="/activity"
              link="All activity"
            />
            {activity.length ? (
              <ul className="activity-mini">
                {activity.map((e) => (
                  <li key={e.id}>
                    <span className="status-dot" />
                    <Link
                      href={`/${e.kind === "PROJECT" ? "work" : e.kind === "RESOURCE" ? "resources" : e.kind === "LAB" ? "labs" : e.kind.toLowerCase()}/${e.slug}`}
                    >
                      {e.title}
                      <ArrowUpRight size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="activity-empty">
                <span className="timeline-dot" />
                <div>
                  <span className="eyebrow">
                    A record, not a highlight reel
                  </span>
                  <h3>Progress leaves a trail.</h3>
                  <p>
                    New projects, findings, and writeups will appear here as
                    they are published.
                  </p>
                  <span className="mono muted">No published activity yet</span>
                </div>
              </div>
            )}
          </div>
        </section>
        <section className="philosophy">
          <span className="eyebrow">The CyberValue mindset</span>
          <p>
            Think like an attacker.
            <br />
            Build like a developer.
            <br />
            <span>Defend like a security engineer.</span>
          </p>
          <div className="philosophy-footer">
            <span>Always learning. Always questioning.</span>
            <ArrowLink href="/about">More about me</ArrowLink>
          </div>
        </section>
        <section className="connect-strip">
          <div>
            <span className="eyebrow">Keep the conversation going</span>
            <h2>Good work gets better when it’s shared.</h2>
          </div>
          <div className="social-links">
            {socials.length ? (
              socials.map((s) => (
                <a key={s.platform} href={s.url} rel="me noopener noreferrer">
                  {s.platform}
                  <ArrowUpRight size={16} />
                </a>
              ))
            ) : (
              <ArrowLink href="/about#connect">
                Connect with CyberValue
              </ArrowLink>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
