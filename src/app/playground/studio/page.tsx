import { ProjectStudio } from "@/components/playground/studio/ProjectStudio";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "HTML & CSS Project Studio",
    "Build an incident form, service status page, or product launch page. Edit HTML and CSS, preview your design, and check its structure against a real project brief.",
    "/playground/studio",
  );

export default function StudioPage() {
  return <ProjectStudio />;
}
