import { ProgressSync } from "@/components/playground/ProgressSync";
import { SecureCode } from "@/components/playground/securecode/SecureCode";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Secure coding · Academy Intermediate",
    "Decide which input to trust, see an allowlist stop what a denylist lets through, match five mistakes in a login handler to their fixes, handle errors and secrets safely and choose what goes in a log.",
    "/intermediate/securecode",
  );

export default async function SecureCodePage() {
  await requireSection("intermediate", "securecode");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/securecode" />
    );
  return (
    <>
      <ProgressSync lab="securecode" />
      <SecureCode />
    </>
  );
}
