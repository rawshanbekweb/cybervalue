"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { mfaAvailable, seal, unseal, verifySecondFactor } from "@/lib/mfa";
import { verifyPassword } from "@/lib/password";
import { limit } from "@/lib/rate-limit-db";
import {
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCode,
  verifyTotp,
} from "@/lib/totp";

export type MfaState =
  { error?: string; success?: string; recoveryCodes?: string[] } | undefined;

const PATH = "/admin/account";
const RATE_ERROR = "Too many attempts. Try again in a few minutes.";

export async function startMfaAction(): Promise<MfaState> {
  const session = await requireAdmin(PATH);
  const db = getDb();
  if (!db || !mfaAvailable())
    return { error: "Set AUTH_SECRET on the server to enable 2FA." };
  if (session.user.totpSecret) return { error: "2FA is already enabled." };
  await db.user.update({
    where: { id: session.user.id },
    data: { totpPendingSecret: seal(generateTotpSecret()) },
  });
  revalidatePath(PATH);
  return undefined;
}

export async function cancelMfaAction() {
  const session = await requireAdmin(PATH);
  await getDb()?.user.update({
    where: { id: session.user.id },
    data: { totpPendingSecret: null },
  });
  revalidatePath(PATH);
}

export async function confirmMfaAction(
  _state: MfaState,
  formData: FormData,
): Promise<MfaState> {
  const session = await requireAdmin(PATH);
  if (!(await limit(`mfa-confirm:${session.user.id}`, 10, 5 * 60_000)))
    return { error: RATE_ERROR };
  const db = getDb();
  const pending = session.user.totpPendingSecret;
  if (!db || !pending) return { error: "Start 2FA setup again." };
  const code = z.string().max(16).safeParse(formData.get("code"));
  let secret: string;
  try {
    secret = unseal(pending);
  } catch {
    return { error: "Start 2FA setup again." };
  }
  const step = code.success ? verifyTotp(secret, code.data, null) : null;
  if (step === null)
    return { error: "That code is not valid. Check your device clock." };
  const recoveryCodes = generateRecoveryCodes();
  const { count } = await db.user.updateMany({
    where: { id: session.user.id, totpPendingSecret: pending },
    data: {
      totpSecret: pending,
      totpPendingSecret: null,
      totpLastStep: step,
      recoveryCodes: recoveryCodes.map(hashRecoveryCode),
    },
  });
  if (count !== 1) return { error: "Start 2FA setup again." };
  // Other sessions were authenticated without the new factor.
  await db.session.deleteMany({
    where: { userId: session.user.id, id: { not: session.id } },
  });
  await audit("mfa.enable", session.user.id);
  revalidatePath(PATH);
  return { success: "Two-factor authentication is on.", recoveryCodes };
}

export async function disableMfaAction(
  _state: MfaState,
  formData: FormData,
): Promise<MfaState> {
  const session = await requireAdmin(PATH);
  if (!(await limit(`mfa-disable:${session.user.id}`, 5, 5 * 60_000)))
    return { error: RATE_ERROR };
  const db = getDb();
  if (!db || !session.user.totpSecret) return { error: "2FA is not enabled." };
  const password = formData.get("password");
  const code = formData.get("code");
  if (
    typeof password !== "string" ||
    password.length > 200 ||
    !verifyPassword(password, session.user.passwordHash ?? "")
  )
    return { error: "Current password is incorrect." };
  if (
    typeof code !== "string" ||
    code.length > 32 ||
    !(await verifySecondFactor(session.user, code))
  )
    return { error: "That code is not valid." };
  await db.user.update({
    where: { id: session.user.id },
    data: {
      totpSecret: null,
      totpPendingSecret: null,
      totpLastStep: null,
      recoveryCodes: [],
    },
  });
  await audit("mfa.disable", session.user.id);
  revalidatePath(PATH);
  return { success: "Two-factor authentication is off." };
}
