import { NetworkLab } from "@/components/playground/network-lab/NetworkLab";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "IP addressing lab",
    "Learn IP addresses, subnet masks and gateways with clickable bits, a network simulator, automatically checked tasks and a subnet calculator.",
    "/playground/network-basics",
  );

export default function NetworkBasicsPage() {
  return <NetworkLab />;
}
