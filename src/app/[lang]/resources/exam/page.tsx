import { ResourceExam } from "@/components/resource-exam/ResourceExam";
import { ContentLanguage } from "@/components/content-language";
import { metadata as buildMetadata } from "@/lib/seo";
import { EXAM_PATH } from "@/lib/resource-exam/content";

export const generateMetadata = () =>
  buildMetadata(
    "Resurslar imtihoni",
    "Web asoslari va Linux slaydlari asosidagi test va amaliy topshiriqlar.",
    EXAM_PATH,
    true,
  );
export default function ResourceExamPage() {
  return (
    <ContentLanguage language="uz">
      <ResourceExam />
    </ContentLanguage>
  );
}
