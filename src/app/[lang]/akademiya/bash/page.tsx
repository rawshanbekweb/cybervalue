import { ProgressSync } from "@/components/playground/ProgressSync";
import { BashBasics } from "@/components/playground/bash-basics/BashBasics";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Bash basics · animated lab",
    "Variables, loops and your first scripts in a safe terminal that runs in the browser: watch a loop turn by turn, fix an endless loop and scan a login log.",
    "/akademiya/bash",
  );

export default async function BashPage() {
  await requireSection("academy", "bash");
  return (
    <>
      <ProgressSync lab="bash" />
      <BashBasics />
    </>
  );
}
