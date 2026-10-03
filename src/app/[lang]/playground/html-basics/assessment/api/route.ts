import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { allowRequest } from "@/lib/rate-limit";
import { ASSESSMENT_PATH, draftSchema } from "@/lib/html-assessment/contract";
import {
  accessAttempt,
  AssessmentError,
  attemptView,
  EXAM_COOKIE,
  hashCredential,
  normalizeCode,
  startAttempt,
} from "@/lib/html-assessment/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers });

async function body(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new AssessmentError("So‘rov bo‘sh.");
  let size = 0;
  const parts: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 128000) {
        await reader.cancel();
        throw new AssessmentError("So‘rov juda katta.", 413);
      }
      parts.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(parts).toString("utf8"));
  } catch {
    throw new AssessmentError("So‘rov formati noto‘g‘ri.");
  }
}

async function handle(request: Request) {
  try {
    if (
      request.method !== "GET" &&
      request.headers.get("origin") !== new URL(request.url).origin
    )
      return json({ error: "So‘rov manbasi rad etildi." }, 403);
    const db = getDb();
    if (!db)
      return json(
        { error: "Sinov hozir mavjud emas. O‘qituvchiga murojaat qiling." },
        503,
      );
    const jar = await cookies();
    const token = jar.get(EXAM_COOKIE)?.value ?? "";
    if (request.method === "GET") {
      if (!token) return json({ attempt: null });
      return json({ attempt: attemptView(await accessAttempt(db, token)) });
    }
    const input = await body(request);
    if (request.method === "POST") {
      const parsed = z
        .object({
          action: z.enum(["check", "start"]),
          code: z.string().max(80),
        })
        .strict()
        .parse(input);
      if (
        !allowRequest(
          `html-entry:${hashCredential(normalizeCode(parsed.code))}`,
          Date.now(),
          12,
          60000,
        ) ||
        !allowRequest("html-entry-global", Date.now(), 600, 60000)
      )
        return json({ error: "Juda ko‘p urinish. Biroz kuting." }, 429);
      // Do not replace an existing active browser session with another pupil's code.
      if (token && parsed.action === "start") {
        const existing = await db.htmlCandidate.findUnique({
          where: { sessionHash: hashCredential(token) },
        });
        if (
          existing &&
          !existing.submittedAt &&
          existing.deadline &&
          existing.deadline > new Date()
        )
          throw new AssessmentError(
            "Bu brauzerda boshqa urinish davom etmoqda.",
            409,
          );
      }
      if (parsed.action === "check") {
        const candidate = await db.htmlCandidate.findUnique({
          where: { codeHash: hashCredential(normalizeCode(parsed.code)) },
          include: { exam: true },
        });
        if (!candidate) throw new AssessmentError("Kirish kodi noto‘g‘ri.");
        if (candidate.startedAt)
          throw new AssessmentError(
            "Bu kod ishlatilgan. Urinishni boshlagan brauzerda davom eting.",
            409,
          );
        if (candidate.exam.closed)
          throw new AssessmentError("Bu sinovga kirish yopilgan.", 403);
        return json({
          entry: {
            name: candidate.name,
            title: candidate.exam.title,
            minutes: candidate.exam.minutes,
          },
        });
      }
      const sessionToken = randomBytes(32).toString("hex");
      const candidate = await startAttempt(db, parsed.code, sessionToken);
      jar.set(EXAM_COOKIE, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: ASSESSMENT_PATH,
        maxAge: 7 * 86400,
      });
      return json({ attempt: attemptView(candidate) });
    }
    const parsed = z
      .object({
        draft: draftSchema.optional(),
        submit: z.boolean().default(false),
      })
      .strict()
      .parse(input);
    if (
      !allowRequest(
        `html-save:${hashCredential(token)}`,
        Date.now(),
        180,
        60000,
      )
    )
      return json({ error: "Saqlash so‘rovlari ko‘paydi. Biroz kuting." }, 429);
    return json({
      attempt: attemptView(
        await accessAttempt(db, token, parsed.draft, parsed.submit),
      ),
    });
  } catch (error) {
    if (error instanceof AssessmentError)
      return json({ error: error.message }, error.status);
    if (error instanceof z.ZodError)
      return json(
        {
          error:
            "Kiritilgan ma’lumot yoki kod hajmi ruxsat etilgan chegaradan tashqarida.",
        },
        400,
      );
    return json(
      {
        error:
          "Server bilan aloqa bo‘lmadi. Ish saqlanganini tekshiring va qayta urinib ko‘ring.",
      },
      503,
    );
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
