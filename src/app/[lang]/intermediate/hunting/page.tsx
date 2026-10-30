import { ProgressSync } from "@/components/playground/ProgressSync";
import { Hunting } from "@/components/playground/hunting/Hunting";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Threat hunting · Academy Intermediate",
    "Tell hunting from alert handling, write testable hypotheses, map a threat report onto the ATT&CK matrix, read a technique’s page, stack scheduled tasks across forty computers to find the rogue one, share indicators safely and close a hunt properly.",
    "/intermediate/hunting",
  );

export default async function HuntingPage() {
  await requireSection("intermediate", "hunting");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/hunting" />;
  return (
    <>
      <ProgressSync lab="hunting" />
      <Hunting />
    </>
  );
}
