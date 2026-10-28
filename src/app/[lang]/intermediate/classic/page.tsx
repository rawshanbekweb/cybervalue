import { ProgressSync } from "@/components/playground/ProgressSync";
import { ClassicalCiphers } from "@/components/playground/classical-ciphers/ClassicalCiphers";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Classical ciphers · Academy Intermediate",
    "Break a Caesar message by trying every key and then by counting letters, read a Vigenère message from its first word, and see what makes the one-time pad perfect and what breaks it.",
    "/intermediate/classic",
  );

export default async function ClassicPage() {
  await requireSection("intermediate", "classic");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/classic" />;
  return (
    <>
      <ProgressSync lab="classic" />
      <ClassicalCiphers />
    </>
  );
}
