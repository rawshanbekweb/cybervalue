import { HtmlAssessment } from "@/components/playground/html-assessment/HtmlAssessment";
import { metadata as buildMetadata } from "@/lib/seo";

export const generateMetadata = () =>
  buildMetadata(
    "HTML sinovi",
    "HTML Basics asosidagi vaqtli amaliy baholash.",
    "/playground/html-basics/assessment",
    true,
  );
export default function AssessmentPage() {
  return <HtmlAssessment />;
}
