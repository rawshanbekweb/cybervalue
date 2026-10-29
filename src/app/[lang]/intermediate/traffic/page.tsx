import { ProgressSync } from "@/components/playground/ProgressSync";
import { Traffic } from "@/components/playground/traffic/Traffic";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Traffic analysis · Academy Intermediate",
    "Read a capture line by line, write Wireshark display filters that pick out a port scan, pull a password out of a plain-HTTP stream, and find the infected host by its regular check-ins.",
    "/intermediate/traffic",
  );

export default async function TrafficPage() {
  await requireSection("intermediate", "traffic");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/traffic" />;
  return (
    <>
      <ProgressSync lab="traffic" />
      <Traffic />
    </>
  );
}
