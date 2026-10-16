import { SecretMessage } from "@/components/playground/junior/SecretMessage";
import { AcademyShell } from "@/components/playground/junior/AcademyShell";
import { getJuniorMember } from "@/lib/junior/session";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Secret message",
    "Encrypt a message with a historic cipher and send a friend a link only the two of you can read. The message stays in the link and is never sent to the server.",
    "/playground/junior/secret",
  );

// Open to everyone, so a friend without an account can read a secret.
export default async function SecretMessagePage() {
  if (!(await getJuniorMember())) return <SecretMessage />;
  return (
    <AcademyShell>
      <SecretMessage />
    </AcademyShell>
  );
}
