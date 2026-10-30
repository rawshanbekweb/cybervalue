import { LinuxIpExam } from "@/components/resource-exam/LinuxIpExam";
import { metadata as buildMetadata } from "@/lib/seo";
import { LINUX_IP_EXAM_PATH } from "@/lib/linux-ip-exam/content";
import { LabMessages } from "@/components/i18n/lab-messages";

export const generateMetadata = () =>
  buildMetadata(
    "Linux va IP manzil imtihoni",
    "Linux terminal buyruqlari va IP manzillar bo‘yicha 40 ta test va 10 ta ochiq savol, 2 soat.",
    LINUX_IP_EXAM_PATH,
    true,
  );
export default function LinuxIpExamPage() {
  return (
    <LabMessages>
      <LinuxIpExam />
    </LabMessages>
  );
}
