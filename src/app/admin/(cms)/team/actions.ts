"use server";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { hashPassword, requireOwner } from "@/lib/auth";
import { mayManage, roleOf, STAFF_ROLES } from "@/lib/staff";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";

export type TeamState =
  | {
      error?: string;
      success?: string;
      password?: string;
      email?: string;
      values?: Record<string, string>;
    }
  | undefined;

const NO_DB = "Database is not configured.";
const groupName = z
  .string()
  .trim()
  .max(40)
  .regex(/^[\p{L}\p{N} ._-]+$/u);

// Readable one-time passwords: no look-alike letters, 16 characters.
const newPassword = () =>
  [...randomBytes(16)]
    .map(
      (b) => "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 55],
    )
    .join("");

function parseGroups(form: FormData) {
  const raw = form
    .getAll("groups")
    .flatMap((v) => String(v).split(/[,\n]/))
    .map((g) => g.trim())
    .filter(Boolean);
  const groups = [...new Set(raw)].slice(0, 50);
  return groups.every((g) => groupName.safeParse(g).success) ? groups : null;
}

const memberSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().trim().toLowerCase().max(200),
  role: z.enum(STAFF_ROLES),
});

const OWNER_ONLY = "Only an owner can manage owners and admins.";

export async function createStaffAction(
  _state: TeamState,
  form: FormData,
): Promise<TeamState> {
  const session = await requireOwner("/admin/team");
  if (!(await limit(`admin-write:${session.user.id}`, 60, 60_000)))
    return { error: "Too many changes. Try again shortly." };
  const parsed = memberSchema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    role: form.get("role"),
  });
  if (!parsed.success)
    return { error: "Enter a name, a valid email and a role." };
  if (!mayManage(session.user, parsed.data.role)) return { error: OWNER_ONLY };
  const groups = parseGroups(form);
  if (!groups)
    return {
      error:
        "Groups allow letters, digits, spaces, dots, dashes and underscores (up to 40 each).",
    };
  if (parsed.data.role === "teacher" && !groups.length)
    return { error: "Give the teacher at least one group." };
  const db = getDb();
  if (!db) return { error: NO_DB };
  if (await db.user.count({ where: { email: parsed.data.email } }))
    return { error: "Someone already uses this email." };
  const password = newPassword();
  await db.user.create({
    data: {
      ...parsed.data,
      groups: parsed.data.role === "teacher" ? groups : [],
      passwordHash: await hashPassword(password),
    },
  });
  await audit(
    "staff.create",
    session.user.id,
    `${parsed.data.email} (${parsed.data.role})`,
  );
  revalidatePath("/admin/team");
  return { password, email: parsed.data.email };
}

async function owners(db: NonNullable<ReturnType<typeof getDb>>) {
  return db.user.count({ where: { role: "owner", active: true } });
}

export async function updateStaffAction(
  id: string,
  _state: TeamState,
  form: FormData,
): Promise<TeamState> {
  const session = await requireOwner("/admin/team");
  const db = getDb();
  if (!db) return { error: NO_DB };
  const target = await db.user.findUnique({ where: { id } });
  if (!target) return { error: "This person no longer exists." };
  const role = STAFF_ROLES.find((r) => r === form.get("role"));
  if (!role) return { error: "Choose a role." };
  if (!mayManage(session.user, roleOf(target), role))
    return { error: OWNER_ONLY };
  const active = form.get("active") === "on";
  const groups = parseGroups(form);
  if (!groups)
    return {
      error:
        "Groups allow letters, digits, spaces, dots, dashes and underscores (up to 40 each).",
    };
  if (role === "teacher" && !groups.length)
    return { error: "Give the teacher at least one group." };
  // The site always keeps one owner who can sign in, and nobody locks
  // themselves out by accident.
  const losesOwner =
    target.role === "owner" && target.active && (role !== "owner" || !active);
  if (losesOwner && (await owners(db)) <= 1)
    return { error: "Keep at least one active owner." };
  if (id === session.user.id && (role !== roleOf(target) || !active))
    return { error: "You cannot demote or switch off your own account." };
  await db.user.update({
    where: { id },
    data: { role, active, groups: role === "teacher" ? groups : [] },
  });
  if (!active) await db.session.deleteMany({ where: { userId: id } });
  await audit("staff.update", session.user.id, `${target.email}: ${role}`);
  revalidatePath("/admin/team");
  return { success: "Saved." };
}

export async function resetStaffPasswordAction(id: string): Promise<TeamState> {
  const session = await requireOwner("/admin/team");
  const db = getDb();
  if (!db) return { error: NO_DB };
  const current = await db.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!current) return { error: "This person no longer exists." };
  if (!mayManage(session.user, roleOf(current))) return { error: OWNER_ONLY };
  const password = newPassword();
  const target = await db.user
    .update({
      where: { id },
      data: { passwordHash: await hashPassword(password) },
    })
    .catch(() => null);
  if (!target) return { error: "This person no longer exists." };
  // Signs them out everywhere; the new password is shown once.
  await db.session.deleteMany({ where: { userId: id } });
  await audit("staff.password_reset", session.user.id, target.email ?? id);
  return { password, email: target.email ?? "" };
}

export async function deleteStaffAction(id: string): Promise<TeamState> {
  const session = await requireOwner("/admin/team");
  const db = getDb();
  if (!db) return { error: NO_DB };
  if (id === session.user.id)
    return { error: "You cannot delete your own account." };
  const target = await db.user.findUnique({ where: { id } });
  if (!target) return { error: "This person no longer exists." };
  if (!mayManage(session.user, roleOf(target))) return { error: OWNER_ONLY };
  if (target.role === "owner" && target.active && (await owners(db)) <= 1)
    return { error: "Keep at least one active owner." };
  // Their site content stays, credited to you.
  await db.$transaction([
    db.content.updateMany({
      where: { authorId: id },
      data: { authorId: session.user.id },
    }),
    db.user.delete({ where: { id } }),
  ]);
  await audit("staff.delete", session.user.id, target.email ?? id);
  revalidatePath("/admin/team");
  return { success: "Deleted." };
}
