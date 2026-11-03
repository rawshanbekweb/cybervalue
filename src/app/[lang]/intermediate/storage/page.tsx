import { ProgressSync } from "@/components/playground/ProgressSync";
import { Storage } from "@/components/playground/storage/Storage";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Storage and secrets · Academy Intermediate",
    "Find the buckets that leak data, encrypt at rest and in transit, keep secrets in a secrets manager, rotate keys safely and keep versioned backups somewhere else.",
    "/intermediate/storage",
  );

export default async function StoragePage() {
  await requireSection("intermediate", "storage");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/storage" />;
  return (
    <>
      <ProgressSync lab="storage" />
      <Storage />
    </>
  );
}
