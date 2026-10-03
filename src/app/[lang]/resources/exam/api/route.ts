import { z } from "zod";
import { allowRequest, clientKey } from "@/lib/rate-limit";
import { gradeExam } from "@/lib/resource-exam/grading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers });

const schema = z
  .object({
    answers: z
      .record(z.string().max(40), z.string().max(2000))
      .refine((answers) => Object.keys(answers).length <= 80),
  })
  .strict();

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return json({ error: "So‘rov manbasi rad etildi." }, 403);
  const client = clientKey(request.headers.get("x-forwarded-for"));
  if (
    !allowRequest(`resource-exam:${client}`, Date.now(), 20, 60000) ||
    !allowRequest("resource-exam-global", Date.now(), 600, 60000)
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
  return json(gradeExam(parsed.data.answers));
}
