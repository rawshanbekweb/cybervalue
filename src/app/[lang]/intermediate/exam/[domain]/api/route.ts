import { z } from "zod";
import { limit } from "@/lib/rate-limit-db";
import { getDb } from "@/lib/db";
import { getStudentSession } from "@/lib/student/session";
import { opensIntermediate } from "@/lib/student/levels";
import { examDomain } from "@/lib/domain-exam/build";
import {
  examDeadline,
  finalize,
  finalizeIfOver,
  isOver,
  newSeed,
  runningState,
} from "@/lib/domain-exam/attempts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers });

const answers = z
  .record(z.string().max(40), z.number().int().min(0).max(9))
  .refine((value) => Object.keys(value).length <= 40);
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

// A domain's final exam is taken from an Intermediate student account: the
// server keeps the clock and the answers, and the result waits for the
// teacher (see /teacher/domain-exams).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ domain: string }> },
) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return json({ error: "The request's origin was refused." }, 403);
  const domain = examDomain((await params).domain);
  if (!domain) return json({ error: "There is no such exam." }, 404);
  const db = getDb();
  if (!db) return json({ error: "The database is not connected." }, 503);
  const session = await getStudentSession();
  if (!session)
    return json({ error: "Sign in with your student account first." }, 401);
  if (!opensIntermediate(session.student.level))
    return json({ error: "This exam is part of Academy Intermediate." }, 403);
  const studentId = session.studentId;
  if (
    !(await limit(`domain-exam:${studentId}`, 120, 60_000)) ||
    !(await limit("domain-exam-global", 3000, 60_000))
  )
    return json({ error: "Too many requests. Wait a moment." }, 429);
  const text = await request.text();
  if (text.length > 20_000)
    return json({ error: "The request is too large." }, 413);
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    return json({ error: "The request is not valid." }, 400);
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return json({ error: "The answers are not valid." }, 400);
  const body = parsed.data;

  const where = { studentId_domain: { studentId, domain: domain.id } };
  let attempt = await db.domainExamAttempt.findUnique({ where });
  if (body.action === "start") {
    if (!attempt) {
      const now = new Date();
      attempt = await db.domainExamAttempt
        .create({
          data: {
            studentId,
            domain: domain.id,
            seed: newSeed(),
            startedAt: now,
            deadline: examDeadline(now),
          },
        })
        // Two tabs starting at once: the other one created it.
        .catch(() => db.domainExamAttempt.findUniqueOrThrow({ where }));
    }
    attempt = await finalizeIfOver(db, domain, attempt);
    if (attempt.submittedAt) return json({ kind: "pending" });
    return json(runningState(domain, attempt));
  }

  if (!attempt) return json({ error: "The exam has not started." }, 409);
  if (attempt.submittedAt) return json({ kind: "pending" });
  // After the deadline, only what was saved in time counts.
  if (isOver(attempt)) {
    await finalize(db, domain, attempt, "timeout");
    return json({ kind: "pending" });
  }
  if (body.action === "save") {
    await db.domainExamAttempt.updateMany({
      where: { id: attempt.id, submittedAt: null },
      data: {
        answers: body.answers,
        leaves: Math.max(attempt.leaves, body.leaves),
      },
    });
    return json({ kind: "running" });
  }
  await finalize(db, domain, attempt, "submitted", body.answers, body.leaves);
  return json({ kind: "pending" });
}
