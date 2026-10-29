import { ProgressSync } from "@/components/playground/ProgressSync";
import { TcpIp } from "@/components/playground/tcpip/TcpIp";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "TCP/IP in depth · Academy Intermediate",
    "Work out the sequence and acknowledgement numbers of a TCP handshake, read a port scan, see how ICMP and SYN floods work, and push the odds of poisoning a DNS cache below one in a thousand.",
    "/intermediate/tcpip",
  );

export default async function TcpIpPage() {
  await requireSection("intermediate", "tcpip");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/tcpip" />;
  return (
    <>
      <ProgressSync lab="tcpip" />
      <TcpIp />
    </>
  );
}
