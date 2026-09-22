import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { allowRequest } from "@/lib/rate-limit";
import {
  MAX_STORAGE_BYTES,
  prepareUpload,
  readUploadBody,
  UploadError,
} from "@/lib/upload-validation";
import { lockFileChanges, storedFileSelect } from "@/lib/stored-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const json = (value: unknown, status = 200) =>
    Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return json({ error: "Request origin is not allowed." }, 403);
  const session = await getSession();
  if (!session) return json({ error: "Sign in before uploading." }, 401);
  if (!allowRequest(`upload:${session.user.id}`, Date.now(), 15, 60_000))
    return json({ error: "Too many uploads. Try again shortly." }, 429);
  const db = getDb();
  if (!db) return json({ error: "Storage is unavailable." }, 503);
  try {
    const name = decodeURIComponent(request.headers.get("x-file-name") ?? "");
    if (!name || name.length > 255)
      throw new UploadError("Choose a file with a name under 256 characters.");
    const bytes = await readUploadBody(request);
    const data = await prepareUpload(
      name,
      request.headers.get("x-file-kind") ?? "",
      bytes,
    );
    const file = await db.$transaction(async (tx) => {
      await lockFileChanges(tx);
      const usage = await tx.storedFile.aggregate({ _sum: { size: true } });
      if ((usage._sum.size ?? 0) + data.size > MAX_STORAGE_BYTES)
        throw new UploadError(
          "Storage is full (250 MiB). Delete unused files first.",
        );
      return tx.storedFile.create({ data, select: storedFileSelect });
    });
    return json({ file }, 201);
  } catch (error) {
    return json(
      {
        error:
          error instanceof UploadError
            ? error.message
            : "Upload failed. Please try again.",
      },
      error instanceof UploadError ? 400 : 500,
    );
  }
}
