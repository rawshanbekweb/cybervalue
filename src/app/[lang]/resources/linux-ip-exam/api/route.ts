import { z } from "zod";
import { limit } from "@/lib/rate-limit-db";
import { getDb } from "@/lib/db";
import { getStudentSession } from "@/lib/student/session";
import {
  examDeadline,
  finalize,
  finalizeIfOver,
  isOver,
} from "@/lib/linux-ip-exam/attempts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers });

const answers = z
  .record(z.string().max(40), z.string().max(2000))
  .refine((value) => Object.keys(value).length <= 80);
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start") }).strict(),
  z
    .object({
      action: z.enum(["save", "submit"]),
      answers,
      leaves: z.number().int().min(0).max(10000),
    })
    .strict(),
]);

// The exam is taken from a student account: the server keeps the clock and
// the answers, and the result waits for the teacher (see /teacher/linux-ip-exam).
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return json({ error: "So‘rov manbasi rad etildi." }, 403);
  const db = getDb();
  if (!db) return json({ error: "Ma’lumotlar bazasi ulanmagan." }, 503);
  const session = await getStudentSession();
  if (!session)
    return json({ error: "Imtihon uchun o‘quvchi hisobiga kiring." }, 401);
  const studentId = session.studentId;
  if (
    !(await limit(`linux-ip-exam:${studentId}`, 120, 60000)) ||
    !(await limit("linux-ip-exam-global", 3000, 60000))
  )
    return json({ error: "Juda ko‘p urinish. Biroz kuting." }, 429);
  const text = await request.text();
  if (text.length > 60000) return json({ error: "So‘rov juda katta." }, 413);
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    return json({ error: "So‘rov formati noto‘g‘ri." }, 400);
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return json({ error: "Javoblar formati noto‘g‘ri." }, 400);
  const body = parsed.data;

  let attempt = await db.linuxIpAttempt.findUnique({ where: { studentId } });
  if (body.action === "start") {
    if (!attempt) {
      const now = new Date();
      attempt = await db.linuxIpAttempt
        .create({
          data: { studentId, startedAt: now, deadline: examDeadline(now) },
        })
        // Two tabs starting at once: the other one created it.
        .catch(() =>
          db.linuxIpAttempt.findUniqueOrThrow({ where: { studentId } }),
        );
    }
    attempt = await finalizeIfOver(db, attempt);
    if (attempt.submittedAt) return json({ kind: "pending" });
    return json({
      kind: "running",
      remaining: Math.max(0, attempt.deadline.getTime() - Date.now()),
      answers: attempt.answers,
      leaves: attempt.leaves,
    });
  }

  if (!attempt) return json({ error: "Imtihon boshlanmagan." }, 409);
  if (attempt.submittedAt) return json({ kind: "pending" });
  // After the deadline, only what was saved in time counts.
  if (isOver(attempt)) {
    await finalize(db, attempt, "timeout");
    return json({ kind: "pending" });
  }
  if (body.action === "save") {
    await db.linuxIpAttempt.updateMany({
      where: { id: attempt.id, submittedAt: null },
      data: {
        answers: body.answers,
        leaves: Math.max(attempt.leaves, body.leaves),
      },
    });
    return json({ kind: "running" });
  }
  await finalize(db, attempt, "submitted", body.answers, body.leaves);
  return json({ kind: "pending" });
}
