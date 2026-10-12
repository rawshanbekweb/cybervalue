import "server-only";
import type { Prisma, StudentMaterial } from "@/generated/prisma/client";
import { isQuizExpired } from "./quiz";

// Serializes one student's attempts on one quiz, so double submits and
// parallel tabs cannot slip past the attempt limit or the deadline.
export const lockAttempts = (
  tx: Prisma.TransactionClient,
  studentId: string,
  materialId: string,
) =>
  tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${studentId}:${materialId}`}, 71523))`;

// An attempt whose deadline passed without a submission (a closed tab, a lost
// connection) counts as a zero-score attempt, so leaving the page cannot buy
// a fresh timer. Call inside a transaction that holds lockAttempts.
export async function closeExpiredStart(
  tx: Prisma.TransactionClient,
  studentId: string,
  material: Pick<StudentMaterial, "id" | "timeLimit">,
  questions: number,
) {
  if (material.timeLimit <= 0) return;
  const start = await tx.studentQuizStart.findUnique({
    where: {
      studentId_materialId: { studentId, materialId: material.id },
    },
  });
  if (!start || !isQuizExpired(start, material.timeLimit)) return;
  await tx.studentQuizStart.delete({
    where: {
      studentId_materialId: { studentId, materialId: material.id },
    },
  });
  await tx.studentSubmission.create({
    data: {
      studentId,
      materialId: material.id,
      answers: Array.from({ length: questions }, () => null),
      score: 0,
      maxScore: questions,
    },
  });
}
