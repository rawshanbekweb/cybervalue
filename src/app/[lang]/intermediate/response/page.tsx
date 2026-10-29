import { ProgressSync } from "@/components/playground/ProgressSync";
import { IncidentResponse } from "@/components/playground/response/Response";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Incident response · Academy Intermediate",
    "Sort the work of the NIST lifecycle, rank incidents by impact and urgency, contain ransomware without destroying evidence or tipping off the attacker, and run a blameless lessons-learned review.",
    "/intermediate/response",
  );

export default async function ResponsePage() {
  await requireSection("intermediate", "response");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/response" />;
  return (
    <>
      <ProgressSync lab="response" />
      <IncidentResponse />
    </>
  );
}
