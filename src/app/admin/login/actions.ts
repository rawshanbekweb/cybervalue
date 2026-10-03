"use server";
import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { allowRequest, clientKey } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export type LoginState = { error: string } | undefined;

// Precomputed once so a nonexistent email takes roughly the same time to
// reject as a wrong password, avoiding an account-enumeration timing signal.
const DUMMY_HASH = hashPassword(randomBytes(32).toString("hex"));
const GENERIC_ERROR = "Invalid email or password.";

export async function loginAction(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // Per-client budget so one attacker cannot lock the admin out; the global
  // ceiling still bounds distributed guessing.
  const client = clientKey((await headers()).get("x-forwarded-for"));
  if (
    !allowRequest(`admin-login:${client}`, Date.now(), 10, 5 * 60_000) ||
    !allowRequest("admin-login:global", Date.now(), 100, 5 * 60_000)
  )
    return { error: "Too many attempts. Try again in a few minutes." };

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
  if (!user?.passwordHash || !ok) return { error: GENERIC_ERROR };

  await createSession(user.id);
  const next = formData.get("next");
  redirect(
    typeof next === "string" && next.startsWith("/admin") ? next : "/admin",
  );
}
