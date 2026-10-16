"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function resolveErrorAction(id: string) {
  await requireAdmin("/admin/errors");
  await getDb()
    ?.errorEvent.update({ where: { id }, data: { resolvedAt: new Date() } })
    .catch(() => null);
  revalidatePath("/admin/errors");
}

export async function resolveAllErrorsAction() {
  await requireAdmin("/admin/errors");
  await getDb()?.errorEvent.updateMany({
    where: { resolvedAt: null },
    data: { resolvedAt: new Date() },
  });
  revalidatePath("/admin/errors");
}
