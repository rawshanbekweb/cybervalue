import { ProgressSync } from "@/components/playground/ProgressSync";
import { Metadata } from "@/components/playground/metadata/Metadata";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Metadata · Academy Intermediate",
    "See what EXIF gives away, find the city a photo was taken in from its GPS tags, read a document’s author and template path, and strip the personal fields before publishing without breaking the picture.",
    "/intermediate/metadata",
  );

export default async function MetadataPage() {
  await requireSection("intermediate", "metadata");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/metadata" />;
  return (
    <>
      <ProgressSync lab="metadata" />
      <Metadata />
    </>
  );
}
