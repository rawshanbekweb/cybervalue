"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { Prisma } from "@/generated/prisma/client";
import {
  parseChallengeForm,
  parseEventForm,
} from "@/lib/challenges/admin-forms";
import { flagDigest, newFlagSalt } from "@/lib/challenges/scoring";

// Every CTF admin page reads ?ok= or ?error= to show the outcome.
const back = (path: string, key: "ok" | "error", message: string) =>
  redirect(`${path}?${key}=${encodeURIComponent(message)}`);

async function owner(path: string) {
  const session = await requireOwner(path);
  if (!(await limit(`admin-write:${session.user.id}`, 60, 60_000)))
    back(path, "error", "Too many changes. Try again shortly.");
  return session;
}

const slugTaken = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

export async function createEventAction(form: FormData) {
  const path = "/admin/ctf/events";
  const session = await owner(path);
  const parsed = parseEventForm(form);
  if ("error" in parsed) back(path, "error", parsed.error);
  const { data } = parsed as Extract<typeof parsed, { data: unknown }>;
  let id = "";
  try {
    ({ id } = await getDb()!.ctfEvent.create({ data, select: { id: true } }));
  } catch (error) {
    if (slugTaken(error))
      back(path, "error", "Another competition already uses this address.");
    throw error;
  }
  await audit("ctf.event_update", session.user.id, id);
  back(`/admin/ctf/events/${id}`, "ok", "Competition created.");
}

export async function updateEventAction(id: string, form: FormData) {
  const path = `/admin/ctf/events/${id}`;
  const session = await owner(path);
  const parsed = parseEventForm(form);
  if ("error" in parsed) back(path, "error", parsed.error);
  const { data } = parsed as Extract<typeof parsed, { data: unknown }>;
  try {
    await getDb()!.ctfEvent.update({ where: { id }, data });
  } catch (error) {
    if (slugTaken(error))
      back(path, "error", "Another competition already uses this address.");
    throw error;
  }
  await audit("ctf.event_update", session.user.id, id);
  revalidatePath("/challenges", "layout");
  back(path, "ok", "Saved.");
}

export async function deleteEventAction(id: string) {
  const session = await owner(`/admin/ctf/events/${id}`);
  await getDb()!.ctfEvent.deleteMany({ where: { id } });
  await audit("ctf.event_delete", session.user.id, id);
  revalidatePath("/challenges", "layout");
  back("/admin/ctf/events", "ok", "Competition deleted.");
}

export async function announceAction(eventId: string, form: FormData) {
  const path = `/admin/ctf/events/${eventId}`;
  const session = await owner(path);
  const body = String(form.get("body") ?? "").trim();
  if (body.length < 2 || body.length > 2000)
    back(path, "error", "Announcement: 2 to 2,000 characters.");
  await getDb()!.ctfAnnouncement.create({ data: { eventId, body } });
  await audit("ctf.event_update", session.user.id, eventId);
  revalidatePath(`/challenges`, "layout");
  back(path, "ok", "Announcement posted.");
}

export async function deleteAnnouncementAction(eventId: string, id: string) {
  const path = `/admin/ctf/events/${eventId}`;
  await owner(path);
  await getDb()!.ctfAnnouncement.deleteMany({ where: { id, eventId } });
  revalidatePath(`/challenges`, "layout");
  back(path, "ok", "Announcement deleted.");
}

/** Blocks an entrant: hidden from the scoreboard, can no longer submit. */
export async function setEntrantBannedAction(
  eventId: string,
  entrantId: string,
  banned: boolean,
) {
  const path = `/admin/ctf/events/${eventId}`;
  const session = await owner(path);
  await getDb()!.ctfEntrant.updateMany({
    where: { id: entrantId, eventId },
    data: { banned },
  });
  await audit("ctf.entrant_ban", session.user.id, entrantId);
  revalidatePath(`/challenges`, "layout");
  back(path, "ok", banned ? "Entrant blocked." : "Entrant unblocked.");
}

