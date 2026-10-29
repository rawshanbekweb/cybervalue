import { ProgressSync } from "@/components/playground/ProgressSync";
import { Logs } from "@/components/playground/logs/Logs";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Logs and artefacts · Academy Intermediate",
    "Read and grep a Linux auth.log until the break-in and the back door show, sort Windows event IDs and browser and system artefacts, and turn raw epoch numbers into one moment.",
    "/intermediate/logs",
  );

export default async function LogsPage() {
  await requireSection("intermediate", "logs");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/logs" />;
  return (
    <>
      <ProgressSync lab="logs" />
      <Logs />
    </>
  );
}
