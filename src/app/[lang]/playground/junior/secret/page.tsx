import { SecretMessage } from "@/components/playground/junior/SecretMessage";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Secret message",
    "Encrypt a message with a historic cipher and send a friend a link only the two of you can read. The message stays in the link and is never sent to the server.",
    "/playground/junior/secret",
  );

export default function SecretMessagePage() {
  return <SecretMessage />;
}
