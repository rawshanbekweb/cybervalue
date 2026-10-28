import { ProgressSync } from "@/components/playground/ProgressSync";
import { Symmetric } from "@/components/playground/symmetric/Symmetric";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Symmetric encryption · Academy Intermediate",
    "See a padlock picture show through ECB and vanish under CBC and CTR, read a secret message because a nonce was used twice, and stop a changed payment with an authentication tag.",
    "/intermediate/symmetric",
  );

export default async function SymmetricPage() {
  await requireSection("intermediate", "symmetric");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/symmetric" />
    );
  return (
    <>
      <ProgressSync lab="symmetric" />
      <Symmetric />
    </>
  );
}
