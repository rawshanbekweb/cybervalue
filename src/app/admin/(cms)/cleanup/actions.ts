"use server";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { isCleanupId, runCleanup } from "@/lib/admin/cleanup";

export type CleanupState =
  | { error?: string; success?: string; values?: Record<string, number> }
  | undefined;

export async function cleanupAction(id: string): Promise<CleanupState> {
  const session = await requireAdmin("/admin/cleanup");
  if (!isCleanupId(id)) return { error: "Unknown clean-up." };
  if (!(await limit(`admin-write:${session.user.id}`, 60, 60_000)))
    return { error: "Too many changes. Try again shortly." };
  const db = getDb();
  if (!db) return { error: "Database is not configured." };
  const count = await runCleanup(db, id);
  await audit("cleanup.run", session.user.id, `${id}: ${count}`);
  revalidatePath("/admin", "layout");
  return { success: "Deleted {count} items.", values: { count } };
}
