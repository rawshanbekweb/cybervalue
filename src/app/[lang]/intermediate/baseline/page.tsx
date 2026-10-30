import { ProgressSync } from "@/components/playground/ProgressSync";
import { Baseline } from "@/components/playground/baseline/Baseline";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Patching and baselines · Academy Intermediate",
    "See why unpatched flaws cause most breaches, put updates in order, automate them and check they took effect, learn what a baseline is, find drifted settings on a server, keep drift away and measure progress.",
    "/intermediate/baseline",
  );

export default async function BaselinePage() {
  await requireSection("intermediate", "baseline");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/baseline" />;
  return (
    <>
      <ProgressSync lab="baseline" />
      <Baseline />
    </>
  );
}
