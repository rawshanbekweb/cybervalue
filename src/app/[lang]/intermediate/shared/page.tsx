import { ProgressSync } from "@/components/playground/ProgressSync";
import { Shared } from "@/components/playground/shared/Shared";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Shared responsibility · Academy Intermediate",
    "Tell IaaS from PaaS from SaaS, find the line between security of and in the cloud, split six layers between provider and customer, see why most cloud breaches are configuration mistakes and set up a new account on day one.",
    "/intermediate/shared",
  );

export default async function SharedPage() {
  await requireSection("intermediate", "shared");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/shared" />;
  return (
    <>
      <ProgressSync lab="shared" />
      <Shared />
    </>
  );
}
