"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import {
  mayUseGroup,
  requireMember,
  rosterOutsideScope,
} from "@/lib/staff-guard";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { trashPeople } from "@/lib/trash";
import { limit } from "@/lib/rate-limit-db";
import { parseRoster } from "@/lib/student/admin";
import { hashSecret, newJuniorCode } from "@/lib/junior/codes";

const NO_DB = "Database is not configured.";

export type CreateKidsState =
  | {
      error?: string;
      values?: Record<string, number | string>;
      codes?: { id: string; name: string; group: string; code: string }[];
    }
  | undefined;

// Codes are shown once; only their digests are stored.
export async function createKidsAction(
  _state: CreateKidsState,
  form: FormData,
): Promise<CreateKidsState> {
  const { session, scope } = await requireStaff("/admin/kids");
  if (!(await limit(`kids-create:${session.user.id}`, 10, 60_000)))
    return { error: "Wait a moment and try again." };
  const raw = form.get("roster");
  if (typeof raw !== "string" || raw.length > 25_000)
    return { error: "Check the list and the date." };
  const roster = parseRoster(raw);
  if ("error" in roster) return roster;
  const outside = rosterOutsideScope(scope, roster.students);
  if (outside)
    return {
      error: "You can only add people to your own groups (not “{group}”).",
      values: { group: outside },
    };
  const db = getDb();
  if (!db) return { error: NO_DB };
  const rows = roster.students.map((s) => ({ ...s, code: newJuniorCode() }));
  const created = await db.$transaction(
    rows.map((row) =>
      db.kidsMember.create({
        data: {
          name: row.name,
          group: row.group,
          codeHash: hashSecret(row.code),
        },
        select: { id: true },
      }),
    ),
  );
  await audit(
    "kids.create",
    session.user.id,
    `${rows.length}: ${rows.map((r) => r.name).join(", ")}`,
  );
  revalidatePath("/admin/kids");
  return { codes: rows.map((row, i) => ({ ...row, id: created[i].id })) };
}

const updateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  group: z
    .string()
    .trim()
    .max(40)
    .regex(/^[\p{L}\p{N} ._-]*$/u),
  note: z.string().max(2000),
  active: z.boolean(),
});

export type KidsFormState =
  { error?: string; success?: string; code?: string } | undefined;

export async function updateKidAction(
  id: string,
  _state: KidsFormState,
  form: FormData,
): Promise<KidsFormState> {
  const session = await requireMember("kids", id, `/admin/kids/${id}`);
  const parsed = updateSchema.safeParse({
    name: form.get("name"),
    group: form.get("group") ?? "",
    note: form.get("note") ?? "",
    active: form.get("active") === "on",
  });
  if (!parsed.success)
    return {
      error:
        "Name is required (up to 100 characters); the group allows letters, digits, spaces, dots, dashes and underscores.",
    };
  if (!(await mayUseGroup(parsed.data.group)))
    return { error: "You can only move people to your own groups." };
  const db = getDb();
  if (!db) return { error: NO_DB };
  const member = await db.kidsMember.update({
    where: { id },
    data: parsed.data,
  });
  // Revoking access also ends every open session at once.
  if (!member.active)
    await db.kidsSession.deleteMany({ where: { memberId: id } });
  await audit("kids.update", session.user.id, member.name);
  revalidatePath("/admin/kids");
  revalidatePath(`/admin/kids/${id}`);
  return { success: "Saved." };
}

export async function resetKidCodeAction(id: string): Promise<KidsFormState> {
  const session = await requireMember("kids", id, `/admin/kids/${id}`);
  const db = getDb();
  if (!db) return { error: NO_DB };
  const code = newJuniorCode();
  const [member] = await db.$transaction([
    db.kidsMember.update({
      where: { id },
      data: { codeHash: hashSecret(code) },
    }),
    db.kidsSession.deleteMany({ where: { memberId: id } }),
  ]);
  await audit("kids.code_reset", session.user.id, member.name);
  return { code };
}

export async function resetKidProgressAction(id: string) {
  const session = await requireMember("kids", id, `/admin/kids/${id}`);
  const db = getDb();
  if (!db) return;
  const member = await db.kidsMember.update({
    where: { id },
    data: { progress: {}, xp: 0 },
  });
  await audit("kids.progress_reset", session.user.id, member.name);
  revalidatePath("/admin/kids");
  revalidatePath(`/admin/kids/${id}`);
}

export async function deleteKidAction(id: string) {
  const session = await requireMember("kids", id, "/admin/kids");
  const db = getDb();
  if (!db) return;
  const member = await db.kidsMember.findUnique({
    where: { id },
    select: { name: true },
  });
  if (member && (await trashPeople(db, { kids: [id] }, session.user.id)))
    await audit("kids.delete", session.user.id, member.name);
  revalidatePath("/admin/trash");
  revalidatePath("/admin/kids");
  redirect("/admin/kids");
}
