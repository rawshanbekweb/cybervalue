"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireMember } from "@/lib/staff-guard";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { hashSecret, newJuniorCode } from "@/lib/junior/codes";

export type PromoteKidState =
  { error?: string; code?: string; juniorId?: string } | undefined;

const groupName = z
  .string()
  .trim()
  .max(40)
  .regex(/^[\p{L}\p{N} ._-]*$/u);

// Academy Kids → Academy Junior in one step: a Junior account with the same
// name, the parent report link and parent chats moved over, and the Kids XP
// noted for the teacher.
export async function promoteKidAction(
  id: string,
  _state: PromoteKidState,
  form: FormData,
): Promise<PromoteKidState> {
  const session = await requireMember("kids", id, `/admin/kids/${id}`);
  const group = groupName.safeParse(form.get("group") ?? "");
  if (!group.success)
    return {
      error:
        "Group: up to 40 letters, digits, spaces, dots, dashes or underscores.",
    };
  const db = getDb();
  if (!db) return { error: "Database is not configured." };
  const kid = await db.kidsMember.findUnique({ where: { id } });
  if (!kid) return { error: "This child no longer exists." };
  if (kid.juniorId)
    return { error: "This child already has a Junior account." };
  const code = newJuniorCode();
  const junior = await db.$transaction(async (tx) => {
    // The report token is unique, so it leaves the Kids account first.
    await tx.kidsMember.update({
      where: { id },
      data: { reportToken: null },
    });
    const created = await tx.juniorMember.create({
      data: {
        name: kid.name,
        group: group.data,
        codeHash: hashSecret(code),
        note: `Academy Kids → Junior · ${kid.xp} XP`,
        reportToken: kid.reportToken,
      },
    });
    await tx.telegramChat.updateMany({
      where: { subject: `parent:kids:${id}` },
      data: { subject: `parent:junior:${created.id}` },
    });
    await tx.kidsMember.update({
      where: { id },
      data: {
        juniorId: created.id,
        ...(form.get("close") === "on" ? { active: false } : {}),
      },
    });
    if (form.get("close") === "on")
      await tx.kidsSession.deleteMany({ where: { memberId: id } });
    return created;
  });
  await audit("kids.promote", session.user.id, `${kid.name} → ${junior.id}`);
  revalidatePath(`/admin/kids/${id}`);
  revalidatePath("/admin/junior");
  return { code, juniorId: junior.id };
}
