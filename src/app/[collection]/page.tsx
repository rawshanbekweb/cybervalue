import { notFound } from "next/navigation";
import { collections, isCollection } from "@/lib/site";
import { metadata } from "@/lib/seo";
import { Archive, type SearchParams } from "@/components/archive";
import { Breadcrumbs } from "@/components/ui";

type Props = {
  params: Promise<{ collection: string }>;
  searchParams: Promise<SearchParams>;
};
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(collections).map((collection) => ({ collection }));
}
export async function generateMetadata({ params, searchParams }: Props) {
  const { collection } = await params;
  if (!isCollection(collection)) return {};
  const config = collections[collection];
  return metadata(
    config.title,
    config.description,
    `/${collection}`,
    Object.keys(await searchParams).length > 0,
  );
}
export default async function CollectionPage({ params, searchParams }: Props) {
  const { collection } = await params;
  if (!isCollection(collection)) notFound();
  const config = collections[collection];
  return (
    <div className="container page-content">
      <Breadcrumbs items={[{ label: config.title, href: `/${collection}` }]} />
      <header className="page-header">
        <span className="eyebrow">{config.eyebrow}</span>
        <h1>
          {config.title}
          <span style={{ color: "var(--accent)" }}>.</span>
        </h1>
        <p>{config.description}</p>
      </header>
      <Archive collection={collection} params={await searchParams} />
    </div>
  );
}
