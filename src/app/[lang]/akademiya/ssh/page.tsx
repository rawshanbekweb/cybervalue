import { ProgressSync } from "@/components/playground/ProgressSync";
import { SshBasics } from "@/components/playground/ssh-basics/SshBasics";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "SSH · animated lab",
    "How remote connection works: an encrypted SSH session step by step, a practice server, host keys, and switching from passwords to key pairs.",
    "/akademiya/ssh",
  );

export default async function SshPage() {
  await requireSection("academy", "ssh");
  return (
    <>
      <ProgressSync lab="ssh" />
      <SshBasics />
    </>
  );
}
