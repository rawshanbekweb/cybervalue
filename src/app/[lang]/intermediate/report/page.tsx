import { ProgressSync } from "@/components/playground/ProgressSync";
import { Report } from "@/components/playground/report/Report";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Writing the report · Academy Intermediate",
    "Give every reader the section they need, put a report in order, tell fact from opinion, build a finding with evidence and impact but no guesses or secrets, write recommendations people can act on, and hand the report over safely.",
    "/intermediate/report",
  );

export default async function ReportPage() {
  await requireSection("intermediate", "report");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/report" />;
  return (
    <>
      <ProgressSync lab="report" />
      <Report />
    </>
  );
}
