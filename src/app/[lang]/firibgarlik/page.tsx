import { ProgressSync } from "@/components/playground/ProgressSync";
import { ScamSimulator } from "@/components/playground/scams/ScamSimulator";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Scam simulator",
    "Everyday scams from Uzbekistan on a pretend phone: decide what to do, find every red flag, and check a suspicious message of your own.",
    "/firibgarlik",
  );

export default async function ScamsPage() {
  await requireSection("scams");
  return (
    <>
      <ProgressSync lab="scams" />
      <ScamSimulator />
    </>
  );
}
