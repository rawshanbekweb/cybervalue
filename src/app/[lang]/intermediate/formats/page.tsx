import { ProgressSync } from "@/components/playground/ProgressSync";
import { Formats } from "@/components/playground/formats/Formats";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Audio and file formats · Academy Intermediate",
    "Read binwalk output, find where a JPEG ends and the ZIP glued after it begins, see why polyglot files slip past filters, find a word drawn into a sound’s spectrogram, and pick the right tool for each search.",
    "/intermediate/formats",
  );

export default async function FormatsPage() {
  await requireSection("intermediate", "formats");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/formats" />;
  return (
    <>
      <ProgressSync lab="formats" />
      <Formats />
    </>
  );
}
