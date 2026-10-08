import { LinuxLab } from "@/components/playground/linux-lab/LinuxLab";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Linux foundations lab",
    "Learn Linux with 16 practical lessons, a browser terminal, virtual files, command explanations and automatically checked tasks.",
    "/playground/linux-basics",
  );

export default function LinuxBasicsPage() {
  return <LinuxLab />;
}
