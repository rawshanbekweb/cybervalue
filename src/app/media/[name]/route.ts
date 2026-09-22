import { getDb } from "@/lib/db";
import { publicWhere } from "@/lib/content";
import { imagePath } from "@/lib/validation";
import { allowRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const headers = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex",
  };
  if (!allowRequest("media-read", Date.now(), 300, 60_000))
    return new Response("Try again shortly.", { status: 429, headers });
  const path = `/media/${(await params).name}`;
  const db = getDb();
  if (!db || !imagePath.safeParse(path).success)
    return new Response("Not found", { status: 404, headers });
  const reference = await db.contentImage.findFirst({
    where: { path, content: publicWhere() },
    select: { id: true },
  });
  if (!reference) return new Response("Not found", { status: 404, headers });
  const file = await db.storedFile.findUnique({
    where: { path, kind: "IMAGE" },
  });
  if (!file) return new Response("Not found", { status: 404, headers });
  return new Response(new Uint8Array(file.data), {
    headers: {
      ...headers,
      "Content-Type": file.mimeType,
      "Content-Length": String(file.size),
    },
  });
}
