"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { parseRoster, rosterOptionsSchema } from "@/lib/student/admin";
import { hashSecret, newJuniorCode } from "@/lib/junior/codes";
import { juniorUpdateSchema } from "@/lib/junior/admin";

type Values = Record<string, number | string>;
const NO_DB = "Database is not configured.";

export type CreateJuniorsState =
  | {
      error?: string;
      values?: Values;
      codes?: { id: string; name: string; group: string; code: string }[];
    }
  | undefined;

// Codes are shown once; only their digests are stored.
export async function createJuniorsAction(
  _state: CreateJuniorsState,
  form: FormData,
): Promise<CreateJuniorsState> {
  const session = await requireAdmin("/admin/junior");
  if (!(await limit(`junior-create:${session.user.id}`, 10, 60_000)))
    return { error: "Wait a moment and try again." };
  const options = rosterOptionsSchema.safeParse({
    roster: form.get("roster"),
    expiresAt: form.get("expiresAt") ?? "",
  });
  if (!options.success) return { error: "Check the list and the date." };
  const roster = parseRoster(options.data.roster);
  if ("error" in roster) return roster;
  const db = getDb();
  if (!db) return { error: NO_DB };
  const rows = roster.students.map((s) => ({ ...s, code: newJuniorCode() }));
  const created = await db.$transaction(
    rows.map((row) =>
      db.juniorMember.create({
        data: {
          name: row.name,
          group: row.group,
          codeHash: hashSecret(row.code),
          expiresAt: options.data.expiresAt,
        },
        select: { id: true },
      }),
    ),
  );
  await audit(
    "junior.create",
    session.user.id,
    `${rows.length}: ${rows.map((r) => r.name).join(", ")}`,
  );
  revalidatePath("/admin/junior");
  return { codes: rows.map((row, i) => ({ ...row, id: created[i].id })) };
}

export type JuniorFormState =
  { error?: string; success?: string; code?: string } | undefined;

export async function updateJuniorAction(
  id: string,
  _state: JuniorFormState,
  form: FormData,
): Promise<JuniorFormState> {
  const session = await requireAdmin(`/admin/junior/${id}`);
  const parsed = juniorUpdateSchema.safeParse({
    name: form.get("name"),
    group: form.get("group") ?? "",
    note: form.get("note") ?? "",
    active: form.get("active") === "on",
    expiresAt: form.get("expiresAt") ?? "",
  });
  if (!parsed.success)
    return {
      error:
        "Name is required (up to 100 characters); the group allows letters, digits, spaces, dots, dashes and underscores.",
    };
  const db = getDb();
  if (!db) return { error: NO_DB };
  const member = await db.juniorMember.update({
    where: { id },
    data: parsed.data,
  });
  // Revoking access also ends every open session at once.
  if (!member.active)
    await db.juniorSession.deleteMany({ where: { memberId: id } });
  await audit("junior.update", session.user.id, member.name);
  revalidatePath("/admin/junior");
  revalidatePath(`/admin/junior/${id}`);
  return { success: "Saved." };
}

export async function resetJuniorCodeAction(
  id: string,
): Promise<JuniorFormState> {
  const session = await requireAdmin(`/admin/junior/${id}`);
  const db = getDb();
  if (!db) return { error: NO_DB };
  const code = newJuniorCode();
  const [member] = await db.$transaction([
    db.juniorMember.update({
      where: { id },
      data: { codeHash: hashSecret(code) },
    }),
    db.juniorSession.deleteMany({ where: { memberId: id } }),
  ]);
  await audit("junior.code_reset", session.user.id, member.name);
  return { code };
}

export async function signOutJuniorAction(id: string) {
  await requireAdmin(`/admin/junior/${id}`);
  await getDb()?.juniorSession.deleteMany({ where: { memberId: id } });
  revalidatePath(`/admin/junior/${id}`);
}

export async function resetJuniorProgressAction(id: string) {
  const session = await requireAdmin(`/admin/junior/${id}`);
  const db = getDb();
  if (!db) return;
  const member = await db.juniorMember.update({
    where: { id },
    data: { progress: {}, xp: 0, codename: "" },
  });
  await audit("junior.progress_reset", session.user.id, member.name);
  revalidatePath("/admin/junior");
  revalidatePath(`/admin/junior/${id}`);
}

export async function deleteJuniorAction(id: string) {
  const session = await requireAdmin("/admin/junior");
  const db = getDb();
  if (!db) return;
  const member = await db.juniorMember
    .delete({ where: { id } })
    .catch(() => null);
  if (member) await audit("junior.delete", session.user.id, member.name);
  revalidatePath("/admin/junior");
  redirect("/admin/junior");
}
