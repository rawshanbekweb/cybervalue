import { notFound } from "next/navigation";
import { collections, isCollection } from "@/lib/site";
import { ContentForm } from "@/components/admin/content-form";

export default async function NewContentPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  if (!isCollection(collection)) notFound();
  const config = collections[collection];
  return (
    <div className="admin-page">
      <h1>New {config.singular.toLowerCase()}</h1>
      <ContentForm collection={collection} kind={config.kind} />
    </div>
  );
}
