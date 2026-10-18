"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireMember } from "@/lib/staff-guard";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { juniorRow } from "@/lib/junior/admin";
import { MISSIONS } from "@/lib/junior/content";
import { hashSecret, newAccessCode } from "@/lib/student/access";
import { newCertificateCode } from "@/lib/student/certificate";

export type PromoteState =
  { error?: string; code?: string; studentId?: string } | undefined;

const groupName = z
  .string()
  .trim()
  .max(40)
  .regex(/^[\p{L}\p{N} ._-]*$/u);

// Academy Junior → Academy in one step: a student account with the same name,
// the Junior XP as a starting bonus, the parent report link and parent chats
// moved over, and a certificate when the Junior course was completed.
export async function promoteJuniorAction(
  id: string,
  _state: PromoteState,
  form: FormData,
): Promise<PromoteState> {
  const session = await requireMember("junior", id, `/admin/junior/${id}`);
  const group = groupName.safeParse(form.get("group") ?? "");
  if (!group.success)
    return {
      error:
        "Group: up to 40 letters, digits, spaces, dots, dashes or underscores.",
    };
  const db = getDb();
  if (!db) return { error: "Database is not configured." };
  const member = await db.juniorMember.findUnique({ where: { id } });
  if (!member) return { error: "This member no longer exists." };
  const existing = await db.student.findUnique({
    where: { juniorId: id },
    select: { id: true },
  });
  if (existing) return { error: "This member already has an Academy account." };
  const row = juniorRow(member);
  const code = newAccessCode();
  const completed = row.story || row.missions === MISSIONS.length;
  const student = await db.$transaction(async (tx) => {
    const created = await tx.student.create({
      data: {
        name: member.name,
        group: group.data,
        codeHash: hashSecret(code),
        bonusXp: row.xp,
        juniorId: member.id,
        note: "Academy Junior → Academy",
        expiresAt: member.expiresAt,
        reportToken: member.reportToken,
      },
    });
    await tx.juniorMember.update({
      where: { id },
      data: {
        reportToken: null,
        ...(form.get("close") === "on" ? { active: false } : {}),
      },
    });
    if (form.get("close") === "on")
      await tx.juniorSession.deleteMany({ where: { memberId: id } });
    await tx.telegramChat.updateMany({
      where: { subject: `parent:junior:${id}` },
      data: { subject: `parent:student:${created.id}` },
    });
    if (completed)
      await tx.studentCertificate.create({
        data: {
          code: newCertificateCode(),
          studentId: created.id,
          name: member.name,
          title: "Academy Junior: kiberxavfsizlik asoslari",
          rule: "junior",
        },
      });
    return created;
  });
  await audit("junior.promote", session.user.id, member.name);
  revalidatePath(`/admin/junior/${id}`);
  revalidatePath("/admin/junior");
  revalidatePath("/admin/students");
  revalidatePath("/admin/users");
  return { code, studentId: student.id };
}
