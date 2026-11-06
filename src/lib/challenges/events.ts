import "server-only";
import { cache } from "react";
import { getDb } from "../db";
import { Prisma } from "@/generated/prisma/client";
import {
  attemptsLeft,
  attemptDigest,
  challengeAccess,
  challengeValue,
  flagMatches,
  phaseOf,
  registrationOpen,
  scoreboardCutoff,
  standings,
} from "./scoring";
import { categoriesOf, categoryStats } from "./strengths";

export class EventError extends Error {}

type Player = { id: string; emailVerifiedAt: Date | null; username: string };

export const publishedEvents = cache(
  async () =>
    (await getDb()?.ctfEvent.findMany({
      where: { published: true },
      orderBy: { startsAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        startsAt: true,
        endsAt: true,
        registrationEndsAt: true,
        freezeAt: true,
        maxTeamSize: true,
        allowSolo: true,
        _count: { select: { entrants: true } },
      },
    })) ?? [],
);

/** A published competition by its slug (owners may preview unpublished). */
export const eventBySlug = cache(async (slug: string, preview = false) => {
  const event = await getDb()?.ctfEvent.findUnique({ where: { slug } });
  return event && (event.published || preview) ? event : null;
});

/** The entrant the player plays as: their team's, or their own. */
export async function entrantFor(eventId: string, playerId: string) {
  const db = getDb()!;
  const player = await db.ctfPlayer.findUnique({
    where: { id: playerId },
    select: { teamId: true },
  });
  return db.ctfEntrant.findFirst({
    where: {
      eventId,
      OR: [
        { playerId },
        ...(player?.teamId ? [{ teamId: player.teamId }] : []),
      ],
    },
  });
}

type EventRow = NonNullable<Awaited<ReturnType<typeof eventBySlug>>>;

