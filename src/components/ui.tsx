import { getLocale, getTranslator } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  FolderCode,
  FlaskConical,
  ScanLine,
  Flag,
  FileDown,
  type LucideIcon,
} from "lucide-react";
import {
  collections,
  contentUrl,
  collectionFor,
  type Collection,
  site,
} from "@/lib/site";
import { safeJsonLd } from "@/lib/validation";
import type { Entry } from "@/lib/content";

export const icons: Record<Collection, LucideIcon> = {
  work: FolderCode,
  research: ScanLine,
  labs: FlaskConical,
  ctf: Flag,
  resources: FileDown,
};
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
export function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link className="text-link" href={href}>
      {children}
      <ArrowUpRight size={16} />
    </Link>
  );
}
export async function SectionHeading({
  number,
  title,
  href,
  link,
}: {
  number: string;
  title: string;
  href?: string;
  link?: string;
}) {
  const t = await getTranslator();
  return (
    <div className="section-heading">
      <div className="section-title">
        <span className="index-label">{number}</span>
        <h2>{t(title)}</h2>
      </div>
      {href && <ArrowLink href={href}>{t(link ?? "View all")}</ArrowLink>}
    </div>
  );
}
export async function EmptyState({
  collection,
  filtered = false,
}: {
  collection: Collection;
  filtered?: boolean;
}) {
  const t = await getTranslator();
  const item = collections[collection];
  const Icon = icons[collection];
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={27} strokeWidth={1.4} />
      </div>
      <span className="eyebrow">
        {filtered ? t("No matching entries") : t("An archive in the making")}
      </span>
      <h2>{filtered ? t("No results for these filters.") : t(item.empty)}</h2>
      <p>
        {filtered
          ? t(
              "Try a broader search or clear the filters to see all published entries.",
            )
          : t(item.detail)}
      </p>
      {filtered ? (
        <ArrowLink href={`/${collection}`}>{t("Clear filters")}</ArrowLink>
      ) : (
        <ArrowLink href="/about">{t("Get to know Rawshanbek")}</ArrowLink>
      )}
    </div>
  );
}
export async function EntryCard({ entry }: { entry: Entry }) {
  const t = await getTranslator();
  const locale = await getLocale();
  const collection = collectionFor(entry.kind);
  const Icon = icons[collection];
  return (
    <article className="entry-card">
      <div className="card-top">
        <span className={`kind-label kind-${collection}`}>
          <Icon size={15} />
          {t(collections[collection].singular)}
        </span>
        <span className="mono muted">
          {entry.publishedAt && formatDate(entry.publishedAt, locale)}
        </span>
      </div>
      <h3>
        <Link href={contentUrl(entry)}>
          {entry.title}
          <ArrowUpRight size={19} />
        </Link>
      </h3>
      <p>{entry.summary}</p>
      <div className="tags">
        {entry.tags.slice(0, 4).map((tag) => (
          <Link key={tag.id} href={`/${collection}?tag=${tag.slug}`}>
            {tag.name}
          </Link>
        ))}
      </div>
    </article>
  );
}
export function formatDate(date: Date, locale: Locale = "en") {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
export async function Breadcrumbs({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  const t = await getTranslator();
  const all = [{ label: "Home", href: "/" }, ...items].map((item) => ({
    ...item,
    label: t(item.label),
  }));
  return (
    <>
      <nav aria-label={t("Breadcrumb")} className="breadcrumbs">
        <ol>
          {all.map((item, i) => (
            <li key={item.href}>
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === all.length - 1 ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            item: `${site.url}${item.href}`,
          })),
        }}
      />
    </>
  );
}
export async function ArchiveTile({ collection }: { collection: Collection }) {
  const t = await getTranslator();
  const item = collections[collection];
  const Icon = icons[collection];
  return (
    <Link className={`archive-tile tile-${collection}`} href={`/${collection}`}>
      <div className="tile-top">
        <Icon size={24} strokeWidth={1.4} />
        <ArrowUpRight size={18} />
      </div>
      <div>
        <span className="eyebrow">{t(item.eyebrow)}</span>
        <h3>{t(item.title)}</h3>
        <p>{t(item.description)}</p>
      </div>
      <span className="tile-link">
        {t("Explore {collection}", { collection: t(item.title) })}
        <ArrowRight size={15} />
      </span>
    </Link>
  );
}
