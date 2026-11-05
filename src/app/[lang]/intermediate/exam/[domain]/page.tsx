import { notFound, redirect } from "next/navigation";
import { DomainExam } from "@/components/playground/domain-exam/DomainExam";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { signInFor } from "@/components/intermediate-access";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { intermediateAccess } from "@/lib/intermediate/access";
import { getStudentSession } from "@/lib/student/session";
import { metadata } from "@/lib/seo";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { examMinutes, examSubject, isTopicExam } from "@/lib/domain-exam/build";
import { finalizeIfOver, stateOf } from "@/lib/domain-exam/attempts";
import { domainExamPath, type ExamState } from "@/lib/domain-exam/content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ domain: string }> };

export async function generateMetadata({ params }: Props) {
  const domain = examSubject((await params).domain);
  if (!domain) return {};
  const t = await getTranslator();
  const locale = await getLocale();
  const minutes = examMinutes(domain);
  if (isTopicExam(domain))
    return metadata(
      `${t("Exam")}: ${domain.title[locale]}`,
      t(
        "{count} questions, {minutes} minutes. The result appears after the teacher approves it.",
        { count: domain.questions.length, minutes },
      ),
      domainExamPath(domain.id),
      true,
    );
  return metadata(
    `${t("Final exam")}: ${domain.title[locale]} · Academy Intermediate`,
    t(
      "A {minutes}-minute final exam covering every module of the domain. The result appears after the teacher approves it.",
      { minutes },
    ),
    domainExamPath(domain.id),
    true,
  );
}

export default async function DomainExamPage({ params }: Props) {
  const domain = examSubject((await params).domain);
  if (!domain) notFound();
  const path = domainExamPath(domain.id);
  const topic = isTopicExam(domain);
  const access = await intermediateAccess();
  // A topic exam is open to every student account; staff see the rules.
  if (topic && !access.open) {
    if (!(await getStudentSession()) && !(await getSession()))
      redirect(signInFor(path));
  } else if (!access.open)
    return <IntermediateLocked access={access} path={path} />;

  let state: ExamState = { kind: "staff" };
  let certificate: string | null = null;
  const db = getDb();
  const session = await getStudentSession();
  const student = topic ? !!session : access.open && access.who === "student";
  if (student && db && session) {
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
        minutes: examMinutes(domain),
        topic,
      }}
      initial={state}
      certificate={certificate}
    />
  );
}
