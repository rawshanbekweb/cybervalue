"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { lockFileChanges } from "@/lib/stored-files";
import { allowRequest } from "@/lib/rate-limit";

export async function deleteStoredFileAction(
  id: string,
  _state: { error: string } | undefined,
): Promise<{ error: string } | undefined> {
  void _state;
  const session = await requireAdmin("/admin/files");
  if (!allowRequest(`admin-write:${session.user.id}`, Date.now(), 60, 60_000))
    return { error: "Too many changes. Try again shortly." };
  const db = getDb();
  if (!db) return { error: "Storage is unavailable." };
  try {
    const deleted = await db.$transaction(async (tx) => {
      await lockFileChanges(tx);
      const file = await tx.storedFile.findUnique({
        where: { id },
        select: { path: true },
      });
      if (!file) return true;
      const resources = await tx.resource.count({
        where: { filePath: file.path },
      });
      const images = await tx.contentImage.count({
        where: { path: file.path },
      });
      if (resources || images) return false;
      await tx.storedFile.delete({ where: { id } });
      return true;
    });
    if (!deleted)
      return {
        error:
          "This file is attached to content. Remove its references and save those entries before deleting it.",
      };
    revalidatePath("/admin/files");
  } catch {
    return { error: "File could not be deleted. Try again." };
  }
}
