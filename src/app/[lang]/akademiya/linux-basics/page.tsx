import { ProgressSync } from "@/components/playground/ProgressSync";
import { requireSection } from "@/lib/site-config-server";
import { LinuxLab } from "@/components/playground/linux-lab/LinuxLab";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Linux foundations lab",
    "Learn Linux with 16 practical lessons, a browser terminal, virtual files, command explanations and automatically checked tasks.",
    "/akademiya/linux-basics",
  );

export default async function LinuxBasicsPage() {
  await requireSection("academy", "linux");
  return (
    <>
      <ProgressSync lab="linux" />
      <LinuxLab />
    </>
  );
}
