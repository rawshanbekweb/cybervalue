import { ProgressSync } from "@/components/playground/ProgressSync";
import { Firewall } from "@/components/playground/firewall/Firewall";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Firewalls and segmentation · Academy Intermediate",
    "Read an iptables rule, put a rule list in the right order with a default deny, see why replies need a stateful firewall, narrow a rule to one flow, and split a company network into zones.",
    "/intermediate/firewall",
  );

export default async function FirewallPage() {
  await requireSection("intermediate", "firewall");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/firewall" />;
  return (
    <>
      <ProgressSync lab="firewall" />
      <Firewall />
    </>
  );
}
