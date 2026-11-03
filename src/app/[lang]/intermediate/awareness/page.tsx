import { ProgressSync } from "@/components/playground/ProgressSync";
import { Awareness } from "@/components/playground/awareness/Awareness";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Awareness programmes · Academy Intermediate",
    "Pick awareness topics by risk, spot plan choices that backfire, run fair phishing simulations, measure reporting rather than clicks and build a blameless culture.",
    "/intermediate/awareness",
  );

export default async function AwarenessPage() {
  await requireSection("intermediate", "awareness");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/awareness" />
    );
  return (
    <>
      <ProgressSync lab="awareness" />
      <Awareness />
    </>
  );
}
