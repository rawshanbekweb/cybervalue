import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { certificatesEarned } from "@/lib/telegram/events";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { clientKey } from "@/lib/rate-limit";
import { getStudentSession } from "@/lib/student/session";
import {
  isLabId,
  LAB_META,
  LAB_PROGRESS,
  lessonList,
} from "@/lib/lab-progress";
import { opensIntermediate } from "@/lib/student/levels";

// Lab lesson progress for the signed-in student. The route sits under
// /student so the session cookie reaches it from the public lab pages.
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: NO_STORE });

export async function GET(request: NextRequest) {
  const lab = request.nextUrl.searchParams.get("lab");
  if (!isLabId(lab)) return json({ error: "invalid" }, 400);
  const student = (await getStudentSession())?.student;
  if (!student) return json({ signedIn: false });
  const row = await getDb()!.studentLabProgress.findUnique({
    where: { studentId_lab: { studentId: student.id, lab } },
  });
  // `owner` lets the browser tell whose progress it holds (shared computers).
  return json({
    signedIn: true,
    owner: student.id,
    lessons: row?.lessons ?? [],
  });
}

export async function PUT(request: NextRequest) {
  const student = (await getStudentSession())?.student;
  if (!student) return json({ error: "signed-out" }, 401);
  const client = clientKey((await headers()).get("x-forwarded-for"));
  if (!(await limit(`lab-progress:${student.id}:${client}`, 120, 60_000)))
    return json({ error: "rate" }, 429);
  let body: { lab?: unknown; lessons?: unknown };
  try {
    const text = await request.text();
    if (text.length > 2000) return json({ error: "invalid" }, 400);
    body = JSON.parse(text);
  } catch {
    return json({ error: "invalid" }, 400);
  }
  if (!isLabId(body.lab)) return json({ error: "invalid" }, 400);
  // Intermediate labs open only at that level (see intermediateAccess), so
  // their progress, and the certificates it leads to, are saved only there.
  const intermediate = LAB_META.find((l) => l.id === body.lab)?.intermediate;
  if (intermediate && !opensIntermediate(student.level))
    return json({ error: "level" }, 403);
  const lessons = lessonList(body.lessons, LAB_PROGRESS[body.lab].total);
  const db = getDb()!;
  const where = { studentId_lab: { studentId: student.id, lab: body.lab } };
  const before = await db.studentLabProgress.findUnique({ where });
  // An unchanged list is not written again: updatedAt is when the lab was
  // last changed, which dates a finished lab assignment.
  if (!before || before.lessons.join() !== lessons.join())
    await db.studentLabProgress.upsert({
      where,
      create: { studentId: student.id, lab: body.lab, lessons },
      update: { lessons },
    });
  const certificates = await certificatesEarned(db, student.id).catch(() => []);
  return json({ ok: true, lessons, certificates });
}
