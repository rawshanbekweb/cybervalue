import { createHash, randomBytes } from "node:crypto";
import type {
  HtmlCandidate,
  HtmlExam,
  PrismaClient,
  Prisma,
} from "@/generated/prisma/client";
import { challengeFor } from "./challenge";
import { draftSchema, type AttemptView, type Draft } from "./contract";
import { gradeAttempt } from "./grading";

export const EXAM_COOKIE = "cv_html_attempt";
export const hashCredential = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const normalizeCode = (code: string) =>
  code.replace(/[\s-]/g, "").toUpperCase();
export const newCode = () => randomBytes(12).toString("hex").toUpperCase();
type Candidate = HtmlCandidate & { exam: HtmlExam };
export class AssessmentError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function candidateDraft(candidate: HtmlCandidate): Draft {
  return draftSchema.parse({
    revision: candidate.revision,
    code: candidate.code,
    answers: candidate.answers,
    explanations: candidate.explanations,
    signals: candidate.signals,
  });
}

export function attemptView(candidate: Candidate): AttemptView {
  return {
    id: candidate.id,
    name: candidate.name,
    title: candidate.exam.title,
    minutes: candidate.exam.minutes,
    deadline: candidate.deadline!.toISOString(),
    serverNow: new Date().toISOString(),
    submittedAt: candidate.submittedAt?.toISOString() ?? null,
    finishReason: candidate.finishReason,
    autoScore: candidate.autoScore,
    reviewScore: candidate.reviewScore,
    reviewNote: candidate.reviewNote,
    draft: candidateDraft(candidate),
    challenge: challengeFor(candidate.variant),
  };
}

async function lock(tx: Prisma.TransactionClient, id: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${id}, 92481))`;
}

async function finish(
  tx: Prisma.TransactionClient,
  candidate: Candidate,
  reason: string,
  at: Date,
) {
  const grade = gradeAttempt(candidate.variant, candidateDraft(candidate));
  return tx.htmlCandidate.update({
    where: { id: candidate.id },
    data: {
      submittedAt: at,
      finishReason: reason,
      autoScore: grade.total,
      grading: grade,
    },
    include: { exam: true },
  });
}

export async function startAttempt(
  db: PrismaClient,
  rawCode: string,
  token: string,
) {
  const code = normalizeCode(rawCode);
  if (!/^[A-F0-9]{24}$/.test(code))
    throw new AssessmentError("Kirish kodi noto‘g‘ri.");
  return db.$transaction(async (tx) => {
    const found = await tx.htmlCandidate.findUnique({
      where: { codeHash: hashCredential(code) },
      select: { id: true },
    });
    if (!found) throw new AssessmentError("Kirish kodi noto‘g‘ri.");
    await lock(tx, found.id);
    const candidate = await tx.htmlCandidate.findUniqueOrThrow({
      where: { id: found.id },
      include: { exam: true },
    });
    if (candidate.startedAt)
      throw new AssessmentError(
        "Bu kod bilan urinish boshlangan. Faqat avvalgi brauzerda davom etish mumkin; yangi urinish berilmaydi.",
        409,
      );
    if (candidate.exam.closed)
      throw new AssessmentError("O‘qituvchi bu sinovga kirishni yopgan.", 403);
    const now = new Date();
    return tx.htmlCandidate.update({
      where: { id: candidate.id },
      data: {
        startedAt: now,
        deadline: new Date(now.getTime() + candidate.exam.minutes * 60000),
        sessionHash: hashCredential(token),
        code: challengeFor(candidate.variant).starter,
      },
      include: { exam: true },
    });
  });
}

export async function accessAttempt(
  db: PrismaClient,
  token: string,
  draft?: Draft,
  submit = false,
) {
  if (!/^[a-f0-9]{64}$/.test(token))
    throw new AssessmentError("Sinovga kirish talab qilinadi.", 401);
  return db.$transaction(async (tx) => {
    const found = await tx.htmlCandidate.findUnique({
      where: { sessionHash: hashCredential(token) },
      select: { id: true },
    });
    if (!found)
      throw new AssessmentError("Sinovga kirish talab qilinadi.", 401);
    await lock(tx, found.id);
    let candidate = await tx.htmlCandidate.findUniqueOrThrow({
      where: { id: found.id },
      include: { exam: true },
    });
    const now = new Date();
    if (candidate.submittedAt) return candidate;
    // A late request can never replace the last draft accepted before the deadline.
    if (now >= candidate.deadline!)
      return finish(tx, candidate, "timeout", candidate.deadline!);
    if (draft) {
      const parsed = draftSchema.parse(draft);
      if (candidate.revision !== parsed.revision)
        throw new AssessmentError(
          "Saqlash versiyasi mos kelmadi. Boshqa tabni yoping va sahifani yangilang.",
          409,
        );
      const old = candidateDraft(candidate).signals;
      candidate = await tx.htmlCandidate.update({
        where: { id: candidate.id },
        data: {
          code: parsed.code,
          answers: parsed.answers,
          explanations: parsed.explanations,
          signals: {
            hidden: Math.max(old.hidden, parsed.signals.hidden),
            paste: Math.max(old.paste, parsed.signals.paste),
            fullscreen: Math.max(old.fullscreen, parsed.signals.fullscreen),
          },
          revision: { increment: 1 },
        },
        include: { exam: true },
      });
    }
    return submit ? finish(tx, candidate, "submitted", now) : candidate;
  });
}

export async function finalizeExpired(db: PrismaClient, examId: string) {
  const expired = await db.htmlCandidate.findMany({
    where: { examId, deadline: { lte: new Date() }, submittedAt: null },
    select: { id: true },
    take: 200,
  });
  for (const { id } of expired) {
    await db.$transaction(async (tx) => {
      await lock(tx, id);
      const candidate = await tx.htmlCandidate.findUniqueOrThrow({
        where: { id },
        include: { exam: true },
      });
      if (
        !candidate.submittedAt &&
        candidate.deadline &&
        new Date() >= candidate.deadline
      )
        await finish(tx, candidate, "timeout", candidate.deadline);
    });
  }
}
