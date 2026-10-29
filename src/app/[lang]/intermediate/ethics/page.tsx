import { ProgressSync } from "@/components/playground/ProgressSync";
import { Ethics } from "@/components/playground/ethics/Ethics";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Ethics and law · Academy Intermediate",
    "Tell open sources from stolen or private ones, learn what personal-data and computer-crime law expect, check seven research actions against a signed authorisation, tell passive from active reconnaissance, avoid harm, protect yourself and record findings so they can be checked.",
    "/intermediate/ethics",
  );

export default async function EthicsPage() {
  await requireSection("intermediate", "ethics");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/ethics" />;
  return (
    <>
      <ProgressSync lab="ethics" />
      <Ethics />
    </>
  );
}
