import { ProgressSync } from "@/components/playground/ProgressSync";
import { Hardening } from "@/components/playground/hardening/Hardening";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Linux hardening · Academy Intermediate",
    "Shrink the attack surface, read permissions and special bits, find risky entries in an audit listing, keep sudo to least privilege, decide which services stay public, harden SSH, and set up updates, a firewall and logs.",
    "/intermediate/hardening",
  );

export default async function HardeningPage() {
  await requireSection("intermediate", "hardening");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/hardening" />
    );
  return (
    <>
      <ProgressSync lab="hardening" />
      <Hardening />
    </>
  );
}
