"use server";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { HOME_PORTRAIT_KEY } from "@/lib/home-portrait";
import { limit } from "@/lib/rate-limit-db";
import {
  portraitFromForm,
  type PortraitFormState,
} from "@/lib/portrait-upload";

function refresh() {
  // Every language's home page links the portrait by its version.
  revalidatePath("/[lang]", "page");
  revalidatePath("/admin/portrait");
}

export async function saveHomePortraitAction(
  _state: PortraitFormState,
  formData: FormData,
): Promise<PortraitFormState> {
  const session = await requireOwner("/admin/portrait");
  if (!(await limit(`admin-write:${session.user.id}`, 60, 60_000)))
    return { error: "Too many changes. Try again shortly." };
  const db = getDb();
  if (!db) return { error: "Storage is unavailable." };
  const result = await portraitFromForm(formData);
  if ("error" in result) return { error: result.error };
  await db.siteSetting.upsert({
    where: { key: HOME_PORTRAIT_KEY },
    create: { key: HOME_PORTRAIT_KEY, value: result.data },
    update: { value: result.data },
  });
  await audit("portrait.update", session.user.id, "home");
  refresh();
  return { success: "The home page portrait is updated." };
}

export async function resetHomePortraitAction() {
  const session = await requireOwner("/admin/portrait");
  if (!(await limit(`admin-write:${session.user.id}`, 60, 60_000))) return;
  await getDb()?.siteSetting.deleteMany({ where: { key: HOME_PORTRAIT_KEY } });
  await audit("portrait.reset", session.user.id, "home");
  refresh();
}
