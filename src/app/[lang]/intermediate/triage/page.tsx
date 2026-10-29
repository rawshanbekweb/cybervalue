import { ProgressSync } from "@/components/playground/ProgressSync";
import { Triage } from "@/components/playground/triage/Triage";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Alert triage · Academy Intermediate",
    "Put alerts in order of priority, read an alert’s parts, work a queue of five alerts to escalate, close or tune, stay careful under pressure, write a clean escalation, and learn SOC tiers, playbooks and metrics.",
    "/intermediate/triage",
  );

export default async function TriagePage() {
  await requireSection("intermediate", "triage");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/triage" />;
  return (
    <>
      <ProgressSync lab="triage" />
      <Triage />
    </>
  );
}
