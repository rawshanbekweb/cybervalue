"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";

export type GroupState = { error?: string; success?: string } | undefined;

const NO_DB = "Database is not configured.";
const groupName = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(/^[\p{L}\p{N} ._-]+$/u);

const swap = (list: string[], from: string, to: string) => [
  ...new Set(list.map((g) => (g === from ? to : g))),
];

// Renames a group everywhere it is used: people, assignments, materials and
// teachers. Renaming onto an existing name merges the two groups.
export async function renameGroupAction(
  from: string,
  _state: GroupState,
  form: FormData,
): Promise<GroupState> {
  const session = await requireOwner("/admin/groups");
  const parsed = groupName.safeParse(form.get("name"));
  if (!parsed.success)
    return {
      error:
        "Groups allow letters, digits, spaces, dots, dashes and underscores (up to 40 each).",
    };
  const to = parsed.data;
  if (to === from) return { success: "Saved." };
  const db = getDb();
  if (!db) return { error: NO_DB };
  const [materials, teachers] = await Promise.all([
    db.studentMaterial.findMany({
      where: { groups: { has: from } },
      select: { id: true, groups: true },
    }),
    db.user.findMany({
      where: { groups: { has: from } },
      select: { id: true, groups: true },
    }),
  ]);
  await db.$transaction([
    db.student.updateMany({ where: { group: from }, data: { group: to } }),
    db.juniorMember.updateMany({ where: { group: from }, data: { group: to } }),
    db.kidsMember.updateMany({ where: { group: from }, data: { group: to } }),
    db.studentAssignment.updateMany({
      where: { group: from },
      data: { group: to },
    }),
    ...materials.map((m) =>
      db.studentMaterial.update({
        where: { id: m.id },
        data: { groups: swap(m.groups, from, to) },
      }),
    ),
    ...teachers.map((u) =>
      db.user.update({
        where: { id: u.id },
        data: { groups: swap(u.groups, from, to) },
      }),
    ),
  ]);
  await audit("group.rename", session.user.id, `${from} → ${to}`);
  revalidatePath("/admin", "layout");
  return { success: "Saved." };
}

// Sets exactly which teachers work with a group.
export async function setGroupTeachersAction(
  group: string,
  _state: GroupState,
  form: FormData,
): Promise<GroupState> {
  const session = await requireOwner("/admin/groups");
  const db = getDb();
  if (!db) return { error: NO_DB };
  const chosen = new Set(form.getAll("teacher").map(String));
  const teachers = await db.user.findMany({
    where: { role: "teacher" },
    select: { id: true, groups: true },
  });
  const changes = teachers.flatMap((u) => {
    const has = u.groups.includes(group);
    const wants = chosen.has(u.id);
    if (has === wants) return [];
    const groups = wants
      ? [...u.groups, group]
      : u.groups.filter((g) => g !== group);
    return [db.user.update({ where: { id: u.id }, data: { groups } })];
  });
  if (changes.length) {
    await db.$transaction(changes);
    await audit("group.teachers", session.user.id, group);
  }
  revalidatePath("/admin/groups");
  revalidatePath("/admin/team");
  return { success: "Saved." };
}
