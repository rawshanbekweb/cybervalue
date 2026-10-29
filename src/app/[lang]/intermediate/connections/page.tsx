import { ProgressSync } from "@/components/playground/ProgressSync";
import { Connections } from "@/components/playground/connections/Connections";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Secure connections · Academy Intermediate",
    "See how long a recorded Wi-Fi handshake holds out under WEP, WPA2 and WPA3, close every leak a VPN can have on café Wi-Fi, and decide when an SSH host key fingerprint should stop you.",
    "/intermediate/connections",
  );

export default async function ConnectionsPage() {
  await requireSection("intermediate", "connections");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/connections" />
    );
  return (
    <>
      <ProgressSync lab="connections" />
      <Connections />
    </>
  );
}
