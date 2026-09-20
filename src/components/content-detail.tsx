import Image from "next/image";
import { Download } from "lucide-react";
import type { Entry } from "@/lib/content";
import { safeLink, imagePath, resourcePath } from "@/lib/validation";
import { Markdown } from "./markdown";
import { ArrowLink, formatDate } from "./ui";
import { TechList } from "./tech-badge";

function Section({ title, value }: { title: string; value: string }) {
  return (
    <section className="article-section">
      <h2>{title}</h2>
      <Markdown>{value}</Markdown>
    </section>
  );
}
export function ContentDetail({ entry }: { entry: Entry }) {
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
              <h2>Challenges solved</h2>
              <ul className="prose">
                {c.challengesSolved.map((challenge) => (
                  <li key={challenge}>{challenge}</li>
                ))}
              </ul>
            </section>
            <Section title="Lessons learned" value={c.lessonsLearned} />
          </>
        )}
        {entry.images
          .filter((img) => imagePath.safeParse(img.path).success)
          .map((img) => (
            <Image
              className="article-image"
              key={img.id}
              src={img.path}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(max-width: 850px) 100vw, 800px"
            />
          ))}
        {!!entry.research?.references.length && (
          <section className="article-section references">
            <h2>References</h2>
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
        <h2>At a glance</h2>
        <dl>
          <div>
            <dt>Author</dt>
            <dd>{entry.author.name}</dd>
          </div>
          {entry.category && (
            <div>
              <dt>Category</dt>
              <dd>{entry.category.name}</dd>
            </div>
          )}
          {p && (
            <>
              <div>
                <dt>Status</dt>
                <dd>{p.projectStatus}</dd>
              </div>
              <div>
                <dt>Technologies</dt>
                <dd>
                  <TechList items={p.technologies} />
                </dd>
              </div>
            </>
          )}
          {l && (
            <>
              <div>
                <dt>Environment</dt>
                <dd>{l.environment}</dd>
              </div>
              <div>
                <dt>Difficulty</dt>
                <dd>{l.difficulty.toLowerCase()}</dd>
              </div>
              <div>
                <dt>Tools</dt>
                <dd>
                  <TechList items={l.tools} />
                </dd>
              </div>
            </>
          )}
          {c && (
            <>
              <div>
                <dt>Event</dt>
                <dd>{c.eventName}</dd>
              </div>
              <div>
                <dt>Event date</dt>
                <dd>{formatDate(c.eventDate)}</dd>
              </div>
              {c.location && (
                <div>
                  <dt>Location</dt>
                  <dd>{c.location}</dd>
                </div>
              )}
              {c.placement && (
                <div>
                  <dt>Placement</dt>
                  <dd>{c.placement}</dd>
                </div>
              )}
              <div>
                <dt>Categories</dt>
                <dd>{c.categories.join(", ")}</dd>
              </div>
            </>
          )}
          {r && (
            <>
              <div>
                <dt>Format</dt>
                <dd>{r.type}</dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd>{r.version}</dd>
              </div>
              <div>
                <dt>Topic</dt>
                <dd>{r.topic}</dd>
              </div>
            </>
          )}
        </dl>
        {p && safeLink(p.repositoryUrl) && (
          <ArrowLink href={p.repositoryUrl!}>View source code</ArrowLink>
        )}
        {p && safeLink(p.liveUrl) && (
          <ArrowLink href={p.liveUrl!}>Visit the project</ArrowLink>
        )}
        {r && resourcePath.safeParse(r.filePath).success && (
          <a
            className="button button-primary"
            href={`/downloads/${entry.slug}`}
            download
          >
            <Download size={16} />
            Download resource
          </a>
        )}
      </aside>
    </div>
  );
}
