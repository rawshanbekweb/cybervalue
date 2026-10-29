import { ProgressSync } from "@/components/playground/ProgressSync";
import { Evidence } from "@/components/playground/evidence/Evidence";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Handling evidence · Academy Intermediate",
    "Collect the most volatile evidence first, take a disk image that stands up in court, check copies against the acquisition hash, and find the gap in a chain of custody.",
    "/intermediate/evidence",
  );

export default async function EvidencePage() {
  await requireSection("intermediate", "evidence");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/evidence" />;
  return (
    <>
      <ProgressSync lab="evidence" />
      <Evidence />
    </>
  );
}
