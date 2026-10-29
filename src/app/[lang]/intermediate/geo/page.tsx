import { ProgressSync } from "@/components/playground/ProgressSync";
import { Geo } from "@/components/playground/geo/Geo";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Images and location · Academy Intermediate",
    "Use reverse image search well, expose a years-old photo passed off as today’s, tell strong location clues from weak ones, read a street scene to the right city, work out the time from shadows and weather, treat metadata as a claim and refuse to locate private people.",
    "/intermediate/geo",
  );

export default async function GeoPage() {
  await requireSection("intermediate", "geo");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/geo" />;
  return (
    <>
      <ProgressSync lab="geo" />
      <Geo />
    </>
  );
}
