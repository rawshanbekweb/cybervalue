import { ProgressSync } from "@/components/playground/ProgressSync";
import { PublicKey } from "@/components/playground/public-key/PublicKey";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Public-key cryptography · Academy Intermediate",
    "Agree a key with Diffie–Hellman while Eve listens, build an RSA key from two primes and see it factored, and stop a man in the middle with a signed public value.",
    "/intermediate/pubkey",
  );

export default async function PubkeyPage() {
  await requireSection("intermediate", "pubkey");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/pubkey" />;
  return (
    <>
      <ProgressSync lab="pubkey" />
      <PublicKey />
    </>
  );
}
