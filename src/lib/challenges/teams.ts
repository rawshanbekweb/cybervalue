import "server-only";
import { getDb } from "../db";
import { Prisma } from "@/generated/prisma/client";
import {
  newInviteCode,
  normalizeInviteCode,
  TEAM_MAX_MEMBERS,
  teamNameKey,
} from "./account";

type Tx = Prisma.TransactionClient;

/** Why a team change was refused, as a message the form can translate. */
export class TeamError extends Error {}

// Membership changes take the team row's lock first, so two people joining at
// once cannot push a team past its size.
const lockTeam = (tx: Tx, teamId: string) =>
  tx.$queryRaw`SELECT "id" FROM "CtfTeam" WHERE "id" = ${teamId} FOR UPDATE`;

/**
 * Teams in a competition that has not ended stay as they are while it runs,
 * and before it starts may not grow past its team size. Without this a player
 * could hop between teams and carry flags across.
 */
async function guardChange(
  tx: Tx,
  teamId: string,
  change: { size?: number; joining?: string } = {},
) {
  const now = new Date();
  const entries = await tx.ctfEntrant.findMany({
    where: { teamId, event: { endsAt: { gt: now } } },
    select: {
      event: { select: { id: true, startsAt: true, maxTeamSize: true } },
    },
  });
  if (entries.some((e) => e.event.startsAt <= now))
    throw new TeamError(
      "The team cannot change while one of its competitions is running.",
    );
  if (
    change.size !== undefined &&
    entries.some((e) => change.size! > e.event.maxTeamSize)
  )
    throw new TeamError(
      "The team is full for a competition it registered for.",
    );
  if (
    change.joining &&
    (await tx.ctfEntrant.count({
      where: {
        playerId: change.joining,
        eventId: { in: entries.map((e) => e.event.id) },
      },
    }))
  )
    throw new TeamError(
      "You are registered on your own in a competition this team plays.",
    );
}

const nameTaken = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002" &&
  String(error.meta?.target ?? "").includes("nameKey");

export async function createTeam(playerId: string, name: string) {
  const db = getDb()!;
  try {
    return await db.$transaction(async (tx) => {
      const team = await tx.ctfTeam.create({
        data: {
          name,
          nameKey: teamNameKey(name),
          inviteCode: newInviteCode(),
          captainId: playerId,
        },
      });
      // Only a player who is not in a team yet can found one.
      const moved = await tx.ctfPlayer.updateMany({
        where: { id: playerId, teamId: null },
        data: { teamId: team.id, joinedTeamAt: new Date() },
      });
      if (moved.count !== 1)
        throw new TeamError("Leave your current team first.");
      return team;
    });
  } catch (error) {
    if (nameTaken(error))
      throw new TeamError("This team name is taken. Choose another one.");
    // captainId is unique: the player already captains a team.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      throw new TeamError("Leave your current team first.");
    throw error;
  }
}

export async function joinTeam(playerId: string, rawCode: string) {
  const code = normalizeInviteCode(rawCode);
  if (!code) throw new TeamError("This invite code is not valid.");
  const db = getDb()!;
  return db.$transaction(async (tx) => {
    const team = await tx.ctfTeam.findUnique({
      where: { inviteCode: code },
      select: { id: true, name: true },
    });
    if (!team) throw new TeamError("This invite code is not valid.");
    await lockTeam(tx, team.id);
    const size = await tx.ctfPlayer.count({ where: { teamId: team.id } });
    if (size >= TEAM_MAX_MEMBERS) throw new TeamError("This team is full.");
    const moved = await tx.ctfPlayer.updateMany({
      where: { id: playerId, teamId: null },
      data: { teamId: team.id, joinedTeamAt: new Date() },
    });
    if (moved.count !== 1)
      throw new TeamError("Leave your current team first.");
    return team;
  });
}

/**
 * Takes a player out of their team. A leaving captain hands the team to the
 * longest-standing member; the last member leaving deletes the team.
 * Used when a player leaves, is removed or deletes the account.
 */
