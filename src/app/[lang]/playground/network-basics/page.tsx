import { NetworkLab } from "@/components/playground/network-lab/NetworkLab";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "IP addressing lab",
    "Learn IP addresses, masks and gateways, then see DHCP, DNS and NAT at work in a network simulator, with checkpoint tests.",
    "/playground/network-basics",
  );

export default function NetworkBasicsPage() {
  return <NetworkLab />;
}
