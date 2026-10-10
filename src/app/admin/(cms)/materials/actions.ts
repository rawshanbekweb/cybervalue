"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import {
  checkMaterial,
  MATERIAL_KIND_VALUES,
  type MaterialFormValues,
} from "@/lib/student/admin";
import { newChallengeSecret } from "@/lib/student/challenge";

type Values = Record<string, number | string>;
const NO_DB = "Database is not configured.";

export type MaterialFormState =
  | {
      error?: string;
      values?: Values;
      success?: string;
      input?: MaterialFormValues;
      at?: number;
    }
  | undefined;

const text = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
};

export async function saveMaterialAction(
  id: string | null,
  _state: MaterialFormState,
  form: FormData,
): Promise<MaterialFormState> {
  const session = await requireAdmin("/admin/materials");
  const kind = text(form, "kind");
  const input: MaterialFormValues = {
    slug: text(form, "slug"),
    kind: MATERIAL_KIND_VALUES.find((k) => k === kind) ?? "LESSON",
    title: text(form, "title"),
    summary: text(form, "summary"),
    body: text(form, "body"),
    quizText: text(form, "quizText"),
    artifact: text(form, "artifact"),
    artifactName: text(form, "artifactName"),
    explanation: text(form, "explanation"),
    maxAttempts: Number(text(form, "maxAttempts")) || 0,
    groups: text(form, "groups"),
    position: Number(text(form, "position")) || 0,
    published: form.get("published") === "on",
  };
  const reject = (error: string, values?: Values) => ({
    error,
    values,
    input,
    at: Date.now(),
  });
  const checked = checkMaterial({ ...input, kind });
  if ("error" in checked) return reject(checked.error, checked.values);
  const db = getDb();
  if (!db) return reject(NO_DB);
  const { quiz, ...fields } = checked.data;
  const data = { ...fields, quiz: quiz ?? Prisma.DbNull };
  let saved;
  try {
    saved = id
      ? await db.studentMaterial.update({ where: { id }, data })
      : await db.studentMaterial.create({ data });
    // The secret is made once and kept, so editing the template never
    // changes flags that students already found.
    if (saved.kind === "CHALLENGE" && !saved.secret)
      saved = await db.studentMaterial.update({
        where: { id: saved.id },
        data: { secret: newChallengeSecret() },
      });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return reject("Another material already uses this slug.");
    throw error;
  }
  await audit(
    id ? "material.update" : "material.create",
    session.user.id,
    saved.slug,
  );
  revalidatePath("/admin/materials");
  revalidatePath("/student", "layout");
  if (!id) redirect(`/admin/materials/${saved.id}?created=1`);
  revalidatePath(`/admin/materials/${saved.id}`);
  return { success: "Saved." };
}

export async function deleteMaterialAction(id: string) {
  const session = await requireAdmin("/admin/materials");
  const db = getDb();
  if (!db) return;
  const material = await db.studentMaterial
    .delete({ where: { id } })
    .catch(() => null);
  if (material) await audit("material.delete", session.user.id, material.slug);
  revalidatePath("/admin/materials");
  revalidatePath("/student", "layout");
  redirect("/admin/materials");
}

export type ReviewState = { error?: string; success?: string } | undefined;

export async function reviewSubmissionAction(
  id: string,
  _state: ReviewState,
  form: FormData,
): Promise<ReviewState> {
  const session = await requireAdmin("/admin/materials");
  const parsed = z
    .object({
      score: z.union([
        z.literal("").transform(() => null),
        z.coerce.number().int().min(0).max(100),
      ]),
      feedback: z.string().trim().max(5000),
    })
    .safeParse({
      score: form.get("score") ?? "",
      feedback: form.get("feedback") ?? "",
    });
  if (!parsed.success)
    return { error: "Score: a whole number 0–100, or leave it empty." };
  const db = getDb();
  if (!db) return { error: NO_DB };
  // Quiz and personal-lab scores come from the server and are never
  // overwritten here.
  const submission = await db.studentSubmission.findUnique({
    where: { id },
    include: { material: { select: { id: true, slug: true, kind: true } } },
  });
  if (submission?.material.kind !== "PRACTICE")
    return { error: "Only practice answers can be reviewed." };
  await db.studentSubmission.update({
    where: { id },
    data: {
      score: parsed.data.score,
      maxScore: parsed.data.score === null ? null : 100,
      feedback: parsed.data.feedback,
      reviewedAt: new Date(),
    },
  });
  await audit("submission.review", session.user.id, submission.material.slug);
  revalidatePath(`/admin/materials/${submission.material.id}`);
  revalidatePath(`/admin/students/${submission.studentId}`);
  revalidatePath("/student", "layout");
  return { success: "Review saved." };
}
