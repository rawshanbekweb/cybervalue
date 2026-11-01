"use server";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";

const PATH = "/admin/ctf/players";

/** Blocks or unblocks a player; blocking also ends every session. */
export async function setPlayerActiveAction(id: string, active: boolean) {
  const session = await requireOwner(PATH);
  if (!(await limit(`admin-write:${session.user.id}`, 60, 60_000))) return;
  const db = getDb();
  if (!db) return;
  await db.$transaction([
    db.ctfPlayer.update({ where: { id }, data: { active } }),
    ...(active ? [] : [db.ctfSession.deleteMany({ where: { playerId: id } })]),
  ]);
  await audit("ctf.player_update", session.user.id, id);
  revalidatePath(PATH);
}

/** Confirms the address by hand, e.g. when the mail never arrived. */
export async function confirmPlayerEmailAction(id: string) {
  const session = await requireOwner(PATH);
  if (!(await limit(`admin-write:${session.user.id}`, 60, 60_000))) return;
  await getDb()?.ctfPlayer.updateMany({
    where: { id, emailVerifiedAt: null },
    data: { emailVerifiedAt: new Date() },
  });
  await audit("ctf.player_update", session.user.id, id);
  revalidatePath(PATH);
}

export async function deletePlayerAction(id: string) {
  const session = await requireOwner(PATH);
  if (!(await limit(`admin-write:${session.user.id}`, 60, 60_000))) return;
  await getDb()?.ctfPlayer.deleteMany({ where: { id } });
  await audit("ctf.player_delete", session.user.id, id);
  revalidatePath(PATH);
}
