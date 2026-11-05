import { notFound } from "next/navigation";
import { DomainExam } from "@/components/playground/domain-exam/DomainExam";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { getDb } from "@/lib/db";
import { intermediateAccess } from "@/lib/intermediate/access";
import { getStudentSession } from "@/lib/student/session";
import { metadata } from "@/lib/seo";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { examDomain } from "@/lib/domain-exam/build";
import { finalizeIfOver, stateOf } from "@/lib/domain-exam/attempts";
import {
  DOMAIN_EXAM_MINUTES,
  domainExamPath,
  type ExamState,
} from "@/lib/domain-exam/content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ domain: string }> };

export async function generateMetadata({ params }: Props) {
  const domain = examDomain((await params).domain);
  if (!domain) return {};
  const t = await getTranslator();
  const locale = await getLocale();
  return metadata(
    `${t("Final exam")}: ${domain.title[locale]} · Academy Intermediate`,
    t(
      "A {minutes}-minute final exam covering every module of the domain. The result appears after the teacher approves it.",
      { minutes: DOMAIN_EXAM_MINUTES },
    ),
    domainExamPath(domain.id),
    true,
  );
}

export default async function DomainExamPage({ params }: Props) {
  const domain = examDomain((await params).domain);
  if (!domain) notFound();
  const path = domainExamPath(domain.id);
  const access = await intermediateAccess();
  if (!access.open) return <IntermediateLocked access={access} path={path} />;

  let state: ExamState = { kind: "staff" };
  let certificate: string | null = null;
  const db = getDb();
  const session = await getStudentSession();
  if (access.who === "student" && db && session) {
    const attempt = await db.domainExamAttempt.findUnique({
      where: {
        studentId_domain: { studentId: session.studentId, domain: domain.id },
      },
    });
    state = stateOf(
      domain,
      attempt && (await finalizeIfOver(db, domain, attempt)),
    );
    if (state.kind === "approved" && state.result.passed)
      certificate =
        (
          await db.studentCertificate.findFirst({
            where: {
              studentId: session.studentId,
              rule: `exam-${domain.id}`,
              revokedAt: null,
            },
            select: { code: true },
          })
        )?.code ?? null;
  }
  return (
    <DomainExam
      domain={{
        id: domain.id,
        title: domain.title,
        modules: domain.modules.length,
      }}
      initial={state}
      certificate={certificate}
    />
  );
}
