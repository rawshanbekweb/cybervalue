import { ProgressSync } from "@/components/playground/ProgressSync";
import { HttpsBasics } from "@/components/playground/https-basics/HttpsBasics";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "HTTPS and TLS · animated lab",
    "See what the padlock protects: eavesdropping on café Wi-Fi, encryption keys, the TLS handshake, certificates and the chain of trust, in animated lessons.",
    "/akademiya/https",
  );

export default async function HttpsPage() {
  await requireSection("academy", "https");
  return (
    <>
      <ProgressSync lab="https" />
      <HttpsBasics />
    </>
  );
}
