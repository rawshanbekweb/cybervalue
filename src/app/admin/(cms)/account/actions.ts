"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { destroySession, requireAdmin } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getDb } from "@/lib/db";
import { allowRequest } from "@/lib/rate-limit";

export type AccountState = { error?: string; success?: string } | undefined;
const passwordSchema = z
  .object({
    current: z.string().min(1).max(200),
    password: z.string().min(12).max(200),
    confirm: z.string().max(200),
  })
  .refine(
    (input) =>
      input.password === input.confirm && input.password !== input.current,
  );

export async function changePasswordAction(
  _state: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await requireAdmin("/admin/account");
  if (
    !allowRequest(`password-change:${session.user.id}`, Date.now(), 5, 300_000)
  )
    return { error: "Too many attempts. Try again in a few minutes." };
  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success)
    return {
      error:
        "Use a new password with 12–200 characters and matching confirmation.",
    };
  if (!verifyPassword(parsed.data.current, session.user.passwordHash ?? ""))
    return { error: "Current password is incorrect." };
  const db = getDb();
  if (!db) return { error: "Account settings are unavailable." };
  try {
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id, passwordHash: session.user.passwordHash },
        data: { passwordHash: hashPassword(parsed.data.password) },
      });
      await tx.session.deleteMany({ where: { userId: session.user.id } });
    });
  } catch {
    return {
      error: "Password could not be changed. Reload the page and try again.",
    };
  }
  await destroySession();
  redirect("/admin/login?changed=1");
}

export async function revokeOtherSessionsAction(
  _state: AccountState,
): Promise<AccountState> {
  void _state;
  const session = await requireAdmin("/admin/account");
  const db = getDb();
  if (!db) return { error: "Account settings are unavailable." };
  try {
    await db.session.deleteMany({
      where: { userId: session.user.id, id: { not: session.id } },
    });
    revalidatePath("/admin/account");
    return { success: "Other sessions have been signed out." };
  } catch {
    return { error: "Sessions could not be revoked. Try again." };
  }
}
