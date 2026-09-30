import { getLocale, getTranslator } from "@/lib/i18n/server";
import Image from "next/image";
import { Download } from "lucide-react";
import type { Entry } from "@/lib/content";
import { safeLink, imagePath, resourcePath } from "@/lib/validation";
import { Markdown } from "./markdown";
import { ArrowLink, formatDate } from "./ui";
import { TechList } from "./tech-badge";

async function Section({ title, value }: { title: string; value: string }) {
  const t = await getTranslator();
  return (
    <section className="article-section">
      <h2>{t(title)}</h2>
      <Markdown>{value}</Markdown>
    </section>
  );
}
export async function ContentDetail({ entry }: { entry: Entry }) {
  const t = await getTranslator();
  const locale = await getLocale();
  const p = entry.project;
  const l = entry.lab;
  const c = entry.ctf;
  const r = entry.resource;
  return (
    <div className="article-layout">
      <div className="article-body">
        <Markdown>{entry.body}</Markdown>
        {p && (
          <>
            {[
              ["Problem", p.problem],
              ["Objective", p.objective],
              ["Architecture", p.architecture],
              ["Security considerations", p.securityConsiderations],
              ["Challenges", p.challenges],
              ["Solution", p.solution],
              ["Result", p.result],
              ["Lessons learned", p.lessonsLearned],
            ].map(([title, value]) => (
              <Section key={title} title={title} value={value} />
            ))}
          </>
        )}
        {l && (
          <>
            {[
              ["Objective", l.objective],
              ["Methodology", l.methodology],
              ["Discovery", l.discovery],
              ["Analysis", l.analysis],
              ["Impact", l.impact],
              ["Remediation", l.remediation],
              ["Lessons learned", l.lessonsLearned],
            ].map(([title, value]) => (
              <Section key={title} title={title} value={value} />
            ))}
          </>
        )}
        {c && (
          <>
            <section className="article-section">
              <h2>{t("Challenges solved")}</h2>
              <ul className="prose">
                {c.challengesSolved.map((challenge) => (
                  <li key={challenge}>{challenge}</li>
                ))}
              </ul>
            </section>
            <Section title={t("Lessons learned")} value={c.lessonsLearned} />
          </>
        )}
        {entry.images
          .filter((img) => imagePath.safeParse(img.path).success)
          .map((img) => (
            <Image
              className="article-image"
              key={img.id}
              src={img.path}
              unoptimized={img.path.startsWith("/media/")}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(max-width: 850px) 100vw, 800px"
            />
          ))}
        {!!entry.research?.references.length && (
          <section className="article-section references">
            <h2>{t("References")}</h2>
            <ul className="prose">
              {entry.research.references
                .filter((url) => safeLink(url))
                .map((url) => (
                  <li key={url}>
                    <a href={url} rel="noopener noreferrer">
                      {url}
                    </a>
                  </li>
                ))}
            </ul>
          </section>
        )}
      </div>
      <aside className="article-aside">
        <h2>{t("At a glance")}</h2>
        <dl>
          <div>
            <dt>{t("Author")}</dt>
            <dd>{entry.author.name}</dd>
          </div>
          {entry.category && (
            <div>
              <dt>{t("Category")}</dt>
              <dd>{entry.category.name}</dd>
            </div>
          )}
          {p && (
            <>
              <div>
                <dt>{t("Status")}</dt>
                <dd>{p.projectStatus}</dd>
              </div>
              <div>
                <dt>{t("Technologies")}</dt>
                <dd>
                  <TechList items={p.technologies} />
                </dd>
              </div>
            </>
          )}
          {l && (
            <>
              <div>
                <dt>{t("Environment")}</dt>
                <dd>{l.environment}</dd>
              </div>
              <div>
                <dt>{t("Difficulty")}</dt>
                <dd>{l.difficulty.toLowerCase()}</dd>
              </div>
              <div>
                <dt>{t("Tools")}</dt>
                <dd>
                  <TechList items={l.tools} />
                </dd>
              </div>
            </>
          )}
          {c && (
            <>
              <div>
                <dt>{t("Event")}</dt>
                <dd>{c.eventName}</dd>
              </div>
              <div>
                <dt>{t("Event date")}</dt>
                <dd>{formatDate(c.eventDate, locale)}</dd>
              </div>
              {c.location && (
                <div>
                  <dt>{t("Location")}</dt>
                  <dd>{c.location}</dd>
                </div>
              )}
              {c.placement && (
                <div>
                  <dt>{t("Placement")}</dt>
                  <dd>{c.placement}</dd>
                </div>
              )}
              <div>
                <dt>{t("Categories")}</dt>
                <dd>{c.categories.join(", ")}</dd>
              </div>
            </>
          )}
          {r && (
            <>
              <div>
                <dt>{t("Format")}</dt>
                <dd>{r.type}</dd>
              </div>
              <div>
                <dt>{t("Version")}</dt>
                <dd>{r.version}</dd>
              </div>
              <div>
                <dt>{t("Topic")}</dt>
                <dd>{r.topic}</dd>
              </div>
            </>
          )}
        </dl>
        {p && safeLink(p.repositoryUrl) && (
          <ArrowLink href={p.repositoryUrl!}>{t("View source code")}</ArrowLink>
        )}
        {p && safeLink(p.liveUrl) && (
          <ArrowLink href={p.liveUrl!}>{t("Visit the project")}</ArrowLink>
        )}
        {r && resourcePath.safeParse(r.filePath).success && (
          <a
            className="button button-primary"
            href={`/downloads/${entry.slug}`}
            download
          >
            <Download size={16} />
            {t("Download resource")}
          </a>
        )}
      </aside>
    </div>
  );
}
