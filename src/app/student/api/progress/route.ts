import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { clientKey } from "@/lib/rate-limit";
import { getStudentSession } from "@/lib/student/session";
import { isLabId, LAB_PROGRESS, lessonList } from "@/lib/lab-progress";

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
  return json({ signedIn: true, lessons: row?.lessons ?? [] });
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
  const lessons = lessonList(body.lessons, LAB_PROGRESS[body.lab].total);
  await getDb()!.studentLabProgress.upsert({
    where: { studentId_lab: { studentId: student.id, lab: body.lab } },
    create: { studentId: student.id, lab: body.lab, lessons },
    update: { lessons },
  });
  return json({ ok: true, lessons });
}
