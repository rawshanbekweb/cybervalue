import { ProgressSync } from "@/components/playground/ProgressSync";
import { Reporting } from "@/components/playground/reporting/Reporting";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Reporting incidents · Academy Intermediate",
    "Learn what counts as an incident, whom to tell and how fast, what belongs in a first report, how to keep evidence and how to write a blameless reporting procedure.",
    "/intermediate/reporting",
  );

export default async function ReportingPage() {
  await requireSection("intermediate", "reporting");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/reporting" />
    );
  return (
    <>
      <ProgressSync lab="reporting" />
      <Reporting />
    </>
  );
}
