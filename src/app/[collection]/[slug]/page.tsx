import { notFound } from "next/navigation";
import { collections, isCollection, contentUrl, site } from "@/lib/site";
import { getEntry, getRelated } from "@/lib/content";
import { slugSchema } from "@/lib/validation";
import { metadata } from "@/lib/seo";
import {
  Breadcrumbs,
  EntryCard,
  JsonLd,
  SectionHeading,
  formatDate,
} from "@/components/ui";
import { ContentDetail } from "@/components/content-detail";
import { getLocale, getTranslator } from "@/lib/i18n/server";

type Props = { params: Promise<{ collection: string; slug: string }> };
// Detail pages and their not-found responses depend on the locale cookie.
export const dynamic = "force-dynamic";
async function resolve(params: Props["params"]) {
  const { collection, slug } = await params;
  if (!isCollection(collection) || !slugSchema.safeParse(slug).success)
    notFound();
  const entry = await getEntry(collections[collection].kind, slug);
  if (!entry) notFound();
  return { entry, collection };
}
export async function generateMetadata({ params }: Props) {
  const { entry } = await resolve(params);
  const data = await metadata(
    entry.seoTitle ?? entry.title,
    entry.seoDescription ?? entry.summary,
    contentUrl(entry),
  );
  const image = `${contentUrl(entry)}/opengraph-image`;
  return {
    ...data,
    openGraph: {
      ...data.openGraph,
      type: "article" as const,
      publishedTime: entry.publishedAt!.toISOString(),
      modifiedTime: entry.updatedAt.toISOString(),
      authors: [entry.author.name],
      images: [{ url: image, width: 1200, height: 630, alt: entry.title }],
    },
    twitter: { ...data.twitter, images: [image] },
  };
}
export default async function EntryPage({ params }: Props) {
  const t = await getTranslator();
  const locale = await getLocale();
  const { entry, collection } = await resolve(params);
  const related = await getRelated(entry.id);
  return (
    <article className="container page-content">
      <Breadcrumbs
        items={[
          { label: collections[collection].title, href: `/${collection}` },
          { label: entry.title, href: contentUrl(entry) },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type":
            entry.kind === "RESEARCH" || entry.kind === "LAB"
              ? "TechArticle"
              : "CreativeWork",
          headline: entry.title,
          name: entry.title,
          description: entry.summary,
          url: `${site.url}${contentUrl(entry)}`,
          datePublished: entry.publishedAt!.toISOString(),
          dateModified: entry.updatedAt.toISOString(),
          author: {
            "@type": "Person",
            "@id": `${site.url}/about#person`,
            name: entry.author.name,
          },
          mainEntityOfPage: `${site.url}${contentUrl(entry)}`,
        }}
      />
      <header className="page-header article-header">
        <span className="eyebrow">
          {t(collections[collection].singular)}
          {entry.category ? ` / ${entry.category.name}` : ""}
        </span>
        <h1>{entry.title}</h1>
        <p>{entry.summary}</p>
        <div className="article-meta">
          <span>{t("By {author}", { author: entry.author.name })}</span>
          <time dateTime={entry.publishedAt!.toISOString()}>
            {formatDate(entry.publishedAt!, locale)}
          </time>
          <span>
            {t("Updated {date}", { date: formatDate(entry.updatedAt, locale) })}
          </span>
        </div>
        <div className="tags">
          {entry.tags.map((tag) => (
            <a key={tag.id} href={`/${collection}?tag=${tag.slug}`}>
              {tag.name}
            </a>
          ))}
        </div>
      </header>
      <ContentDetail entry={entry} />
      {related.length > 0 && (
        <section className="section">
          <SectionHeading number="↳" title="Follow the thread" />
          <div className="entry-grid">
            {related.map((e) => (
              <EntryCard key={e.id} entry={e} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
