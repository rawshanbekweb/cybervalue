"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { clientKey } from "@/lib/rate-limit";
import { limit } from "@/lib/rate-limit-db";
import { normalizeAccessCode } from "@/lib/student/access";
import { hashSecret, isJuniorCode } from "@/lib/junior/codes";
import { isGameId } from "@/lib/kids/games";
import {
  createKidsSession,
  destroyKidsSession,
  getKidsMember,
} from "@/lib/kids/session";
import {
  applyKidsUpdate,
  kidsXp,
  restoreKidsProgress,
  type KidsUpdate,
} from "@/lib/kids/progress";

export type KidsLoginState = { error?: string } | undefined;
const GENERIC_ERROR = "This access code is not valid or no longer active.";

// After signing in the child lands on the game they opened.
function returnPath(next: FormDataEntryValue | null) {
  const path =
    typeof next === "string" ? next.replace(/^\/(uz|en)(?=\/)/, "") : "";
  const game = /^\/kids\/([a-z]+)$/.exec(path)?.[1];
  return isGameId(game) ? `/kids/${game}` : "/kids";
}

export async function kidsLoginAction(
  _state: KidsLoginState,
  formData: FormData,
): Promise<KidsLoginState> {
  // A classroom shares one address, so the per-client budget is generous.
  const client = clientKey((await headers()).get("x-forwarded-for"));
  if (
    !(await limit(`kids-login:${client}`, 40, 5 * 60_000)) ||
    !(await limit("kids-login:global", 400, 5 * 60_000))
  )
    return { error: "Too many attempts. Try again in a few minutes." };
  const raw = formData.get("code");
  const code = typeof raw === "string" ? normalizeAccessCode(raw) : "";
  if (!isJuniorCode(code)) return { error: GENERIC_ERROR };
  const db = getDb();
  if (!db) return { error: "The academy is not available right now." };
  const member = await db.kidsMember.findFirst({
    where: { codeHash: hashSecret(code), active: true },
    select: { id: true },
  });
  if (!member) return { error: GENERIC_ERROR };
  await createKidsSession(member.id);
  redirect(returnPath(formData.get("next")));
}

export async function kidsLogoutAction() {
  await destroyKidsSession();
  redirect("/kids");
}

export type KidsSaveResult = { ok: boolean; xp?: number; done?: string[] };

// Saves code, a best score or a finished mission. A mission only counts when
// the evidence passes the same check the game showed.
export async function saveKidsAction(
  update: KidsUpdate,
): Promise<KidsSaveResult> {
  const member = await getKidsMember();
  const db = getDb();
  if (!member || !db) return { ok: false };
  if (!(await limit(`kids-save:${member.id}`, 240, 60_000)))
    return { ok: false };
  if (JSON.stringify(update ?? null).length > 10_000) return { ok: false };
  const next = applyKidsUpdate(restoreKidsProgress(member.progress), update);
  if (!next) return { ok: false };
  const xp = kidsXp(next);
  await db.kidsMember.update({
    where: { id: member.id },
    data: {
      progress: next as unknown as Prisma.InputJsonValue,
      xp,
      lastActiveAt: new Date(),
    },
  });
  return { ok: true, xp, done: next.done };
}
