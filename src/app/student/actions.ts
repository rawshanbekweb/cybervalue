"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { clientKey } from "@/lib/rate-limit";
import { limit } from "@/lib/rate-limit-db";
import {
  hashSecret,
  isAccessCode,
  normalizeAccessCode,
} from "@/lib/student/access";
import {
  createStudentSession,
  destroyStudentSession,
  requireStudent,
} from "@/lib/student/session";
import { materialForStudent } from "@/lib/student/materials";
import { gradeQuiz, quizSchema } from "@/lib/student/quiz";

export type StudentLoginState = { error?: string } | undefined;
const GENERIC_ERROR = "This access code is not valid or no longer active.";

export async function studentLoginAction(
  _state: StudentLoginState,
  formData: FormData,
): Promise<StudentLoginState> {
  // A whole classroom usually shares one address, so the per-client budget is
  // generous. 80-bit codes make guessing hopeless well within it.
  const client = clientKey((await headers()).get("x-forwarded-for"));
  if (
    !(await limit(`student-login:${client}`, 40, 5 * 60_000)) ||
    !(await limit("student-login:global", 400, 5 * 60_000))
  )
    return { error: "Too many attempts. Try again in a few minutes." };
  const raw = formData.get("code");
  const code = typeof raw === "string" ? normalizeAccessCode(raw) : "";
  if (!isAccessCode(code)) return { error: GENERIC_ERROR };
  const db = getDb();
  if (!db) return { error: "The learning area is not available right now." };
  const now = new Date();
  const student = await db.student.findFirst({
    where: {
      codeHash: hashSecret(code),
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { id: true },
  });
  if (!student) return { error: GENERIC_ERROR };
  await createStudentSession(student.id);
  redirect("/student");
}

export async function studentLogoutAction() {
  await destroyStudentSession();
  redirect("/student/login");
}

export async function markCompleteAction(slug: string) {
  const student = await requireStudent();
  const material = await materialForStudent(student, slug);
  if (!material || material.kind === "QUIZ" || material.kind === "PRACTICE")
    return;
  await getDb()!.studentProgress.upsert({
    where: {
      studentId_materialId: { studentId: student.id, materialId: material.id },
    },
    create: { studentId: student.id, materialId: material.id },
    update: {},
  });
  revalidatePath("/student", "layout");
}

// React resets the form after every action, so a rejected answer comes back
// in `draft` to refill the field; `at` remounts it with that value.
export type PracticeState =
  { error?: string; success?: string; draft?: string; at: number } | undefined;

export async function submitPracticeAction(
  slug: string,
  _state: PracticeState,
  formData: FormData,
): Promise<PracticeState> {
  const student = await requireStudent();
  const raw = formData.get("body");
  const draft = typeof raw === "string" ? raw.slice(0, 20000) : "";
  const reject = (error: string) => ({ error, draft, at: Date.now() });
  if (!(await limit(`student-submit:${student.id}`, 10, 10 * 60_000)))
    return reject("Too many submissions. Try again in a few minutes.");
  const body = z.string().trim().min(1).max(20000).safeParse(raw);
  if (!body.success)
    return reject("Write your answer (up to 20,000 characters).");
  const material = await materialForStudent(student, slug);
  if (!material || material.kind !== "PRACTICE")
    return reject("This practice is no longer available.");
  await getDb()!.studentSubmission.create({
    data: { studentId: student.id, materialId: material.id, body: body.data },
  });
  revalidatePath("/student", "layout");
  return { success: "Submitted. Your teacher will review it.", at: Date.now() };
}

export type QuizState = { error?: string } | undefined;

export async function submitQuizAction(
  slug: string,
  _state: QuizState,
  formData: FormData,
): Promise<QuizState> {
  const student = await requireStudent();
  if (!(await limit(`student-quiz:${student.id}`, 10, 10 * 60_000)))
    return { error: "Too many submissions. Try again in a few minutes." };
  const material = await materialForStudent(student, slug);
  const quiz = quizSchema.safeParse(material?.quiz);
  if (!material || material.kind !== "QUIZ" || !quiz.success)
    return { error: "This test is no longer available." };
  const answers = quiz.data.map((_, i) => {
    const value = Number(formData.get(`q${i}`));
    return Number.isInteger(value) ? value : null;
  });
  const db = getDb()!;
  // Serialize a student's attempts on one quiz so double submits cannot
  // slip past the attempt limit.
  const result: QuizState = await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${student.id}:${material.id}`}, 71523))`;
    const used = await tx.studentSubmission.count({
      where: { studentId: student.id, materialId: material.id },
    });
    if (material.maxAttempts > 0 && used >= material.maxAttempts)
      return { error: "You have used all attempts for this test." };
    const grade = gradeQuiz(quiz.data, answers);
    await tx.studentSubmission.create({
      data: {
        studentId: student.id,
        materialId: material.id,
        answers,
        score: grade.score,
        maxScore: grade.maxScore,
      },
    });
    return undefined;
  });
  // The page re-renders with the graded attempt.
  if (!result?.error) revalidatePath("/student", "layout");
  return result;
}
