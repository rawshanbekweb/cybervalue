import { Fingerprint } from "lucide-react";
import { metadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { getSocials } from "@/lib/content";
import { ArrowLink, JsonLd } from "@/components/ui";

export const revalidate = 60;
export const generateMetadata = () =>
  metadata(
    "About Rawshanbek Gayipbaev",
    "Meet Rawshanbek Gayipbaev and the purpose behind CyberValue: application security, software development, and a portfolio grounded in real practice.",
    "/about",
  );
export default async function About() {
  const socials = await getSocials();
  return (
    <div className="container page-content">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": `${site.url}/about#person`,
          name: site.person,
          url: `${site.url}/about`,
          sameAs: socials.map((s) => s.url),
        }}
      />
      <header className="page-header">
        <span className="eyebrow">The person behind CyberValue</span>
        <h1>
          Rawshanbek
          <br />
          Gayipbaev<span style={{ color: "var(--accent)" }}>.</span>
        </h1>
        <p>Cybersecurity × Software Development × Real Practice</p>
      </header>
      <div className="about-grid">
        <div className="about-copy">
          <h2>A place for the work.</h2>
          <p>
            I’m Rawshanbek. CyberValue is my personal space for cybersecurity
            and software development: a place to document projects, investigate
            security questions, and keep a record of what I learn.
          </p>
          <p>
            The principle is simple: make the work visible. A useful case study
            explains the decisions. A useful lab shows the method. A useful
            finding includes evidence and a path to remediation.
          </p>
          <h2>What I’m focused on</h2>
          <p>
            Application security and secure development sit at the center of
            CyberValue. The direction is to connect an understanding of how
            applications break with the engineering decisions that help protect
            them.
          </p>
          <h2>Tools follow the problem</h2>
          <p>
            Technologies and tools will be documented alongside the projects and
            labs where they are used. Each entry is an opportunity to show how a
            decision worked in practice.
          </p>
          <h2>Looking forward</h2>
          <p>
            I’m building a professional record that can grow with the work:
            original research, authorized security experiments, software
            projects, and lessons from CTF participation.
          </p>
          <ArrowLink href="/work">Explore the work archive</ArrowLink>
        </div>
        <aside className="about-card">
          <Fingerprint size={48} strokeWidth={1.2} />
          <span className="eyebrow">The guiding principle</span>
          <h2>Evidence over claims.</h2>
          <p>CyberValue grows one documented piece of work at a time.</p>
          <ul>
            <li>Think like an attacker.</li>
            <li>Build like a developer.</li>
            <li>Defend like a security engineer.</li>
          </ul>
          <div className="about-connect" id="connect">
            <span className="eyebrow">Around the web</span>
            {socials.length ? (
              <div className="social-links" style={{ marginTop: 18 }}>
                {socials.map((s) => (
                  <a key={s.platform} href={s.url} rel="me noopener noreferrer">
                    {s.platform} ↗
                  </a>
                ))}
              </div>
            ) : (
              <p>
                Verified professional and social links will be added here. In
                the meantime, explore the archive to follow the work.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
