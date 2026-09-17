import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { collections, isCollection } from "@/lib/site";
import { getAdminEntryBySlug } from "@/lib/content-write";
import { ContentForm } from "@/components/admin/content-form";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>;
}) {
  const { collection, slug } = await params;
  if (!isCollection(collection)) notFound();
  const config = collections[collection];
  const db = getDb();
  const entry = db ? await getAdminEntryBySlug(db, config.kind, slug) : null;
  if (!entry) notFound();

  return (
    <div className="admin-page">
      <h1>Edit {config.singular.toLowerCase()}</h1>
      <ContentForm collection={collection} kind={config.kind} entry={entry} />
    </div>
  );
}
