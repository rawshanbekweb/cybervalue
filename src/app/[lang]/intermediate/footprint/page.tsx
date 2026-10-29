import { ProgressSync } from "@/components/playground/ProgressSync";
import { Footprint } from "@/components/playground/footprint/Footprint";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Digital footprint · Academy Intermediate",
    "Tell active from passive traces, see how one username links every account, audit a student’s six public findings and decide what to hide, secure or keep, deal with breaches, fix privacy settings, ask for removal and plan what to do today and this month.",
    "/intermediate/footprint",
  );

export default async function FootprintPage() {
  await requireSection("intermediate", "footprint");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/footprint" />
    );
  return (
    <>
      <ProgressSync lab="footprint" />
      <Footprint />
    </>
  );
}
