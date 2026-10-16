import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import {
  distribution,
  hashToken,
  leaderboard,
  msLeft,
  parseQuestions,
} from "./game";

const TOP = 5;

export type PlayerView = {
  state: string;
  title: string;
  current: number;
  total: number;
  seconds: number;
  msLeft: number;
  question: { prompt: string; options: string[] } | null;
  answered: number | null;
  reveal: {
    answer: number;
    correct: boolean;
    points: number;
    explain: string | null;
  } | null;
  me: { name: string; score: number; place: number; players: number };
  top: { name: string; score: number; place: number }[];
};

export async function findPlayer(
  db: PrismaClient,
  gameId: string,
  token: string,
) {
  const player = await db.livePlayer.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { game: true },
  });
  return player && player.gameId === gameId ? player : null;
}

// What one player's phone shows. The right answer appears only once the
// host reveals the question.
export async function playerView(
  db: PrismaClient,
  gameId: string,
  token: string,
): Promise<PlayerView | null> {
  const player = await findPlayer(db, gameId, token);
  if (!player) return null;
  const { game } = player;
  const questions = parseQuestions(game.questions) ?? [];
  const q = questions[game.current];
  const showQuestion =
    (game.state === "question" || game.state === "reveal") && q;
  const ranked =
    game.state === "reveal" ||
    game.state === "finished" ||
    game.state === "lobby"
      ? leaderboard(
          await db.livePlayer.findMany({
            where: { gameId },
            select: { id: true, name: true, score: true, createdAt: true },
          }),
        )
      : null;
  const answer = showQuestion
    ? await db.liveAnswer.findUnique({
        where: {
          playerId_question: { playerId: player.id, question: game.current },
        },
      })
    : null;
  const players =
    ranked?.length ?? (await db.livePlayer.count({ where: { gameId } }));
  return {
    state: game.state,
    title: game.title,
    current: game.current,
    total: questions.length,
    seconds: game.seconds,
    msLeft:
      game.state === "question" ? msLeft(game.startedAt, game.seconds) : 0,
    question: showQuestion ? { prompt: q.prompt, options: q.options } : null,
    answered: answer?.choice ?? null,
    reveal:
      game.state === "reveal" && q
        ? {
            answer: q.answer,
            correct: answer?.correct ?? false,
            points: answer?.points ?? 0,
            explain: q.explain ?? null,
          }
        : null,
    me: {
      name: player.name,
      score: player.score,
      place: ranked?.find((p) => p.id === player.id)?.place ?? 0,
      players,
    },
    top: (game.state === "reveal" || game.state === "finished"
      ? (ranked ?? []).slice(0, TOP)
      : []
    ).map(({ name, score, place }) => ({ name, score, place })),
  };
}

export type HostView = {
  id: string;
  code: string;
  title: string;
  state: string;
  current: number;
  total: number;
  seconds: number;
  msLeft: number;
  players: { name: string; score: number; place: number }[];
  answeredCount: number;
  question: {
    prompt: string;
    options: string[];
    answer: number | null;
    explain: string | null;
    counts: number[] | null;
  } | null;
};

// The classroom screen: who joined, how many answered, and after the reveal
// the right answer, how the class voted and the ranking.
export async function hostView(
  db: PrismaClient,
  gameId: string,
): Promise<HostView | null> {
  const game = await db.liveGame.findUnique({
    where: { id: gameId },
    include: {
      players: {
        select: { id: true, name: true, score: true, createdAt: true },
      },
    },
  });
  if (!game) return null;
  const questions = parseQuestions(game.questions) ?? [];
  const q = questions[game.current];
  const answers =
    q && (game.state === "question" || game.state === "reveal")
      ? await db.liveAnswer.findMany({
          where: { gameId, question: game.current },
          select: { choice: true },
        })
      : [];
  const revealed = game.state === "reveal";
  return {
    id: game.id,
    code: game.code,
    title: game.title,
    state: game.state,
    current: game.current,
    total: questions.length,
    seconds: game.seconds,
    msLeft:
      game.state === "question" ? msLeft(game.startedAt, game.seconds) : 0,
    players: leaderboard(game.players).map(({ name, score, place }) => ({
      name,
      score,
      place,
    })),
    answeredCount: answers.length,
    question:
      q && game.state !== "lobby" && game.state !== "finished"
        ? {
            prompt: q.prompt,
            options: q.options,
            answer: revealed ? q.answer : null,
            explain: revealed ? (q.explain ?? null) : null,
            counts: revealed ? distribution(q.options.length, answers) : null,
          }
        : null,
  };
}