export async function createChallengeAction(eventId: string, form: FormData) {
  const path = `/admin/ctf/events/${eventId}`;
  const session = await owner(path);
  const parsed = parseChallengeForm(form, true);
  if ("error" in parsed) back(path, "error", parsed.error);
  const { data } = parsed as Extract<typeof parsed, { data: unknown }>;
  const { flag, ...fields } = data;
  const salt = newFlagSalt();
  const { id } = await getDb()!.ctfChallenge.create({
    data: {
      ...fields,
      eventId,
      flagSalt: salt,
      flagHash: flagDigest(salt, flag!, data.caseSensitive),
    },
    select: { id: true },
  });
  await audit("ctf.challenge_update", session.user.id, id);
  back(`/admin/ctf/challenges/${id}`, "ok", "Challenge created.");
}

export async function updateChallengeAction(id: string, form: FormData) {
  const path = `/admin/ctf/challenges/${id}`;
  const session = await owner(path);
  const db = getDb()!;
  const current = await db.ctfChallenge.findUnique({
    where: { id },
    select: { caseSensitive: true },
  });
  if (!current) back("/admin/ctf/events", "error", "Challenge not found.");
  const parsed = parseChallengeForm(form, false);
  if ("error" in parsed) back(path, "error", parsed.error);
  const { data } = parsed as Extract<typeof parsed, { data: unknown }>;
  const { flag, ...fields } = data;
  // The stored digest depends on case sensitivity, so changing it needs the
  // flag again.
  if (!flag && fields.caseSensitive !== current!.caseSensitive)
    back(path, "error", "Type the flag again to change case sensitivity.");
  const salt = newFlagSalt();
  await db.ctfChallenge.update({
    where: { id },
    data: {
      ...fields,
      ...(flag && {
        flagSalt: salt,
        flagHash: flagDigest(salt, flag, fields.caseSensitive),
      }),
    },
  });
  await audit("ctf.challenge_update", session.user.id, id);
  revalidatePath("/challenges", "layout");
  back(path, "ok", flag ? "Saved with the new flag." : "Saved.");
}

export async function deleteChallengeAction(id: string) {
  const session = await owner(`/admin/ctf/challenges/${id}`);
  const challenge = await getDb()!.ctfChallenge.findUnique({
    where: { id },
    select: { eventId: true },
  });
  if (!challenge) back("/admin/ctf/events", "error", "Challenge not found.");
  await getDb()!.ctfChallenge.delete({ where: { id } });
  await audit("ctf.challenge_delete", session.user.id, id);
  revalidatePath("/challenges", "layout");
  back(`/admin/ctf/events/${challenge!.eventId}`, "ok", "Challenge deleted.");
}

export async function addHintAction(challengeId: string, form: FormData) {
  const path = `/admin/ctf/challenges/${challengeId}`;
  const session = await owner(path);
  const text = String(form.get("text") ?? "").trim();
  const cost = Number(form.get("cost") ?? 0);
  if (text.length < 2 || text.length > 4000)
    back(path, "error", "Hint: 2 to 4,000 characters.");
  if (!Number.isInteger(cost) || cost < 0 || cost > 10000)
    back(path, "error", "Hint cost: a whole number from 0 to 10,000.");
  const count = await getDb()!.ctfHint.count({ where: { challengeId } });
  await getDb()!.ctfHint.create({
    data: { challengeId, text, cost, position: count },
  });
  await audit("ctf.challenge_update", session.user.id, challengeId);
  back(path, "ok", "Hint added.");
}

export async function deleteHintAction(challengeId: string, hintId: string) {
  const path = `/admin/ctf/challenges/${challengeId}`;
  const session = await owner(path);
  await getDb()!.ctfHint.deleteMany({ where: { id: hintId, challengeId } });
  await audit("ctf.challenge_update", session.user.id, challengeId);
  back(path, "ok", "Hint deleted.");
}

export async function deleteFileAction(challengeId: string, fileId: string) {
  const path = `/admin/ctf/challenges/${challengeId}`;
  const session = await owner(path);
  await getDb()!.ctfFile.deleteMany({ where: { id: fileId, challengeId } });
  await audit("ctf.challenge_update", session.user.id, challengeId);
  back(path, "ok", "File deleted.");
}
