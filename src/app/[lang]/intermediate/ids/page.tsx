import { ProgressSync } from "@/components/playground/ProgressSync";
import { Ids } from "@/components/playground/ids/Ids";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Intrusion detection · Academy Intermediate",
    "Read a Suricata rule, make a content match catch encoded path traversal, tune a brute-force threshold for a slow bot, triage alerts, and see why a tiny false-positive rate buries real attacks.",
    "/intermediate/ids",
  );

export default async function IdsPage() {
  await requireSection("intermediate", "ids");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/ids" />;
  return (
    <>
      <ProgressSync lab="ids" />
      <Ids />
    </>
  );
}
