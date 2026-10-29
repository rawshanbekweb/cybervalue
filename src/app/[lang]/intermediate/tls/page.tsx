import { ProgressSync } from "@/components/playground/ProgressSync";
import { Tls } from "@/components/playground/tls/Tls";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "TLS and certificates · Academy Intermediate",
    "Fix a server until the browser trusts its certificate, raise a TLS setup to an A+, and stop SSL stripping on a café Wi-Fi with HSTS and the preload list.",
    "/intermediate/tls",
  );

export default async function TlsPage() {
  await requireSection("intermediate", "tls");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/tls" />;
  return (
    <>
      <ProgressSync lab="tls" />
      <Tls />
    </>
  );
}
