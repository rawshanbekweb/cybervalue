import { ProgressSync } from "@/components/playground/ProgressSync";
import { UntrustedInput } from "@/components/playground/untrusted-input/UntrustedInput";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Untrusted input · Academy Intermediate",
    "Break a login query with one quote, fix it with parameters, check file paths, write an allowlist and encode output for its context.",
    "/intermediate/input",
  );

export default async function InputPage() {
  await requireSection("intermediate", "input");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/input" />;
  return (
    <>
      <ProgressSync lab="input" />
      <UntrustedInput />
    </>
  );
}