export async function register(
  event: EventRow,
  player: Player,
  as: "team" | "solo",
) {
  if (!player.emailVerifiedAt)
    throw new EventError("Confirm your email to register.");
  if (!registrationOpen(event))
    throw new EventError("Registration for this competition is closed.");
  const db = getDb()!;
  try {
    await db.$transaction(async (tx) => {
      const me = await tx.ctfPlayer.findUniqueOrThrow({
        where: { id: player.id },
        select: {
          teamId: true,
          team: { select: { id: true, name: true, captainId: true } },
        },
      });
      if (as === "solo") {
        if (!event.allowSolo)
          throw new EventError("This competition is for teams only.");
        if (
          me.teamId &&
          (await tx.ctfEntrant.count({
            where: { eventId: event.id, teamId: me.teamId },
          }))
        )
          throw new EventError("Your team is already registered.");
        await tx.ctfEntrant.create({
          data: {
            eventId: event.id,
            playerId: player.id,
            name: player.username,
          },
        });
        return;
      }
      if (!me.team) throw new EventError("Create or join a team first.");
      if (me.team.captainId !== player.id)
        throw new EventError("Only the captain can register the team.");
      await tx.$queryRaw`SELECT "id" FROM "CtfTeam" WHERE "id" = ${me.team.id} FOR UPDATE`;
      const members = await tx.ctfPlayer.findMany({
        where: { teamId: me.team.id },
        select: { id: true },
      });
      if (members.length > event.maxTeamSize)
        throw new EventError(
          "Your team is larger than this competition allows.",
        );
      const solo = await tx.ctfEntrant.count({
        where: {
          eventId: event.id,
          playerId: { in: members.map((m) => m.id) },
        },
      });
      if (solo)
        throw new EventError(
          "A member of your team is already registered on their own.",
        );
      await tx.ctfEntrant.create({
        data: { eventId: event.id, teamId: me.team.id, name: me.team.name },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      throw new EventError("You are already registered.");
    throw error;
  }
}

/** Withdraws before the start: a solo player, or the captain for the team. */
export async function withdraw(event: EventRow, playerId: string) {
  if (phaseOf(event) !== "upcoming")
    throw new EventError("You can withdraw only before the start.");
  const db = getDb()!;
  const entrant = await entrantFor(event.id, playerId);
  if (!entrant) return;
  if (entrant.teamId) {
    const team = await db.ctfTeam.findUnique({
      where: { id: entrant.teamId },
      select: { captainId: true },
    });
    if (team?.captainId !== playerId)
      throw new EventError("Only the captain can withdraw the team.");
  }
  await db.ctfEntrant.delete({ where: { id: entrant.id } });
}

export type SubmitResult = "correct" | "wrong" | "already";

/**
 * Whether an entrant may work on a challenge now: released, its prerequisite
 * solved. Hidden and locked challenges answer like unknown ones.
 */
async function openChallenge(
  eventId: string,
  entrantId: string,
  challengeId: string,
) {
  const db = getDb()!;
  const challenge = await db.ctfChallenge.findFirst({
    where: { id: challengeId, eventId, visible: true },
    select: {
      id: true,
      releaseAt: true,
      requiresId: true,
      maxAttempts: true,
      flags: { select: { salt: true, hash: true, caseSensitive: true } },
    },
  });
  if (!challenge) return null;
  const solved = challenge.requiresId
    ? await db.ctfSolve.findUnique({
        where: {
          entrantId_challengeId: {
            entrantId,
            challengeId: challenge.requiresId,
          },
        },
        select: { challengeId: true },
      })
    : null;
  const access = challengeAccess(
    challenge,
    new Set(solved ? [solved.challengeId] : []),
  );
  return access === "open" ? challenge : null;
}

export async function submitFlag(
  event: EventRow,
  entrantId: string,
  playerId: string,
  challengeId: string,
  attempt: string,
): Promise<SubmitResult> {
  if (phaseOf(event) !== "running")
    throw new EventError("Flags are accepted only while the competition runs.");
  const db = getDb()!;
  const challenge = await openChallenge(event.id, entrantId, challengeId);
  if (!challenge) throw new EventError("This challenge is not available.");
  const solved = await db.ctfSolve.findUnique({
    where: { entrantId_challengeId: { entrantId, challengeId } },
    select: { id: true },
  });
  if (solved) return "already";
  if (challenge.maxAttempts > 0) {
    const wrong = await db.ctfSubmission.count({
      where: { entrantId, challengeId, correct: false },
    });
    if (attemptsLeft(challenge.maxAttempts, wrong) === 0)
      throw new EventError("No attempts left for this challenge.");
  }
  const correct = flagMatches(challenge.flags, attempt);
  await db.ctfSubmission.create({
    data: {
      entrantId,
      challengeId,
      playerId,
      correct,
      valueHash: attemptDigest(challengeId, attempt),
    },
  });
  if (!correct) return "wrong";
  try {
    await db.ctfSolve.create({ data: { entrantId, challengeId, playerId } });
  } catch (error) {
    // A teammate solved it a moment earlier.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return "already";
    throw error;
  }
  return "correct";
}

export async function unlockHint(
  event: EventRow,
  entrantId: string,
  hintId: string,
) {
  if (phaseOf(event) !== "running")
    throw new EventError("Hints open only while the competition runs.");
  const db = getDb()!;
  const hint = await db.ctfHint.findFirst({
    where: { id: hintId, challenge: { eventId: event.id, visible: true } },
    select: { id: true, challengeId: true },
  });
  if (!hint || !(await openChallenge(event.id, entrantId, hint.challengeId)))
    throw new EventError("This hint is not available.");
  await db.ctfHintUnlock.upsert({
    where: { entrantId_hintId: { entrantId, hintId } },
    create: { entrantId, hintId },
    update: {},
  });
}

/** The board an entrant sees while playing: challenges with their value. */
export async function challengeBoard(
  eventId: string,
  entrantId: string | null,
  revealHints = false,
  // Organisers and, after the end, everyone see every challenge.
  revealAll = false,
) {
  const db = getDb()!;
  const [challenges, counts, mine, unlocked, wrongs] = await Promise.all([
    db.ctfChallenge.findMany({
      where: { eventId, visible: true },
      orderBy: [{ category: "asc" }, { position: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        initialPoints: true,
        minimumPoints: true,
        decay: true,
        releaseAt: true,
        requiresId: true,
        requires: { select: { title: true } },
        maxAttempts: true,
        files: { select: { id: true, name: true, size: true } },
        hints: {
          orderBy: { position: "asc" },
          select: { id: true, cost: true, text: true },
        },
      },
    }),
    db.ctfSolve.groupBy({
      by: ["challengeId"],
      where: { challenge: { eventId }, entrant: { banned: false } },
      _count: { _all: true },
    }),
    entrantId
      ? db.ctfSolve.findMany({
          where: { entrantId },
          select: { challengeId: true },
        })
      : [],
    entrantId
      ? db.ctfHintUnlock.findMany({
          where: { entrantId },
          select: { hintId: true },
        })
      : [],
    entrantId
      ? db.ctfSubmission.groupBy({
          by: ["challengeId"],
          where: { entrantId, correct: false },
          _count: { _all: true },
        })
      : [],
  ]);
  const wrongOf = new Map(wrongs.map((w) => [w.challengeId, w._count._all]));
  const solvesOf = new Map(counts.map((c) => [c.challengeId, c._count._all]));
  const solvedIds = new Set(mine.map((s) => s.challengeId));
  const open = new Set(unlocked.map((u) => u.hintId));
  const now = new Date();
  return challenges.flatMap((c) => {
    const access = revealAll ? "open" : challengeAccess(c, solvedIds, now);
    if (access === "hidden") return [];
    const base = {
      id: c.id,
      title: c.title,
      category: c.category,
      solves: solvesOf.get(c.id) ?? 0,
      value: challengeValue(c, solvesOf.get(c.id) ?? 0),
      solved: solvedIds.has(c.id),
      // The challenge that opens this one, while it is still unsolved.
      lockedBy: access === "locked" ? (c.requires?.title ?? "") : null,
      attemptsLeft: attemptsLeft(c.maxAttempts, wrongOf.get(c.id) ?? 0),
    };
    // A locked challenge shows only its title, value and what opens it.
    if (access === "locked")
      return [{ ...base, description: "", files: [], hints: [] }];
    return [
      {
        ...base,
        description: c.description,
        files: c.files,
        // A hint's text reaches the browser only once it is unlocked.
        hints: c.hints.map((h) => ({
          id: h.id,
          cost: h.cost,
          text: revealHints || open.has(h.id) ? h.text : null,
        })),
      },
    ];
  });
}

/**
 * The scoreboard. During a freeze the public sees the standings at the
 * freeze time; `full` (owners) always sees everything.
 */
export async function scoreboard(event: EventRow, full = false) {
  const db = getDb()!;
  const cutoff = full ? null : scoreboardCutoff(event);
  const [entrants, challenges, solves, unlocks, awards] = await Promise.all([
    db.ctfEntrant.findMany({
      where: { eventId: event.id, banned: false },
      select: {
        id: true,
        name: true,
        teamId: true,
        team: { select: { _count: { select: { members: true } } } },
      },
    }),
    db.ctfChallenge.findMany({
      where: { eventId: event.id },
      select: {
        id: true,
        category: true,
        initialPoints: true,
        minimumPoints: true,
        decay: true,
      },
    }),
    db.ctfSolve.findMany({
      where: { challenge: { eventId: event.id }, entrant: { banned: false } },
      orderBy: { createdAt: "asc" },
      select: { entrantId: true, challengeId: true, createdAt: true },
    }),
    db.ctfHintUnlock.findMany({
      where: { entrant: { eventId: event.id, banned: false } },
      select: {
        entrantId: true,
        createdAt: true,
        hint: { select: { cost: true } },
      },
    }),
    db.ctfAward.findMany({
      where: { entrant: { eventId: event.id, banned: false } },
      select: { entrantId: true, points: true, createdAt: true },
    }),
  ]);
  const rows = standings(
    entrants.map((e) => e.id),
    new Map(challenges.map((c) => [c.id, c])),
    solves.map((s) => ({
      entrantId: s.entrantId,
      challengeId: s.challengeId,
      at: s.createdAt,
    })),
    [
      ...unlocks.map((u) => ({
        entrantId: u.entrantId,
        cost: u.hint.cost,
        at: u.createdAt,
      })),
      // An award is a negative cost: a bonus adds, a penalty subtracts.
      ...awards.map((a) => ({
        entrantId: a.entrantId,
        cost: -a.points,
        at: a.createdAt,
      })),
    ],
    cutoff,
  );
  const byId = new Map(entrants.map((e) => [e.id, e]));
  const solveCount = new Map<string, number>();
  for (const s of solves)
    if (!cutoff || s.createdAt <= cutoff)
      solveCount.set(s.challengeId, (solveCount.get(s.challengeId) ?? 0) + 1);
  const values = new Map(
    challenges.map((c) => [c.id, challengeValue(c, solveCount.get(c.id) ?? 0)]),
  );
  // First solver of each challenge, among the solves the viewer may see.
  const firstBlood = new Map<string, string>();
  for (const s of solves)
    if ((!cutoff || s.createdAt <= cutoff) && !firstBlood.has(s.challengeId))
      firstBlood.set(s.challengeId, s.entrantId);
  const bloods = new Map<string, number>();
  for (const id of firstBlood.values())
    bloods.set(id, (bloods.get(id) ?? 0) + 1);
  // What each entrant solved, for the category strengths.
  const solvedBy = new Map<string, string[]>();
  for (const s of solves)
    if (!cutoff || s.createdAt <= cutoff)
      solvedBy.set(s.entrantId, [
        ...(solvedBy.get(s.entrantId) ?? []),
        s.challengeId,
      ]);
  return {
    now: new Date(),
    frozenAt: cutoff,
    rows: rows.map((r) => {
      const entrant = byId.get(r.entrantId)!;
      return {
        ...r,
        name: entrant.name,
        team: Boolean(entrant.teamId),
        members: entrant.team?._count.members ?? 1,
        firstBloods: bloods.get(r.entrantId) ?? 0,
        byCategory: categoryStats(
          challenges,
          values,
          solvedBy.get(r.entrantId) ?? [],
        ),
      };
    }),
    categories: categoriesOf(challenges),
    values,
    // For the progress chart: score over time of the top entrants.
    timeline: solves
      .filter((s) => !cutoff || s.createdAt <= cutoff)
      .map((s) => ({
        entrantId: s.entrantId,
        challengeId: s.challengeId,
        at: s.createdAt,
      })),
  };
}

/**
 * One entrant's record: solves with the challenge's current value, opened
 * hints and the organisers' adjustments, up to the freeze for the public.
 */
export async function entrantRecord(
  event: EventRow,
  entrantId: string,
  full = false,
) {
  const db = getDb()!;
  const entrant = await db.ctfEntrant.findFirst({
    where: { id: entrantId, eventId: event.id, banned: false },
    select: {
      id: true,
      name: true,
      teamId: true,
      team: { select: { members: { select: { username: true } } } },
    },
  });
  if (!entrant) return null;
  const board = await scoreboard(event, full);
  const cutoff = board.frozenAt;
  const until = cutoff ? { lte: cutoff } : undefined;
  const [solves, hints, awards] = await Promise.all([
    db.ctfSolve.findMany({
      where: { entrantId, createdAt: until },
      orderBy: { createdAt: "asc" },
      select: {
        createdAt: true,
        challengeId: true,
        challenge: { select: { title: true, category: true } },
        player: { select: { username: true } },
      },
    }),
    db.ctfHintUnlock.findMany({
      where: { entrantId, createdAt: until },
      select: { hint: { select: { cost: true } } },
    }),
    db.ctfAward.findMany({
      where: { entrantId, createdAt: until },
      orderBy: { createdAt: "asc" },
      select: { points: true, reason: true, createdAt: true },
    }),
  ]);
  return {
    entrant,
    row: board.rows.find((r) => r.entrantId === entrantId) ?? null,
    total: board.rows.length,
    frozenAt: cutoff,
    solves: solves.map((s) => ({
      ...s,
      value: board.values.get(s.challengeId) ?? 0,
    })),
    hintCost: hints.reduce((sum, h) => sum + h.hint.cost, 0),
    awards,
  };
}
