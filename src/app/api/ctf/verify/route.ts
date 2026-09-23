import "server-only";
import { gradeFlag } from "@/lib/ctf/grading";
import { allowRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const reply = (body: unknown, status: number) =>
    Response.json(body, {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(status === 429 ? { "Retry-After": "60" } : {}),
      },
    });
  if (!allowRequest("ctf:verify:global", Date.now(), 600, 60000))
    return reply(
      {
        ok: false,
        message: "So‘rovlar ko‘paydi. Bir daqiqadan keyin yana urinib ko‘ring.",
      },
      429,
    );
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    return reply({ ok: false, message: "JSON so‘rovi kerak." }, 415);
  if (!request.body || Number(request.headers.get("content-length")) > 4096)
    return reply({ ok: false, message: "So‘rov hajmi noto‘g‘ri." }, 413);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        return reply(
          { ok: false, message: "So‘rov 4 KiB dan oshmasligi kerak." },
          413,
        );
      }
      chunks.push(value);
    }
    const input: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const result = gradeFlag(input);
    return reply(result.body, result.status);
  } catch {
    return reply(
      {
        ok: false,
        message: "So‘rovni o‘qib bo‘lmadi. JSON formatini tekshiring.",
      },
      400,
    );
  } finally {
    reader.releaseLock();
  }
}
