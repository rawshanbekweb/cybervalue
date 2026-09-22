"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { allowRequest } from "@/lib/rate-limit";
import { hashCredential, newCode } from "@/lib/html-assessment/service";

export type CreateExamState =
  | {
      error?: string;
      examId?: string;
      codes?: { studentId: string; name: string; code: string }[];
    }
  | undefined;
export async function createExamAction(
  _previous: CreateExamState,
  form: FormData,
): Promise<CreateExamState> {
  const session = await requireAdmin("/admin/assessments");
  if (!allowRequest(`exam-create:${session.user.id}`, Date.now(), 10, 60000))
    return { error: "Biroz kutib qayta urinib ko‘ring." };
  const parsed = z
    .object({
      title: z.string().trim().min(3).max(100),
      minutes: z.coerce.number().int().min(15).max(120),
      roster: z.string().trim().min(3).max(25000),
    })
    .safeParse({
      title: form.get("title"),
      minutes: form.get("minutes"),
      roster: form.get("roster"),
    });
  if (!parsed.success)
    return {
      error:
        "Sinov nomi, 15–120 daqiqalik vaqt va o‘quvchilar ro‘yxatini kiriting.",
    };
  const rows = parsed.data.roster
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => {
      const [studentId, name, ...extra] = line
        .split("|")
        .map((part) => part.trim());
      return { studentId, name, extra };
    });
  if (
    !rows.length ||
    rows.length > 200 ||
    rows.some(
      (r) =>
        !/^[\w.-]{1,40}$/.test(r.studentId) ||
        !r.name ||
        r.name.length > 100 ||
        r.extra.length,
    )
  )
    return {
      error:
        "Har qatorda ID | Ism Familiya yozing. ID: 1–40 ta lotin harfi, raqam, nuqta, chiziq yoki pastki chiziq. Ko‘pi bilan 200 o‘quvchi.",
    };
  if (new Set(rows.map((r) => r.studentId.toLowerCase())).size !== rows.length)
    return { error: "Bir sinovda o‘quvchi ID si takrorlanmasligi kerak." };
  const db = getDb();
  if (!db) return { error: "Ma’lumotlar bazasi ulanmagan." };
  const codes = rows.map(({ studentId, name }) => ({
    studentId: studentId.toLowerCase(),
    name,
    code: newCode(),
  }));
  try {
    const exam = await db.htmlExam.create({
      data: {
        title: parsed.data.title,
        minutes: parsed.data.minutes,
        candidates: {
          create: codes.map((row) => ({
            studentId: row.studentId,
            name: row.name,
            codeHash: hashCredential(row.code),
            variant: randomInt(3),
          })),
        },
      },
    });
    revalidatePath("/admin/assessments");
    return { examId: exam.id, codes };
  } catch {
    return { error: "Sinov yaratilmadi. Qayta urinib ko‘ring." };
  }
}

export async function closeExamAction(examId: string) {
  await requireAdmin("/admin/assessments");
  const db = getDb();
  if (!db) return;
  await db.htmlExam.update({ where: { id: examId }, data: { closed: true } });
  revalidatePath(`/admin/assessments/${examId}`);
}

export async function reviewAttemptAction(
  candidateId: string,
  _previous: { error?: string; success?: string } | undefined,
  form: FormData,
) {
  await requireAdmin("/admin/assessments");
  const parsed = z
    .object({
      score: z.coerce.number().int().min(0).max(10),
      note: z.string().trim().max(3000),
    })
    .safeParse({ score: form.get("score"), note: form.get("note") });
  if (!parsed.success || form.get("score") === "")
    return { error: "Izohlar uchun 0–10 oralig‘ida butun ball kiriting." };
  const db = getDb();
  if (!db) return { error: "Ma’lumotlar bazasi ulanmagan." };
  try {
    const candidate = await db.htmlCandidate.update({
      where: { id: candidateId, submittedAt: { not: null } },
      data: { reviewScore: parsed.data.score, reviewNote: parsed.data.note },
    });
    revalidatePath(`/admin/assessments/${candidate.examId}`);
    return { success: "Baho saqlandi." };
  } catch {
    return { error: "Faqat yakunlangan ishni baholash mumkin." };
  }
}
