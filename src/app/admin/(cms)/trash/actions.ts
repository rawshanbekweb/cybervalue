"use server";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { requireOwner, requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { mayRestore, restoreTrashItem, RestoreError } from "@/lib/trash";

export type TrashState = { error?: string; success?: string } | undefined;

const NO_DB = "Database is not configured.";

const WHERE: Record<string, string[]> = {
  student: ["/admin/students", "/admin/users", "/admin/class"],
  junior: ["/admin/junior", "/admin/users"],
  kids: ["/admin/kids", "/admin/users"],
  material: ["/admin/materials"],
  assignment: ["/admin/assignments", "/admin/class"],
  content: ["/"],
};

async function findItem(id: string) {
  const { session, scope } = await requireStaff("/admin/trash");
  const db = getDb();
  if (!db) return { error: NO_DB } as const;
  const item = await db.trashItem.findUnique({
    where: { id },
    select: { id: true, kind: true, group: true, label: true },
  });
  if (!item || !mayRestore(scope, item))
    return { error: "This item is no longer in the trash." } as const;
  return { db, session, item } as const;
}

export async function restoreAction(id: string): Promise<TrashState> {
  const found = await findItem(id);
  if ("error" in found) return { error: found.error };
  const { db, session, item } = found;
  if (!(await limit(`admin-write:${session.user.id}`, 60, 60_000)))
    return { error: "Too many changes. Try again shortly." };
  try {
    await restoreTrashItem(db, id, session.user.id);
  } catch (error) {
    if (error instanceof RestoreError) return { error: error.message };
    throw error;
  }
  await audit("trash.restore", session.user.id, `${item.kind}: ${item.label}`);
  revalidatePath("/admin/trash");
  for (const path of WHERE[item.kind] ?? [])
    revalidatePath(path, item.kind === "content" ? "layout" : "page");
  return { success: "Restored." };
}

export async function purgeAction(id: string): Promise<TrashState> {
  const found = await findItem(id);
  if ("error" in found) return { error: found.error };
  const { db, session, item } = found;
  await db.trashItem.delete({ where: { id } }).catch(() => null);
  await audit("trash.purge", session.user.id, `${item.kind}: ${item.label}`);
  revalidatePath("/admin/trash");
  return { success: "Deleted for good." };
}

export async function emptyTrashAction(): Promise<TrashState> {
  const session = await requireOwner("/admin/trash");
  const db = getDb();
  if (!db) return { error: NO_DB };
  const { count } = await db.trashItem.deleteMany({});
  await audit("trash.empty", session.user.id, String(count));
  revalidatePath("/admin/trash");
  return { success: "Deleted for good." };
}
