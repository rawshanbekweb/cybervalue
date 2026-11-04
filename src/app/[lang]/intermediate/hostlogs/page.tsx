import { ProgressSync } from "@/components/playground/ProgressSync";
import { HostLogs } from "@/components/playground/hostlogs/HostLogs";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Host logging and monitoring · Academy Intermediate",
    "Find where host logs live, triage server events, decide what to log, ship logs to a central store, write useful alerts and watch important files for changes.",
    "/intermediate/hostlogs",
  );

export default async function HostLogsPage() {
  await requireSection("intermediate", "hostlogs");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/hostlogs" />;
  return (
    <>
      <ProgressSync lab="hostlogs" />
      <HostLogs />
    </>
  );
}
