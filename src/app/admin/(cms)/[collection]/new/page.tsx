import { getAdminTranslator } from "@/lib/i18n/server";
import { notFound } from "next/navigation";
import { collections, isCollection } from "@/lib/site";
import { ContentForm } from "@/components/admin/content-form";
import { requireOwner } from "@/lib/auth";
import { availableResourceFiles, storedFileSelect } from "@/lib/stored-files";
import { getDb } from "@/lib/db";

export default async function NewContentPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const t = await getAdminTranslator();
  const { collection } = await params;
  if (!isCollection(collection)) notFound();
  await requireOwner(`/admin/${collection}/new`);
  const config = collections[collection];
  const resourceFiles =
    config.kind === "RESOURCE" ? await availableResourceFiles(getDb()) : [];
  const availableImages =
    (await getDb()?.storedFile.findMany({
      where: { kind: "IMAGE" },
      select: storedFileSelect,
      orderBy: { createdAt: "desc" },
      take: 200,
    })) ?? [];
  return (
    <div className="admin-page">
      <h1>{t("New {kind}", { kind: t(config.singular).toLowerCase() })}</h1>
      <ContentForm
        collection={collection}
        kind={config.kind}
        resourceFiles={resourceFiles}
        availableImages={availableImages}
      />
    </div>
  );
}
