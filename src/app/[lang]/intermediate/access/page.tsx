import { ProgressSync } from "@/components/playground/ProgressSync";
import { AccessControl } from "@/components/playground/access-control/AccessControl";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Access control · Academy Intermediate",
    "Open someone else’s order by changing a number and close the gap, forge a JWT and set the server up to refuse it, and choose a second factor that stops a fake sign-in page.",
    "/intermediate/access",
  );

export default async function AccessPage() {
  await requireSection("intermediate", "access");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/access" />;
  return (
    <>
      <ProgressSync lab="access" />
      <AccessControl />
    </>
  );
}
