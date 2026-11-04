import { ProgressSync } from "@/components/playground/ProgressSync";
import { Signing } from "@/components/playground/signing/Signing";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Signed software and updates · Academy Intermediate",
    "Check a file’s hash, read a code signature and its signer, judge downloads and updates, spot fake updates and see why signing alone can’t stop a compromised supplier.",
    "/intermediate/signing",
  );

export default async function SigningPage() {
  await requireSection("intermediate", "signing");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/signing" />;
  return (
    <>
      <ProgressSync lab="signing" />
      <Signing />
    </>
  );
}
