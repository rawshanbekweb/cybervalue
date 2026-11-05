import "server-only";
import { randomInt } from "node:crypto";
import type {
  DomainExamAttempt,
  PrismaClient,
} from "@/generated/prisma/client";
import type { Domain } from "../intermediate/roadmap";
import { buildExam, gradeExam, publicQuestions } from "./build";
import {
  DOMAIN_EXAM_GRACE_MS,
  DOMAIN_EXAM_MINUTES,
  type ExamAnswers,
  type ExamState,
} from "./content";

export const examDeadline = (from: Date) =>
  new Date(from.getTime() + DOMAIN_EXAM_MINUTES * 60_000);

export const newSeed = () => randomInt(1, 2_000_000_000);

/** Past the deadline and the grace period, the attempt only waits to be graded. */
export const isOver = (attempt: DomainExamAttempt, now = new Date()) =>
  now.getTime() > attempt.deadline.getTime() + DOMAIN_EXAM_GRACE_MS;

export const answersOf = (attempt: DomainExamAttempt) =>
  (attempt.answers ?? {}) as ExamAnswers;

/**
 * Grade and close an attempt. Only the first call wins, so a submit racing
 * the timeout can't grade twice. Returns the attempt as stored.
 */
export async function finalize(
  db: PrismaClient,
  domain: Domain,
  attempt: DomainExamAttempt,
  reason: "submitted" | "timeout",
  answers = answersOf(attempt),
  leaves = attempt.leaves,
) {
  const { score, total } = gradeExam(domain, attempt.seed, answers);
  await db.domainExamAttempt.updateMany({
    where: { id: attempt.id, submittedAt: null },
    data: {
      answers,
      leaves: Math.max(attempt.leaves, leaves),
      submittedAt: new Date(),
      finishReason: reason,
      score,
      total,
    },
  });
  return db.domainExamAttempt.findUniqueOrThrow({ where: { id: attempt.id } });
}

/** Close an attempt whose time ran out with the answers saved so far. */
export async function finalizeIfOver(
  db: PrismaClient,
  domain: Domain,
  attempt: DomainExamAttempt,
) {
  return !attempt.submittedAt && isOver(attempt)
    ? finalize(db, domain, attempt, "timeout")
    : attempt;
}

export function runningState(
  domain: Domain,
  attempt: DomainExamAttempt,
  now = new Date(),
): ExamState {
  return {
    kind: "running",
    remaining: Math.max(0, attempt.deadline.getTime() - now.getTime()),
    answers: answersOf(attempt),
    leaves: attempt.leaves,
    questions: publicQuestions(buildExam(domain, attempt.seed)),
  };
}

/** What the student may see: the result only once a teacher approved it. */
export function stateOf(
  domain: Domain,
  attempt: DomainExamAttempt | null,
  now = new Date(),
): ExamState {
  if (!attempt) return { kind: "new", count: buildExam(domain, 1).length };
  if (!attempt.submittedAt) return runningState(domain, attempt, now);
  if (!attempt.approvedAt) return { kind: "pending" };
  return {
    kind: "approved",
    result: gradeExam(domain, attempt.seed, answersOf(attempt)),
    leaves: attempt.leaves,
    note: attempt.note,
  };
}
