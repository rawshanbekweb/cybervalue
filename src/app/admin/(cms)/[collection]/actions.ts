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
  ContentWriteError,
} from "@/lib/content-write";
import { allowRequest } from "@/lib/rate-limit";
import { collections, isCollection, type Collection } from "@/lib/site";
import { publicationStatusSchema } from "@/lib/admin-query";

export type FormState = { error: string } | undefined;

function revalidateCollection(collection: Collection, slug?: string) {
  revalidatePath("/");
  revalidatePath(`/${collection}`);
  if (slug) revalidatePath(`/${collection}/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/search");
  revalidatePath("/activity");
  revalidatePath("/admin");
  revalidatePath(`/admin/${collection}`);
}

function writeError(error: unknown) {
  if (error instanceof ContentWriteError) return error.message;
  if (error && typeof error === "object" && "code" in error) {
    if (error.code === "P2002")
      return "This slug is already in use. Choose another slug.";
    if (error.code === "P2025")
      return "This entry changed or was deleted. Reload the page and try again.";
  }
  return "The change could not be saved. Please try again.";
}

export async function saveContentAction(
  collection: string,
  entryId: string | null,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin(`/admin/${collection}`);
  if (!isCollection(collection)) return { error: "Unknown collection." };
  if (!allowRequest(`admin-write:${session.user.id}`, Date.now(), 60, 60_000))
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
    const entry = await writeContent(
      db,
      parsed.data,
      session.user.id,
      entryId ? { mode: "edit", id: entryId } : { mode: "create" },
    );
    revalidateCollection(collection, entry.slug);
  } catch (error) {
    return {
      error: writeError(error),
    };
  }
  redirect(`/admin/${collection}`);
}

export async function changeContentAction(
  collection: string,
  id: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin(`/admin/${collection}`);
  if (!isCollection(collection)) return { error: "Unknown collection." };
  if (!allowRequest(`admin-write:${session.user.id}`, Date.now(), 60, 60_000))
    return { error: "Too many changes. Try again shortly." };
  const db = getDb();
  if (!db) return { error: "Database is not configured." };
  const operation = formData.get("operation");
  const status = publicationStatusSchema.safeParse(operation);
  if (operation !== "delete" && !status.success)
    return { error: "Unknown action." };
  try {
    const kind = collections[collection].kind;
    const entry =
      operation === "delete"
        ? await deleteContent(db, id, kind)
        : await setContentStatus(db, id, status.data!, kind);
    revalidateCollection(collection, entry.slug);
  } catch (error) {
    return { error: writeError(error) };
  }
  return undefined;
}
