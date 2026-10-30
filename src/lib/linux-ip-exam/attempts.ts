import "server-only";
import type { LinuxIpAttempt, PrismaClient } from "@/generated/prisma/client";
import type { Locale } from "../i18n/core";
import {
  LINUX_IP_EXAM_GRACE_MS,
  LINUX_IP_EXAM_MINUTES,
  type LipAnswers,
  type LipResult,
  type LipState,
} from "./content";
import { applyReview, gradeLinuxIp } from "./grading";
import { EXPLANATIONS } from "./explanations";

export const examDeadline = (from: Date) =>
  new Date(from.getTime() + LINUX_IP_EXAM_MINUTES * 60000);

/** Past the deadline and the grace period, the attempt only waits to be graded. */
export const isOver = (attempt: LinuxIpAttempt, now = new Date()) =>
  now.getTime() > attempt.deadline.getTime() + LINUX_IP_EXAM_GRACE_MS;

const answersOf = (attempt: LinuxIpAttempt) =>
  (attempt.answers ?? {}) as LipAnswers;
export const overridesOf = (attempt: LinuxIpAttempt) =>
  (attempt.overrides ?? {}) as Record<string, number>;

/**
 * Grade and close an attempt. Only the first call wins, so a submit racing
 * the timeout can't grade twice. Returns the attempt as stored.
 */
export async function finalize(
  db: PrismaClient,
  attempt: LinuxIpAttempt,
  reason: "submitted" | "timeout",
  answers = answersOf(attempt),
  leaves = attempt.leaves,
) {
  const grading = gradeLinuxIp(answers);
  await db.linuxIpAttempt.updateMany({
    where: { id: attempt.id, submittedAt: null },
    data: {
      answers,
      leaves: Math.max(attempt.leaves, leaves),
      submittedAt: new Date(),
      finishReason: reason,
      grading,
      autoScore: grading.total,
      finalScore: applyReview(grading, overridesOf(attempt)).total,
    },
  });
  return db.linuxIpAttempt.findUniqueOrThrow({ where: { id: attempt.id } });
}

/** Close an attempt whose time ran out with the answers saved so far. */
export async function finalizeIfOver(
  db: PrismaClient,
  attempt: LinuxIpAttempt,
) {
  return !attempt.submittedAt && isOver(attempt)
    ? finalize(db, attempt, "timeout")
    : attempt;
}

/** The reviewed result, with the explanation of every question. */
export function reviewedResult(
  attempt: LinuxIpAttempt,
  locale: Locale,
): LipResult | null {
  if (!attempt.grading) return null;
  const result = applyReview(
    attempt.grading as LipResult,
    overridesOf(attempt),
  );
  return {
    ...result,
    items: result.items.map((item) => ({
      ...item,
      explain: EXPLANATIONS[item.id]?.[locale],
    })),
  };
}

export function stateOf(
  attempt: LinuxIpAttempt | null,
  locale: Locale,
  now = new Date(),
): LipState {
  if (!attempt) return { kind: "new" };
  if (!attempt.submittedAt)
    return {
      kind: "running",
      remaining: Math.max(0, attempt.deadline.getTime() - now.getTime()),
      answers: answersOf(attempt),
      leaves: attempt.leaves,
    };
  const result = attempt.approvedAt && reviewedResult(attempt, locale);
  return result
    ? {
        kind: "approved",
        result,
        leaves: attempt.leaves,
        note: attempt.note,
      }
    : { kind: "pending" };
}
