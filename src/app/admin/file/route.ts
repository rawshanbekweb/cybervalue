import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { basename } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex",
  };
  if (!(await getSession()))
    return new Response("Sign in required", { status: 401, headers });
  const path = new URL(request.url).searchParams.get("path") ?? "";
  const db = getDb();
  const file =
    path.length <= 200 && db
      ? await db.storedFile.findUnique({ where: { path } })
      : null;
  if (!file) return new Response("Not found", { status: 404, headers });
  return new Response(new Uint8Array(file.data), {
    headers: {
      ...headers,
      "Content-Type": file.mimeType,
      "Content-Length": String(file.size),
      "Content-Disposition": `${file.kind === "IMAGE" ? "inline" : "attachment"}; filename="${basename(file.path)}"`,
    },
  });
}
