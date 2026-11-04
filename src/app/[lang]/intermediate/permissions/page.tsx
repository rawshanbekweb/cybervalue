import { ProgressSync } from "@/components/playground/ProgressSync";
import { Permissions } from "@/components/playground/permissions/Permissions";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "App permissions and sandboxing · Academy Intermediate",
    "See how sandboxes keep apps apart, judge permission requests, choose browser extensions carefully, work in a standard account and review permissions regularly.",
    "/intermediate/permissions",
  );

export default async function PermissionsPage() {
  await requireSection("intermediate", "permissions");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/permissions" />
    );
  return (
    <>
      <ProgressSync lab="permissions" />
      <Permissions />
    </>
  );
}
