import { open, realpath } from "node:fs/promises";
import { basename, extname } from "node:path";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getEntry } from "@/lib/content";
import { defaultLocale } from "@/lib/i18n";
import { slugSchema } from "@/lib/validation";
import { downloadFilePath } from "@/lib/files";
import { clientKey } from "@/lib/rate-limit";
import { limit } from "@/lib/rate-limit-db";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const types: Record<string, string> = {
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".zip": "application/zip",
  ".csv": "text/csv",
};
function failure(status: number) {
  return new NextResponse(
    status === 429
      ? "Too many downloads. Try again shortly."
      : "Resource unavailable.",
    {
      status,
      headers: {
        "X-Robots-Tag": "noindex",
        "Cache-Control": "no-store",
        ...(status === 429 ? { "Retry-After": "60" } : {}),
      },
    },
  );
}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  // The per-client budget relies on the host overwriting X-Forwarded-For;
  // the global budget still bounds clients that spoof it.
  if (
    !(await limit(
      `downloads:${clientKey(request.headers.get("x-forwarded-for"))}`,
      10,
    )) ||
    !(await limit("downloads", 120))
  )
    return failure(429);
  const { slug } = await params;
  if (!slugSchema.safeParse(slug).success) return failure(404);
  try {
    // Route handlers cannot read the [lang] root param; the file is the same
    // in every language.
    const entry = await getEntry("RESOURCE", slug, defaultLocale);
    if (!entry?.resource) return failure(404);
    const stored = await getDb()?.storedFile.findUnique({
      where: { path: entry.resource.filePath, kind: "RESOURCE" },
    });
    if (stored)
      return new NextResponse(new Uint8Array(stored.data), {
        headers: {
          "Content-Type": stored.mimeType,
          "Content-Disposition": `attachment; filename="${basename(stored.path)}"; filename*=UTF-8''${encodeURIComponent(stored.name).replace(/'/g, "%27")}`,
          "Content-Length": String(stored.size),
          "X-Content-Type-Options": "nosniff",
          "X-Robots-Tag": "noindex",
          "Cache-Control": "private, no-store",
        },
      });
    const path = downloadFilePath(entry.resource.filePath);
    if ((await realpath(path)) !== path) return failure(404);
    const handle = await open(path, "r");
    try {
      const stat = await handle.stat();
      if (!stat.isFile() || stat.size > 20 * 1024 * 1024) return failure(404);
      const file = await handle.readFile();
      return new NextResponse(file, {
        headers: {
          "Content-Type": types[extname(path)] ?? "application/octet-stream",
          "Content-Disposition": `attachment; filename="${basename(path)}"`,
          "Content-Length": String(file.length),
          "X-Content-Type-Options": "nosniff",
          "X-Robots-Tag": "noindex",
          "Cache-Control": "private, no-store",
          ETag: `"${createHash("sha256").update(file).digest("hex")}"`,
        },
      });
    } finally {
      await handle.close();
    }
  } catch {
    return failure(503);
  }
}
