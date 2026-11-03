import { ProgressSync } from "@/components/playground/ProgressSync";
import { Manipulation } from "@/components/playground/manipulation/Manipulation";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Manipulation tactics · Academy Intermediate",
    "Recognise urgency, authority and fear, find the warning signs in a phishing email, handle phone pretexts, messenger scams and strangers at the door, and report quickly without blame.",
    "/intermediate/manipulation",
  );

export default async function ManipulationPage() {
  await requireSection("intermediate", "manipulation");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/manipulation" />
    );
  return (
    <>
      <ProgressSync lab="manipulation" />
      <Manipulation />
    </>
  );
}
