import { notFound } from "next/navigation";
import { getEntry } from "@/lib/content";
import { collections, isCollection } from "@/lib/site";
import { slugSchema } from "@/lib/validation";
import { ogImage } from "@/lib/og";
import { resolveLocale } from "@/lib/i18n";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 60;
// Rendered on first request, then cached like the entry page itself.
export function generateStaticParams() {
  return [];
}
export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; collection: string; slug: string }>;
}) {
  const { lang, collection, slug } = await params;
  if (!isCollection(collection) || !slugSchema.safeParse(slug).success)
    notFound();
  const entry = await getEntry(
    collections[collection].kind,
    slug,
    resolveLocale(lang),
  );
  if (!entry) notFound();
  return ogImage(entry.title, collections[collection].singular.toUpperCase());
}
