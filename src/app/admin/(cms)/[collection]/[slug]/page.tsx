import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { collections, isCollection } from "@/lib/site";
import { getAdminEntryBySlug } from "@/lib/content-write";
import { ContentForm } from "@/components/admin/content-form";
import { requireAdmin } from "@/lib/auth";
import { availableResourceFiles, storedFileSelect } from "@/lib/stored-files";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>;
}) {
  const { collection, slug } = await params;
  if (!isCollection(collection)) notFound();
  await requireAdmin(`/admin/${collection}/${slug}`);
  const config = collections[collection];
  const db = getDb();
  const entry = db ? await getAdminEntryBySlug(db, config.kind, slug) : null;
  if (!entry) notFound();
  const resourceFiles =
    config.kind === "RESOURCE" ? await availableResourceFiles(db) : [];
  const availableImages =
    (await db?.storedFile.findMany({
      where: { kind: "IMAGE" },
      select: storedFileSelect,
      orderBy: { createdAt: "desc" },
      take: 200,
    })) ?? [];

  return (
    <div className="admin-page">
      <h1>Edit {config.singular.toLowerCase()}</h1>
      <ContentForm
        collection={collection}
        kind={config.kind}
        entry={entry}
        resourceFiles={resourceFiles}
        availableImages={availableImages}
      />
    </div>
  );
}
