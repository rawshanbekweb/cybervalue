"use server";
import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import {
  claimChallengeAttempt,
  endChallenge,
  startChallenge,
  verifySecondFactor,
} from "@/lib/mfa";
import { clientKey } from "@/lib/rate-limit";
import { limit, resetLimit } from "@/lib/rate-limit-db";
import { loginSchema } from "@/lib/validation";

export type LoginState = { error?: string; step?: "code" } | undefined;

// Precomputed once so a nonexistent email takes roughly the same time to
// reject as a wrong password, avoiding an account-enumeration timing signal.
const DUMMY_HASH = hashPassword(randomBytes(32).toString("hex"));
const GENERIC_ERROR = "Invalid email or password.";
const RATE_ERROR = "Too many attempts. Try again in a few minutes.";

const safeNext = (next: FormDataEntryValue | null) =>
  typeof next === "string" && next.startsWith("/admin") ? next : "/admin";

export async function loginAction(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // Per-client budget so one attacker cannot lock the admin out; the global
  // ceiling still bounds distributed guessing.
  const client = clientKey((await headers()).get("x-forwarded-for"));
  if (
    !(await limit(`admin-login:${client}`, 10, 5 * 60_000)) ||
    !(await limit("admin-login:global", 100, 5 * 60_000))
  )
    return { error: RATE_ERROR };

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: GENERIC_ERROR };

  const db = getDb();
  const user = db
    ? await db.user.findUnique({ where: { email: parsed.data.email } })
    : null;
  const ok = verifyPassword(
    parsed.data.password,
    user?.passwordHash ?? DUMMY_HASH,
  );
  if (!user?.passwordHash || !ok) {
    await audit("login.failure", user?.id ?? null, parsed.data.email);
    return { error: GENERIC_ERROR };
  }

  // The global ceiling is not reset, so it still bounds distributed guessing.
  await resetLimit(`admin-login:${client}`);
  if (user.totpSecret) {
    await startChallenge(user.id);
    return { step: "code" };
  }
  await createSession(user.id);
  await audit("login.success", user.id);
  redirect(safeNext(formData.get("next")));
}

export async function verifyCodeAction(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const client = clientKey((await headers()).get("x-forwarded-for"));
  if (!(await limit(`admin-mfa:${client}`, 10, 5 * 60_000)))
    return { step: "code", error: RATE_ERROR };
  const code = formData.get("code");
  const challenge = await claimChallengeAttempt();
  if (!challenge) {
    await endChallenge();
    return { error: "Sign-in expired. Enter your password again." };
  }
  const factor =
    typeof code === "string" && code.length <= 32
      ? await verifySecondFactor(challenge.user, code)
      : null;
  if (!factor) {
    await audit("login.mfa_failure", challenge.userId);
    return { step: "code", error: "That code is not valid." };
  }
  await endChallenge();
  await resetLimit(`admin-mfa:${client}`);
  await createSession(challenge.userId);
  await audit(
    factor === "recovery" ? "login.recovery_code" : "login.success",
    challenge.userId,
  );
  redirect(safeNext(formData.get("next")));
}

export async function cancelChallengeAction() {
  await endChallenge();
  redirect("/admin/login");
}
