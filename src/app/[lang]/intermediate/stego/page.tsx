import { ProgressSync } from "@/components/playground/ProgressSync";
import { Stego } from "@/components/playground/stego/Stego";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Steganography: the idea · Academy Intermediate",
    "Tell hiding from encrypting, read a word out of a poem’s first letters, find a secret tucked into a chat message as invisible characters, read a steghide command, and see where hiding is used for good and for harm.",
    "/intermediate/stego",
  );

export default async function StegoPage() {
  await requireSection("intermediate", "stego");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/stego" />;
  return (
    <>
      <ProgressSync lab="stego" />
      <Stego />
    </>
  );
}
