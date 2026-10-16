"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { clientKey } from "@/lib/rate-limit";
import { limit } from "@/lib/rate-limit-db";
import { normalizeAccessCode } from "@/lib/student/access";
import { hashSecret, isJuniorCode } from "@/lib/junior/codes";
import {
  createJuniorSession,
  destroyJuniorSession,
  getJuniorMember,
} from "@/lib/junior/session";
import { restoreJuniorProgress, withPart, xpOf } from "@/lib/junior/progress";

export type JuniorLoginState = { error?: string } | undefined;
const GENERIC_ERROR = "This access code is not valid or no longer active.";

// After signing in the member lands on the academy page they opened.
const SECTIONS = ["", "/ciphers", "/homework", "/achievements"];
function returnPath(next: FormDataEntryValue | null) {
  const path =
    typeof next === "string" ? next.replace(/^\/(uz|en)(?=\/)/, "") : "";
  const section = SECTIONS.find((s) => path === `/junior${s}`);
  return `/junior${section ?? ""}`;
}

export async function juniorLoginAction(
  _state: JuniorLoginState,
  formData: FormData,
): Promise<JuniorLoginState> {
  // A classroom shares one address, so the per-client budget is generous.
  const client = clientKey((await headers()).get("x-forwarded-for"));
  if (
    !(await limit(`junior-login:${client}`, 40, 5 * 60_000)) ||
    !(await limit("junior-login:global", 400, 5 * 60_000))
  )
    return { error: "Too many attempts. Try again in a few minutes." };
  const raw = formData.get("code");
  const code = typeof raw === "string" ? normalizeAccessCode(raw) : "";
  if (!isJuniorCode(code)) return { error: GENERIC_ERROR };
  const db = getDb();
  if (!db) return { error: "The academy is not available right now." };
  const now = new Date();
  const member = await db.juniorMember.findFirst({
    where: {
      codeHash: hashSecret(code),
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { id: true },
  });
  if (!member) return { error: GENERIC_ERROR };
  await createJuniorSession(member.id);
  redirect(returnPath(formData.get("next")));
}

export async function juniorLogoutAction() {
  await destroyJuniorSession();
  redirect("/junior");
}

export type SaveResult = { ok: boolean; xp?: number };

// Saves one part of the member's progress. It is validated against what a
// real run can produce, and the XP is recomputed here.
export async function saveJuniorPartAction(
  part: string,
  value: unknown,
): Promise<SaveResult> {
  const member = await getJuniorMember();
  const db = getDb();
  if (!member || !db) return { ok: false };
  if (!(await limit(`junior-save:${member.id}`, 240, 60_000)))
    return { ok: false };
  if (JSON.stringify(value ?? null).length > 20_000) return { ok: false };
  const next = withPart(restoreJuniorProgress(member.progress), part, value);
  if (!next) return { ok: false };
  const xp = xpOf(next);
  await db.juniorMember.update({
    where: { id: member.id },
    data: {
      progress: next as unknown as Prisma.InputJsonValue,
      xp,
      codename: next.agent.name,
      lastActiveAt: new Date(),
    },
  });
  return { ok: true, xp };
}
