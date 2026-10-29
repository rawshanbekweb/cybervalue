import { ProgressSync } from "@/components/playground/ProgressSync";
import { Phishing } from "@/components/playground/phishing/Phishing";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Phishing analysis · Academy Intermediate",
    "Sort the signs of phishing, read an email’s headers, trace a fake bank email to its first server and its real reply address, interpret SPF, DKIM and DMARC, unmask six links, rank attachments by risk and respond once the verdict is in.",
    "/intermediate/phishing",
  );

export default async function PhishingPage() {
  await requireSection("intermediate", "phishing");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/phishing" />;
  return (
    <>
      <ProgressSync lab="phishing" />
      <Phishing />
    </>
  );
}
