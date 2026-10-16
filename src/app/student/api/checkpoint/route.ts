import { randomInt } from "node:crypto";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { serverSecret } from "@/lib/server-secret";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { clientKey } from "@/lib/rate-limit";
import { getStudentSession } from "@/lib/student/session";
import {
  checkpointById,
  grade,
  questionsFor,
} from "@/lib/checkpoints/questions";
import { issueAttempt, readAttempt } from "@/lib/checkpoints/token";

// Lab checkpoints live on public pages, but this route sits under /student so
// the student's session cookie reaches it. Anyone may take a checkpoint;
// only a signed-in student's result is saved.
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: NO_STORE });

const secret = () => serverSecret("checkpoint");

async function student() {
  return (await getStudentSession())?.student ?? null;
}

export async function GET() {
  const me = await student();
  if (!me) return json({ signedIn: false });
  const attempts = await getDb()!.studentCheckpoint.findMany({
    where: { studentId: me.id },
    select: { checkpoint: true, score: true, total: true },
  });
  const best: Record<string, { percent: number; attempts: number }> = {};
  for (const a of attempts) {
    const percent = Math.round((a.score / a.total) * 100);
    const entry = best[a.checkpoint] ?? { percent: 0, attempts: 0 };
    best[a.checkpoint] = {
      percent: Math.max(entry.percent, percent),
      attempts: entry.attempts + 1,
    };
  }
  return json({ signedIn: true, name: me.name.split(" ")[0], best });
}

export async function POST(request: NextRequest) {
  const key = secret();
  if (!key) return json({ error: "unavailable" }, 503);
  const client = clientKey((await headers()).get("x-forwarded-for"));
  if (!(await limit(`checkpoint:${client}`, 40, 60_000)))
    return json({ error: "rate" }, 429);
  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 5000) return json({ error: "invalid" }, 400);
    body = JSON.parse(text);
  } catch {
    return json({ error: "invalid" }, 400);
  }
  const me = await student();

  if (body.action === "start") {
    const checkpoint = checkpointById(String(body.id));
    if (!checkpoint) return json({ error: "invalid" }, 400);
    const seed = randomInt(1, 2 ** 31 - 1);
    const token = issueAttempt(key, {
      checkpoint: checkpoint.id,
      seed,
      student: me?.id ?? "",
      issued: Date.now(),
    });
    // Answers and explanations stay on the server until the attempt is graded.
    const questions = questionsFor(checkpoint, seed).map(
      ({ ask, code, options }) => ({ ask, code, options }),
    );
    return json({ token, questions, saving: Boolean(me) });
  }

  if (body.action === "submit") {
    const attempt = readAttempt(key, body.token);
    const checkpoint = attempt && checkpointById(attempt.checkpoint);
    if (!attempt || !checkpoint) return json({ error: "expired" }, 400);
    const questions = questionsFor(checkpoint, attempt.seed);
    const result = grade(questions, body.answers);
    let saved = false;
    if (attempt.student && me?.id === attempt.student) {
      try {
        await getDb()!.studentCheckpoint.create({
          data: {
            studentId: me.id,
            checkpoint: checkpoint.id,
            seed: attempt.seed,
            score: result.score,
            total: result.total,
          },
        });
        saved = true;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        )
          return json({ error: "graded" }, 409);
        throw error;
      }
    }
    return json({
      ...result,
      passed: result.percent >= checkpoint.pass,
      saved,
      review: questions.map((q) => ({ answer: q.answer, explain: q.explain })),
    });
  }
  return json({ error: "invalid" }, 400);
}
