import { NetworkLab } from "@/components/playground/network-lab/NetworkLab";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "IP addressing lab",
    "Learn IP addresses, subnet masks and gateways, then watch DHCP hand out addresses, DNS find a site’s IP and NAT share one public address, with a network simulator and a subnet calculator.",
    "/playground/network-basics",
  );

export default function NetworkBasicsPage() {
  return <NetworkLab />;
}
