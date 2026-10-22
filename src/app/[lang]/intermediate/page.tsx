import Link from "next/link";
import { ArrowLeft, Compass, Layers, Route } from "lucide-react";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { metadata } from "@/lib/seo";
import { requireSection } from "@/lib/site-config-server";
import {
  BEGINNER_LABS,
  DOMAINS,
  PATHS,
  PHASES,
} from "@/lib/intermediate/roadmap";
import { intermediateAccess } from "@/lib/intermediate/access";
import { IntermediateAccessCard } from "@/components/intermediate-access";
import "@/components/learning.css";
import "@/components/intermediate.css";

export const generateMetadata = () =>
  metadata(
    "Academy Intermediate",
    "The second Academy level: web application security, cryptography, network security, forensics, steganography, OSINT and more. The roadmap is public; the labs open to students placed at the Intermediate level.",
    "/intermediate",
  );

// Academy Intermediate: the public roadmap of the second level, and the way
// into its labs. Domains are filled in phase by phase; until then this page
// shows what each one will teach.
export default async function IntermediatePage() {
  await requireSection("intermediate");
  const t = await getTranslator();
  const locale = await getLocale();
  const access = await intermediateAccess();
  const first = DOMAINS.flatMap((d) => d.modules).find((m) => m.href);
  const modules = DOMAINS.reduce((n, d) => n + d.modules.length, 0);
  const title = (id: string) =>
    DOMAINS.find((d) => d.id === id)?.title[locale] ?? id;
  return (
    <div className="container page-content">
      <Link className="text-link" href="/">
        <ArrowLeft size={16} aria-hidden="true" /> {t("Home")}
      </Link>
      <header className="page-header learning-header">
        <span className="eyebrow">
          <span className="status-dot" /> ACADEMY INTERMEDIATE
        </span>
        <h1>
          {t("The next level.")}
          <br />
          <span>{t("The Intermediate roadmap.")}</span>
        </h1>
        <p>
          {t(
            "After the beginner labs comes the second level. It is split into cybersecurity domains, each with its own modules. Domains open phase by phase; this page shows the whole plan.",
          )}
        </p>
        <div className="learning-highlights">
          <span>
            <Layers size={16} aria-hidden="true" />{" "}
            {t("{count} domains", { count: DOMAINS.length })}
          </span>
          <span>
            <Compass size={16} aria-hidden="true" />{" "}
            {t("{count} modules", { count: modules })}
          </span>
          <span>
            <Route size={16} aria-hidden="true" />{" "}
            {t("{count} career paths", { count: PATHS.length })}
          </span>
        </div>
      </header>

      <IntermediateAccessCard
        access={access}
        t={t}
        path="/intermediate"
        start={
          first?.href
            ? {
                href: first.href,
                label: t("Open {lab}", { lab: first.title[locale] }),
              }
            : undefined
        }
      />

      <section className="im-rules" aria-labelledby="im-rules">
        <h2 id="im-rules">{t("How the Intermediate level works")}</h2>
        <ul>
          <li>
            {t(
              "Every module has short lessons, a hands-on lab in an isolated browser sandbox and a checkpoint test.",
            )}
          </li>
          <li>
            {t(
              "Practice happens only on the academy's own training systems. Testing anything you do not own or have written permission for is against the law.",
            )}
          </li>
          <li>
            {t(
              "Each domain lists the beginner labs to finish first, so you always know where to start.",
            )}
          </li>
        </ul>
      </section>

      {PHASES.map((phase) => (
        <section
          key={phase.phase}
          className="im-phase"
          aria-labelledby={`im-phase-${phase.phase}`}
        >
          <h2 id={`im-phase-${phase.phase}`} className="learning-section-title">
            {phase.title[locale]}
          </h2>
          <p className="im-phase-about">{phase.about[locale]}</p>
          <div className="im-domains">
            {DOMAINS.filter((d) => d.phase === phase.phase).map((domain) => (
              <article
                key={domain.id}
                id={domain.id}
                className="im-domain"
                aria-labelledby={`im-${domain.id}`}
              >
                <div className="im-domain-head">
                  <span className="im-tag">{domain.short}</span>
                  <span
                    className={`im-status ${domain.modules.some((m) => m.href) ? "open" : ""}`}
                  >
                    {domain.modules.some((m) => m.href)
                      ? t("Open now")
                      : t("Planned")}
                  </span>
                </div>
                <h3 id={`im-${domain.id}`}>{domain.title[locale]}</h3>
                <p>{domain.summary[locale]}</p>
                {domain.needs.length > 0 && (
                  <p className="im-needs">
                    {t("Start after:")}{" "}
                    {domain.needs
                      .map((id) => BEGINNER_LABS[id][locale])
                      .join(", ")}
                  </p>
                )}
                <details open={domain.modules.some((m) => m.href)}>
                  <summary>
                    {t("{count} modules", { count: domain.modules.length })}
                  </summary>
                  <ol className="im-modules">
                    {domain.modules.map((m) => (
                      <li key={m.title.en}>
                        <strong>
                          {m.href ? (
                            <Link href={m.href}>{m.title[locale]} →</Link>
                          ) : (
                            m.title[locale]
                          )}
                        </strong>
                        <span className="im-topics">
                          {m.topics.join(" · ")}
                        </span>
                        <span>{m.goal[locale]}</span>
                      </li>
                    ))}
                  </ol>
                </details>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="im-paths" aria-labelledby="im-paths">
        <h2 id="im-paths" className="learning-section-title">
          {t("Career paths")}
        </h2>
        <div className="im-path-grid">
          {PATHS.map((path) => (
            <div key={path.title.en} className="im-path">
              <h3>{path.title[locale]}</h3>
              <ol>
                {path.domains.map((id) => (
                  <li key={id}>
                    <a href={`#${id}`}>{title(id)}</a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
