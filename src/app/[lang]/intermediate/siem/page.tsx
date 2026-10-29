import { ProgressSync } from "@/components/playground/ProgressSync";
import { Siem } from "@/components/playground/siem/Siem";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Logs and SIEM · Academy Intermediate",
    "Match each question to the log that answers it, map sshd, JSON and Windows lines onto one schema, keep clocks and copies straight, search across sources for a password-spraying attack, read a SIEM query, and keep dashboards and sources useful.",
    "/intermediate/siem",
  );

export default async function SiemPage() {
  await requireSection("intermediate", "siem");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/siem" />;
  return (
    <>
      <ProgressSync lab="siem" />
      <Siem />
    </>
  );
}
