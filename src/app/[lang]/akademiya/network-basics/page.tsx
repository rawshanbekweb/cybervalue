import { ProgressSync } from "@/components/playground/ProgressSync";
import { requireSection } from "@/lib/site-config-server";
import { NetworkLab } from "@/components/playground/network-lab/NetworkLab";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "IP addressing lab",
    "Learn IP addresses, masks and gateways, then see DHCP, DNS and NAT at work in a network simulator, with checkpoint tests.",
    "/akademiya/network-basics",
  );

export default async function NetworkBasicsPage() {
  await requireSection("academy", "network");
  return (
    <>
      <ProgressSync lab="network" />
      <NetworkLab />
    </>
  );
}
