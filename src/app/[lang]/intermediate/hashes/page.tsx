import { ProgressSync } from "@/components/playground/ProgressSync";
import { Hashes } from "@/components/playground/hashes/Hashes";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Hashes and passwords · Academy Intermediate",
    "Crack a leaked password table with a ready-made list and stop it with a salt, pick a bcrypt cost that slows a graphics card for years but not a user, and stop a forged payment webhook with HMAC.",
    "/intermediate/hashes",
  );

export default async function HashesPage() {
  await requireSection("intermediate", "hashes");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/hashes" />;
  return (
    <>
      <ProgressSync lab="hashes" />
      <Hashes />
    </>
  );
}
