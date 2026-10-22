"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { hashCredential, newCode } from "@/lib/html-assessment/service";

export type CreateExamState =
  | {
      error?: string;
      examId?: string;
      codes?: { studentId: string; name: string; code: string }[];
      // Candidates who start from their student page.
      linked?: number;
    }
  | undefined;
export async function createExamAction(
  _previous: CreateExamState,
  form: FormData,
): Promise<CreateExamState> {
  const session = await requireAdmin("/teacher/assessments");
  if (!(await limit(`exam-create:${session.user.id}`, 10, 60000)))
    return { error: "Biroz kutib qayta urinib ko‘ring." };
  const parsed = z
    .object({
      title: z.string().trim().min(3).max(100),
      minutes: z.coerce.number().int().min(15).max(120),
      roster: z.string().trim().max(25000),
      group: z.string().trim().max(40),
    })
    .safeParse({
      title: form.get("title"),
      minutes: form.get("minutes"),
      roster: form.get("roster") ?? "",
      group: form.get("group") ?? "",
    });
  if (!parsed.success || (!parsed.data.roster && !parsed.data.group))
    return {
      error:
        "Sinov nomi, 15–120 daqiqalik vaqt va o‘quvchilar ro‘yxatini kiriting.",
    };
  const db = getDb();
  if (!db) return { error: "Ma’lumotlar bazasi ulanmagan." };
  // Students of a group take the exam from their own page; their roster ID
  // is the account id.
  const accounts = parsed.data.group
    ? await db.student.findMany({
        where: { group: parsed.data.group, active: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      })
    : [];
  if (parsed.data.group && !accounts.length)
    return { error: "Bu guruhda faol o‘quvchi yo‘q." };
  const rows = parsed.data.roster
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => {
      const [studentId, name, ...extra] = line
        .split("|")
        .map((part) => part.trim());
      return { studentId, name, extra };
    });
  const all = [
    ...rows.map((r) => ({ ...r, accountId: null as string | null })),
    ...accounts.map((a) => ({
      studentId: a.id,
      name: a.name,
      extra: [] as string[],
      accountId: a.id as string | null,
    })),
  ];
  if (
    !all.length ||
    all.length > 200 ||
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
  if (new Set(all.map((r) => r.studentId.toLowerCase())).size !== all.length)
    return { error: "Bir sinovda o‘quvchi ID si takrorlanmasligi kerak." };
  const codes = all.map(({ studentId, name, accountId }) => ({
    studentId: accountId ? studentId : studentId.toLowerCase(),
    name,
    accountId,
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
            accountId: row.accountId,
            name: row.name,
            codeHash: hashCredential(row.code),
            variant: randomInt(3),
          })),
        },
      },
    });
    revalidatePath("/teacher/assessments");
    await audit("assessment.create", session.user.id, exam.title);
    return {
      examId: exam.id,
      codes: codes.map(({ studentId, name, code }) => ({
        studentId,
        name,
        code,
      })),
      linked: accounts.length,
    };
  } catch {
    return { error: "Sinov yaratilmadi. Qayta urinib ko‘ring." };
  }
}

export async function closeExamAction(examId: string) {
  await requireAdmin("/teacher/assessments");
  const db = getDb();
  if (!db) return;
  await db.htmlExam.update({ where: { id: examId }, data: { closed: true } });
  revalidatePath(`/teacher/assessments/${examId}`);
}

export async function reviewAttemptAction(
  candidateId: string,
  _previous: { error?: string; success?: string } | undefined,
  form: FormData,
) {
  await requireAdmin("/teacher/assessments");
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
    revalidatePath(`/teacher/assessments/${candidate.examId}`);
    return { success: "Baho saqlandi." };
  } catch {
    return { error: "Faqat yakunlangan ishni baholash mumkin." };
  }
}
