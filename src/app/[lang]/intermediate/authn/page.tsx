import { ProgressSync } from "@/components/playground/ProgressSync";
import { Authn } from "@/components/playground/authn/Authn";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Authentication · Academy Intermediate",
    "Sort the three factors, apply a modern password policy to six passwords, store passwords as slow salted hashes, rank MFA methods by phishing resistance, use SSH keys properly and watch sign-ins for spraying and impossible travel.",
    "/intermediate/authn",
  );

export default async function AuthnPage() {
  await requireSection("intermediate", "authn");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/authn" />;
  return (
    <>
      <ProgressSync lab="authn" />
      <Authn />
    </>
  );
}
