import { ProgressSync } from "@/components/playground/ProgressSync";
import { Personal } from "@/components/playground/personal/Personal";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Personal protection · Academy Intermediate",
    "Use a password manager and long passphrases, turn on MFA, fix risky habits, keep devices updated, back up with 3-2-1 and make a personal security plan.",
    "/intermediate/personal",
  );

export default async function PersonalPage() {
  await requireSection("intermediate", "personal");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/personal" />;
  return (
    <>
      <ProgressSync lab="personal" />
      <Personal />
    </>
  );
}
