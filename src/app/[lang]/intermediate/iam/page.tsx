import { ProgressSync } from "@/components/playground/ProgressSync";
import { Iam } from "@/components/playground/iam/Iam";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Identity and access · Academy Intermediate",
    "Tell people from workloads, read a policy, evaluate six requests with default and explicit deny, write least-privilege policies, prefer roles and temporary keys, lock down the root account and review access regularly.",
    "/intermediate/iam",
  );

export default async function IamPage() {
  await requireSection("intermediate", "iam");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/iam" />;
  return (
    <>
      <ProgressSync lab="iam" />
      <Iam />
    </>
  );
}
