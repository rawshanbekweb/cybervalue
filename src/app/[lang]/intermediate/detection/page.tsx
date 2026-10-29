import { ProgressSync } from "@/components/playground/ProgressSync";
import { Detection } from "@/components/playground/detection/Detection";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Detection rules · Academy Intermediate",
    "Sort indicator, behaviour and anomaly rules, read a Sigma rule, build one for encoded PowerShell that catches every attack with no false alarms, set thresholds, tell false positives from misses, climb the pyramid of pain and keep rules tested.",
    "/intermediate/detection",
  );

export default async function DetectionPage() {
  await requireSection("intermediate", "detection");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/detection" />
    );
  return (
    <>
      <ProgressSync lab="detection" />
      <Detection />
    </>
  );
}
