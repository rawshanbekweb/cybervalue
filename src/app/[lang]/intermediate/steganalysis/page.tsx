import { ProgressSync } from "@/components/playground/ProgressSync";
import { Steganalysis } from "@/components/playground/steganalysis/Steganalysis";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Steganalysis · Academy Intermediate",
    "Sort strong signs of hiding from ordinary quirks, spot the even value pairs LSB embedding leaves in a histogram, learn what statistical tests can and can’t say, pick the right tool for each suspect file, and read zsteg output.",
    "/intermediate/steganalysis",
  );

export default async function SteganalysisPage() {
  await requireSection("intermediate", "steganalysis");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/steganalysis" />
    );
  return (
    <>
      <ProgressSync lab="steganalysis" />
      <Steganalysis />
    </>
  );
}
