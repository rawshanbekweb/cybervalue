import { ProgressSync } from "@/components/playground/ProgressSync";
import { Lsb } from "@/components/playground/lsb/Lsb";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Inside images · Academy Intermediate",
    "See which bit of a colour can change unseen, read a message out of the red LSBs of a row of pixels, work out how much a picture can carry, and find a word in an image by looking at one bit plane at a time.",
    "/intermediate/lsb",
  );

export default async function LsbPage() {
  await requireSection("intermediate", "lsb");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/lsb" />;
  return (
    <>
      <ProgressSync lab="lsb" />
      <Lsb />
    </>
  );
}
