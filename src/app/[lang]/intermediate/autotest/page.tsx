import { ProgressSync } from "@/components/playground/ProgressSync";
import { AutoTest } from "@/components/playground/autotest/AutoTest";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Automated security testing · Academy Intermediate",
    "See why checks belong on every pull request, learn what SAST can and can’t see, triage findings, add dependency and secret scanning, probe a running site with DAST, place each check in the pipeline and decide what blocks a merge.",
    "/intermediate/autotest",
  );

export default async function AutoTestPage() {
  await requireSection("intermediate", "autotest");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/autotest" />;
  return (
    <>
      <ProgressSync lab="autotest" />
      <AutoTest />
    </>
  );
}
