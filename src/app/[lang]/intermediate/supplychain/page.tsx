import { ProgressSync } from "@/components/playground/ProgressSync";
import { SupplyChain } from "@/components/playground/supplychain/SupplyChain";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Dependencies and supply chain · Academy Intermediate",
    "Tell direct from transitive dependencies, read versions and the lockfile, check a lockfile against advisories, catch look-alike package names, see how packages get poisoned, use an SBOM and decide what to update when.",
    "/intermediate/supplychain",
  );

export default async function SupplyChainPage() {
  await requireSection("intermediate", "supplychain");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/supplychain" />
    );
  return (
    <>
      <ProgressSync lab="supplychain" />
      <SupplyChain />
    </>
  );
}
