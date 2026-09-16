import { notFound } from "next/navigation";
import { getEntry } from "@/lib/content";
import { collections, isCollection } from "@/lib/site";
import { slugSchema } from "@/lib/validation";
import { ogImage } from "@/lib/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 60;
export default async function Image({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>;
}) {
  const { collection, slug } = await params;
  if (!isCollection(collection) || !slugSchema.safeParse(slug).success)
    notFound();
  const entry = await getEntry(collections[collection].kind, slug);
  if (!entry) notFound();
  return ogImage(entry.title, collections[collection].singular.toUpperCase());
}
