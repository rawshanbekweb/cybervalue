import { requireSection } from "@/lib/site-config-server";
import { ProjectStudio } from "@/components/playground/studio/ProjectStudio";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "HTML & CSS Project Studio",
    "Build an incident form, service status page, or product launch page. Edit HTML and CSS, preview your design, and check its structure against a real project brief.",
    "/akademiya/studio",
  );

export default async function StudioPage() {
  await requireSection("academy", "studio");
  return <ProjectStudio />;
}
