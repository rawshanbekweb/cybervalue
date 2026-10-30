import { LinuxIpExam } from "@/components/resource-exam/LinuxIpExam";
import { metadata as buildMetadata } from "@/lib/seo";
import { LINUX_IP_EXAM_PATH, type LipState } from "@/lib/linux-ip-exam/content";
import { LabMessages } from "@/components/i18n/lab-messages";
import { getDb } from "@/lib/db";
import { getLocale } from "@/lib/i18n/server";
import { getStudentSession } from "@/lib/student/session";
import { finalizeIfOver, stateOf } from "@/lib/linux-ip-exam/attempts";

export const dynamic = "force-dynamic";

export const generateMetadata = () =>
  buildMetadata(
    "Linux va IP manzil imtihoni",
    "Linux terminal buyruqlari va IP manzillar bo‘yicha 40 ta test va 10 ta ochiq savol, 2 soat.",
    LINUX_IP_EXAM_PATH,
    true,
  );

async function load(): Promise<LipState> {
  const db = getDb();
  const session = await getStudentSession();
  if (!db || !session) return { kind: "signed-out" };
  const attempt = await db.linuxIpAttempt.findUnique({
    where: { studentId: session.studentId },
  });
  return stateOf(
    attempt && (await finalizeIfOver(db, attempt)),
    await getLocale(),
  );
}

export default async function LinuxIpExamPage() {
  const state = await load();
  return (
    <LabMessages>
      <LinuxIpExam initial={state} />
    </LabMessages>
  );
}
