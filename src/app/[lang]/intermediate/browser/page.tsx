import { ProgressSync } from "@/components/playground/ProgressSync";
import { BrowserRisks } from "@/components/playground/browser-risks/BrowserRisks";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Browser-side risks · Academy Intermediate",
    "See what a comment becomes when it is read as HTML, check link addresses, build a Content-Security-Policy, and stop a foreign site from sending a bank transfer in your name.",
    "/intermediate/browser",
  );

export default async function BrowserPage() {
  await requireSection("intermediate", "browser");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/browser" />;
  return (
    <>
      <ProgressSync lab="browser" />
      <BrowserRisks />
    </>
  );
}
