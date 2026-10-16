import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { allowRequest, clientKey } from "@/lib/rate-limit";
import { limit } from "@/lib/rate-limit-db";
import {
  canAnswer,
  codeSchema,
  hashToken,
  MAX_PLAYERS,
  nameSchema,
  newPlayerToken,
  parseQuestions,
  points,
} from "@/lib/live/game";
import { findPlayer, playerView } from "@/lib/live/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOUR = 3_600_000;
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers });

const seat = z.object({
  game: z.string().min(1).max(40),
  token: z.string().min(10).max(100),
});

async function body(request: Request) {
  if (Number(request.headers.get("content-length")) > 2048) return null;
  try {
    const text = await request.text();
    return text.length > 2048 ? null : (JSON.parse(text) as unknown);
  } catch {
    return null;
  }
}

// One route for the player's three calls: join, state (polled) and answer.
export async function POST(
  request: Request,
  { params }: RouteContext<"/api/live/[action]">,
) {
  const { action } = await params;
  const db = getDb();
  if (!db) return reply({ error: "unavailable" }, 503);
  const client = clientKey(request.headers.get("x-forwarded-for"));
  const input = await body(request);

  if (action === "join") {
    if (
      !(await limit(`live:join:${client}`, 20, 60_000)) ||
      !(await limit("live:join:global", 600, 60_000))
    )
      return reply({ error: "busy" }, 429);
    const parsed = z
      .object({ code: codeSchema, name: nameSchema })
      .safeParse(input);
    if (!parsed.success)
      return reply(
        {
          error: parsed.error.issues.some((i) => i.path[0] === "name")
            ? "name"
            : "code",
        },
        400,
      );
    const game = await db.liveGame.findFirst({
      where: {
        code: parsed.data.code,
        state: { not: "finished" },
        createdAt: { gte: new Date(Date.now() - 12 * HOUR) },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, _count: { select: { players: true } } },
    });
    if (!game) return reply({ error: "code" }, 404);
    if (game._count.players >= MAX_PLAYERS)
      return reply({ error: "full" }, 409);
    const token = newPlayerToken();
    try {
      await db.livePlayer.create({
        data: {
          gameId: game.id,
          name: parsed.data.name,
          tokenHash: hashToken(token),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        return reply({ error: "taken" }, 409);
      throw error;
    }
    return reply({ game: game.id, token });
  }

  const parsedSeat = seat.safeParse(input);
  if (!parsedSeat.success) return reply({ error: "seat" }, 400);
  const { game: gameId, token } = parsedSeat.data;

  if (action === "state") {
    // Polled every two seconds by every phone; kept in memory, not the DB.
    if (!allowRequest(`live:state:${client}:${token}`, Date.now(), 90, 60_000))
      return reply({ error: "busy" }, 429);
    const view = await playerView(db, gameId, token);
    return view ? reply(view) : reply({ error: "seat" }, 404);
  }

  if (action === "answer") {
    if (!allowRequest(`live:answer:${token}`, Date.now(), 30, 60_000))
      return reply({ error: "busy" }, 429);
    const choice = z
      .object({ choice: z.number().int().min(0).max(7) })
      .safeParse(input);
    if (!choice.success) return reply({ error: "choice" }, 400);
    const player = await findPlayer(db, gameId, token);
    if (!player) return reply({ error: "seat" }, 404);
    const { game } = player;
    const now = Date.now();
    const q = (parseQuestions(game.questions) ?? [])[game.current];
    if (!q || !canAnswer(game, now)) return reply({ error: "closed" }, 409);
    if (choice.data.choice >= q.options.length)
      return reply({ error: "choice" }, 400);
    const ms = now - game.startedAt!.getTime();
    const correct = choice.data.choice === q.answer;
    const earned = points(correct, ms, game.seconds);
    try {
      await db.$transaction([
        db.liveAnswer.create({
          data: {
            gameId,
            playerId: player.id,
            question: game.current,
            choice: choice.data.choice,
            correct,
            points: earned,
            ms,
          },
        }),
        db.livePlayer.update({
          where: { id: player.id },
          data: { score: { increment: earned } },
        }),
      ]);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        return reply({ error: "answered" }, 409);
      throw error;
    }
    // The result stays hidden until the host reveals the question.
    return reply({ ok: true });
  }

  return reply({ error: "not found" }, 404);
}
