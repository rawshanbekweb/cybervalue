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
import { flagMatches, storeFlag } from "@/lib/challenges/scoring";

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

/**
 * The prerequisite must be another challenge of the same competition, and
 * following "opens after" from it must never come back to this challenge.
 */
async function checkRequires(
  eventId: string,
  challengeId: string | null,
  requiresId: string | null,
) {
  if (!requiresId) return null;
  const db = getDb()!;
  let current: string | null = requiresId;
  for (let step = 0; current && step < 100; step++) {
    if (current === challengeId)
      return "A challenge cannot open after itself, even through others.";
    const row: { eventId: string; requiresId: string | null } | null =
      await db.ctfChallenge.findUnique({
        where: { id: current },
        select: { eventId: true, requiresId: true },
      });
    if (!row || row.eventId !== eventId)
      return "Choose a challenge of the same competition.";
    current = row.requiresId;
  }
  return null;
}

export async function createChallengeAction(eventId: string, form: FormData) {
  const path = `/admin/ctf/events/${eventId}`;
  const session = await owner(path);
  const parsed = parseChallengeForm(form, true);
  if ("error" in parsed) back(path, "error", parsed.error);
  const { data } = parsed as Extract<typeof parsed, { data: unknown }>;
  const { flag, caseSensitive, ...fields } = data;
  const problem = await checkRequires(eventId, null, fields.requiresId);
  if (problem) back(path, "error", problem);
  const { id } = await getDb()!.ctfChallenge.create({
    data: {
      ...fields,
      eventId,
      flags: { create: storeFlag(flag!, caseSensitive) },
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
    select: { eventId: true },
  });
  if (!current) back("/admin/ctf/events", "error", "Challenge not found.");
  const parsed = parseChallengeForm(form, false);
  if ("error" in parsed) back(path, "error", parsed.error);
  const { data } = parsed as Extract<typeof parsed, { data: unknown }>;
  const { flag: _flag, caseSensitive: _case, ...fields } = data;
  void _flag;
  void _case;
  const problem = await checkRequires(current!.eventId, id, fields.requiresId);
  if (problem) back(path, "error", problem);
  await db.ctfChallenge.update({ where: { id }, data: fields });
  await audit("ctf.challenge_update", session.user.id, id);
  revalidatePath("/challenges", "layout");
  back(path, "ok", "Saved.");
}

export async function addFlagAction(challengeId: string, form: FormData) {
  const path = `/admin/ctf/challenges/${challengeId}`;
  const session = await owner(path);
  const flag = String(form.get("flag") ?? "").trim();
  if (!flag || flag.length > 200)
    back(path, "error", "The flag is too long (200 at most).");
  await getDb()!.ctfFlag.create({
    data: {
      challengeId,
      ...storeFlag(flag, form.get("caseInsensitive") !== "on"),
    },
  });
  await audit("ctf.challenge_update", session.user.id, challengeId);
  back(path, "ok", "Flag added.");
}

export async function deleteFlagAction(challengeId: string, flagId: string) {
  const path = `/admin/ctf/challenges/${challengeId}`;
  const session = await owner(path);
  const db = getDb()!;
  // A challenge always keeps at least one accepted flag.
  const deleted = await db.$transaction(async (tx) => {
    const count = await tx.ctfFlag.count({ where: { challengeId } });
    if (count <= 1) return false;
    await tx.ctfFlag.deleteMany({ where: { id: flagId, challengeId } });
    return true;
  });
  if (!deleted)
    back(
      path,
      "error",
      "A challenge needs at least one flag. Add another first.",
    );
  await audit("ctf.challenge_update", session.user.id, challengeId);
  back(path, "ok", "Flag deleted.");
}

/** Checks a candidate against the stored flags without recording anything. */
export async function testFlagAction(challengeId: string, form: FormData) {
  const path = `/admin/ctf/challenges/${challengeId}`;
  await owner(path);
  const attempt = String(form.get("attempt") ?? "").slice(0, 200);
  const flags = await getDb()!.ctfFlag.findMany({
    where: { challengeId },
    orderBy: { createdAt: "asc" },
    select: { salt: true, hash: true, caseSensitive: true },
  });
  // The candidate itself never goes into the address.
  if (!flagMatches(flags, attempt))
    back(path, "error", "No flag accepts this answer.");
  back(path, "ok", "This answer is accepted.");
}

/**
 * Copies a competition with its challenges, flags, hints and files as an
 * unpublished draft, a week later, for a rerun or a new season.
 */
export async function cloneEventAction(id: string) {
  const path = `/admin/ctf/events/${id}`;
  const session = await owner(path);
  const db = getDb()!;
  const source = await db.ctfEvent.findUnique({
    where: { id },
    include: {
      challenges: {
        include: { flags: true, hints: true, files: true },
      },
    },
  });
  if (!source) back("/admin/ctf/events", "error", "Competition not found.");
  const event = source!;
  let slug = `${event.slug.slice(0, 50)}-copy`;
  for (let n = 2; await db.ctfEvent.findUnique({ where: { slug } }); n++)
    slug = `${event.slug.slice(0, 50)}-copy-${n}`;
  const week = 7 * 24 * 60 * 60 * 1000;
  const shift = (d: Date | null) => (d ? new Date(d.getTime() + week) : null);
  const copy = await db.$transaction(async (tx) => {
    const created = await tx.ctfEvent.create({
      data: {
        slug,
        title: `${event.title} (copy)`.slice(0, 120),
        summary: event.summary,
        description: event.description,
        startsAt: shift(event.startsAt)!,
        endsAt: shift(event.endsAt)!,
        registrationEndsAt: shift(event.registrationEndsAt),
        freezeAt: shift(event.freezeAt),
        maxTeamSize: event.maxTeamSize,
        allowSolo: event.allowSolo,
        published: false,
      },
    });
    const ids = new Map<string, string>();
    for (const c of event.challenges) {
      const made = await tx.ctfChallenge.create({
        data: {
          eventId: created.id,
          title: c.title,
          category: c.category,
          description: c.description,
          releaseAt: shift(c.releaseAt),
          maxAttempts: c.maxAttempts,
          initialPoints: c.initialPoints,
          minimumPoints: c.minimumPoints,
          decay: c.decay,
          visible: c.visible,
          position: c.position,
          flags: {
            create: c.flags.map((f) => ({
              salt: f.salt,
              hash: f.hash,
              caseSensitive: f.caseSensitive,
            })),
          },
          hints: {
            create: c.hints.map((h) => ({
              text: h.text,
              cost: h.cost,
              position: h.position,
            })),
          },
          files: {
            create: c.files.map((f) => ({
              name: f.name,
              size: f.size,
              data: f.data,
            })),
          },
        },
        select: { id: true },
      });
      ids.set(c.id, made.id);
    }
    // Prerequisites point at the copies.
    for (const c of event.challenges)
      if (c.requiresId && ids.has(c.requiresId))
        await tx.ctfChallenge.update({
          where: { id: ids.get(c.id)! },
          data: { requiresId: ids.get(c.requiresId)! },
        });
    return created;
  });
  await audit("ctf.event_update", session.user.id, copy.id);
  back(
    `/admin/ctf/events/${copy.id}`,
    "ok",
    "Copied as an unpublished draft a week later. Check the times and the address.",
  );
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
