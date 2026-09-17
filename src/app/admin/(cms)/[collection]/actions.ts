"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { contentSchema } from "@/lib/validation";
import { formDataToContentInput } from "@/lib/admin-form";
import {
  writeContent,
  setContentStatus,
  deleteContent,
} from "@/lib/content-write";
import { allowRequest } from "@/lib/rate-limit";
import { isCollection, type Collection } from "@/lib/site";

export type FormState = { error: string } | undefined;

function revalidateCollection(collection: Collection, slug?: string) {
  revalidatePath("/");
  revalidatePath(`/${collection}`);
  if (slug) revalidatePath(`/${collection}/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  revalidatePath(`/admin/${collection}`);
}

export async function saveContentAction(
  collection: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin(`/admin/${collection}`);
  if (!isCollection(collection)) return { error: "Unknown collection." };
  if (!allowRequest("admin-write", Date.now(), 60, 60_000))
    return { error: "Too many changes. Slow down and try again shortly." };

  const db = getDb();
  if (!db) return { error: "Database is not configured." };

  const raw = formDataToContentInput(collection, formData);
  const parsed = contentSchema.safeParse(raw);
  if (!parsed.success)
    return {
      error: parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    };

  try {
    const entry = await writeContent(db, parsed.data, session.user.id);
    revalidateCollection(collection, entry.slug);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Save failed.",
    };
  }
  redirect(`/admin/${collection}`);
}

export async function setStatusAction(
  collection: string,
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
) {
  await requireAdmin(`/admin/${collection}`);
  if (!isCollection(collection)) return;
  const db = getDb();
  if (!db) return;
  const entry = await setContentStatus(db, id, status);
  revalidateCollection(collection, entry.slug);
}

export async function deleteContentAction(collection: string, id: string) {
  await requireAdmin(`/admin/${collection}`);
  if (!isCollection(collection)) return;
  const db = getDb();
  if (!db) return;
  await deleteContent(db, id);
  revalidateCollection(collection);
}
