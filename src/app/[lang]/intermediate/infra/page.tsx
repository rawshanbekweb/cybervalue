import { ProgressSync } from "@/components/playground/ProgressSync";
import { Infra } from "@/components/playground/infra/Infra";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Domains and infrastructure · Academy Intermediate",
    "Read a WHOIS record, sort what DNS records reveal, work out a company’s mail and shop providers and spot a dangling record, turn certificate logs into a subdomain list and flag exposed build servers, use ASNs and passive scanners, respect third-party ownership and assemble the map.",
    "/intermediate/infra",
  );

export default async function InfraPage() {
  await requireSection("intermediate", "infra");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/infra" />;
  return (
    <>
      <ProgressSync lab="infra" />
      <Infra />
    </>
  );
}
