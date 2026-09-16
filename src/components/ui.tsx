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
export function SectionHeading({
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
  return (
    <div className="section-heading">
      <div className="section-title">
        <span className="index-label">{number}</span>
        <h2>{title}</h2>
      </div>
      {href && <ArrowLink href={href}>{link ?? "View all"}</ArrowLink>}
    </div>
  );
}
export function EmptyState({
  collection,
  filtered = false,
}: {
  collection: Collection;
  filtered?: boolean;
}) {
  const item = collections[collection];
  const Icon = icons[collection];
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={27} strokeWidth={1.4} />
      </div>
      <span className="eyebrow">
        {filtered ? "No matching entries" : "An archive in the making"}
      </span>
      <h2>{filtered ? "No results for these filters." : item.empty}</h2>
      <p>
        {filtered
          ? "Try a broader search or clear the filters to see all published entries."
          : item.detail}
      </p>
      {filtered ? (
        <ArrowLink href={`/${collection}`}>Clear filters</ArrowLink>
      ) : (
        <ArrowLink href="/about">Get to know Rawshanbek</ArrowLink>
      )}
    </div>
  );
}
export function EntryCard({ entry }: { entry: Entry }) {
  const collection = collectionFor(entry.kind);
  const Icon = icons[collection];
  return (
    <article className="entry-card">
      <div className="card-top">
        <span className={`kind-label kind-${collection}`}>
          <Icon size={15} />
          {collections[collection].singular}
        </span>
        <span className="mono muted">
          {entry.publishedAt && formatDate(entry.publishedAt)}
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
export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumbs">
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
export function ArchiveTile({ collection }: { collection: Collection }) {
  const item = collections[collection];
  const Icon = icons[collection];
  return (
    <Link className={`archive-tile tile-${collection}`} href={`/${collection}`}>
      <div className="tile-top">
        <Icon size={24} strokeWidth={1.4} />
        <ArrowUpRight size={18} />
      </div>
      <div>
        <span className="eyebrow">{item.eyebrow}</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <span className="tile-link">
        Explore {item.title.toLowerCase()}
        <ArrowRight size={15} />
      </span>
    </Link>
  );
}