export async function releasePlayer(tx: Tx, playerId: string, force = false) {
  const player = await tx.ctfPlayer.findUnique({
    where: { id: playerId },
    select: { teamId: true },
  });
  if (!player?.teamId) return;
  await lockTeam(tx, player.teamId);
  // Deleting an account is always allowed, even mid-competition.
  if (!force) await guardChange(tx, player.teamId);
  const team = await tx.ctfTeam.findUniqueOrThrow({
    where: { id: player.teamId },
    select: { id: true, captainId: true },
  });
  const heir = await tx.ctfPlayer.findFirst({
    where: { teamId: team.id, id: { not: playerId } },
    orderBy: [{ joinedTeamAt: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  await tx.ctfPlayer.update({
    where: { id: playerId },
    data: { teamId: null, joinedTeamAt: null },
  });
  if (!heir) await tx.ctfTeam.delete({ where: { id: team.id } });
  else if (team.captainId === playerId)
    await tx.ctfTeam.update({
      where: { id: team.id },
      data: { captainId: heir.id },
    });
}

export async function leaveTeam(playerId: string) {
  await getDb()!.$transaction((tx) => releasePlayer(tx, playerId));
}

/** The captain's team, locked for a change; refuses anyone else. */
async function captainTeam(tx: Tx, captainId: string) {
  const team = await tx.ctfTeam.findUnique({
    where: { captainId },
    select: { id: true },
  });
  if (!team) throw new TeamError("Only the captain can do this.");
  await lockTeam(tx, team.id);
  return team;
}

export async function removeMember(captainId: string, memberId: string) {
  if (memberId === captainId)
    throw new TeamError("Use “Leave the team” to leave it yourself.");
  await getDb()!.$transaction(async (tx) => {
    const team = await captainTeam(tx, captainId);
    await guardChange(tx, team.id);
    const moved = await tx.ctfPlayer.updateMany({
      where: { id: memberId, teamId: team.id },
      data: { teamId: null, joinedTeamAt: null },
    });
    if (moved.count !== 1)
      throw new TeamError("This player is not in your team.");
  });
}

export async function makeCaptain(captainId: string, memberId: string) {
  await getDb()!.$transaction(async (tx) => {
    const team = await captainTeam(tx, captainId);
    const member = await tx.ctfPlayer.findFirst({
      where: { id: memberId, teamId: team.id },
      select: { id: true },
    });
    if (!member || member.id === captainId)
      throw new TeamError("This player is not in your team.");
    await tx.ctfTeam.update({
      where: { id: team.id },
      data: { captainId: member.id },
    });
  });
}

export async function renameTeam(captainId: string, name: string) {
  try {
    await getDb()!.$transaction(async (tx) => {
      const team = await captainTeam(tx, captainId);
      await tx.ctfTeam.update({
        where: { id: team.id },
        data: { name, nameKey: teamNameKey(name) },
      });
    });
  } catch (error) {
    if (nameTaken(error))
      throw new TeamError("This team name is taken. Choose another one.");
    throw error;
  }
}

/** A new invite code; the old one stops working. */
export async function renewInviteCode(captainId: string) {
  await getDb()!.$transaction(async (tx) => {
    const team = await captainTeam(tx, captainId);
    await tx.ctfTeam.update({
      where: { id: team.id },
      data: { inviteCode: newInviteCode() },
    });
  });
}

export async function teamOf(playerId: string) {
  const player = await getDb()?.ctfPlayer.findUnique({
    where: { id: playerId },
    select: {
      team: {
        select: {
          id: true,
          name: true,
          inviteCode: true,
          captainId: true,
          createdAt: true,
          members: {
            orderBy: [{ joinedTeamAt: "asc" }, { id: "asc" }],
            select: { id: true, username: true, joinedTeamAt: true },
          },
        },
      },
    },
  });
  return player?.team ?? null;
}
