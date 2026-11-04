import { ProgressSync } from "@/components/playground/ProgressSync";
import { Eol } from "@/components/playground/eol/Eol";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "End-of-life software · Academy Intermediate",
    "Keep a software inventory, spot what is out of support, read LTS dates, isolate what you can’t upgrade yet and plan upgrades ahead of time.",
    "/intermediate/eol",
  );

export default async function EolPage() {
  await requireSection("intermediate", "eol");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/eol" />;
  return (
    <>
      <ProgressSync lab="eol" />
      <Eol />
    </>
  );
}
