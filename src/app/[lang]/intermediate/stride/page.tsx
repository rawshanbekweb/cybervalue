import { ProgressSync } from "@/components/playground/ProgressSync";
import { Stride } from "@/components/playground/stride/Stride";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Threat modelling · Academy Intermediate",
    "Learn the four questions, draw a data-flow diagram, find the flows that cross trust boundaries in a school grades app, sort six threats into STRIDE, pick controls and decide what to fix first.",
    "/intermediate/stride",
  );

export default async function StridePage() {
  await requireSection("intermediate", "stride");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/stride" />;
  return (
    <>
      <ProgressSync lab="stride" />
      <Stride />
    </>
  );
}
