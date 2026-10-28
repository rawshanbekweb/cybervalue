import { ProgressSync } from "@/components/playground/ProgressSync";
import { ApiSecurity } from "@/components/playground/api-security/ApiSecurity";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "API security · Academy Intermediate",
    "Trim a reply that says too much, stop a request that makes itself an admin, check bodies against a schema, set a rate limit that stops a botnet but not a real user, and review an API against a checklist.",
    "/intermediate/api",
  );

export default async function ApiPage() {
  await requireSection("intermediate", "api");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/api" />;
  return (
    <>
      <ProgressSync lab="api" />
      <ApiSecurity />
    </>
  );
}
