"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { quizSchema } from "@/lib/student/quiz";
import {
  newGameCode,
  nextState,
  parseQuestions,
  SECONDS,
} from "@/lib/live/game";

export type LiveFormState = { error?: string } | undefined;

export async function createLiveGameAction(
  _state: LiveFormState,
  form: FormData,
): Promise<LiveFormState> {
  const session = await requireAdmin("/admin/live");
  if (!(await limit(`admin-write:${session.user.id}`, 60, 60_000)))
    return { error: "Too many changes. Try again shortly." };
  const db = getDb();
  if (!db) return { error: "Database is not configured." };
  const seconds = SECONDS.find((s) => s === Number(form.get("seconds"))) ?? 20;
  const material = await db.studentMaterial.findFirst({
    where: { id: String(form.get("material") ?? ""), kind: "QUIZ" },
    select: { title: true, quiz: true },
  });
  const quiz = quizSchema.safeParse(material?.quiz);
  if (!material || !quiz.success)
    return { error: "Choose a test with questions." };
  // A code is unique among games still running.
  let code = newGameCode();
  for (let i = 0; i < 10; i++) {
    const taken = await db.liveGame.count({
      where: { code, state: { not: "finished" } },
    });
    if (!taken) break;
    code = newGameCode();
  }
  const game = await db.liveGame.create({
    data: { code, title: material.title, questions: quiz.data, seconds },
  });
  revalidatePath("/admin/live");
  redirect(`/admin/live/${game.id}`);
}

export async function liveCommandAction(
  id: string,
  command: "start" | "reveal" | "next" | "end",
) {
  await requireAdmin(`/admin/live/${id}`);
  const db = getDb();
  if (!db) return;
  const game = await db.liveGame.findUnique({ where: { id } });
  if (!game) return;
  const total = parseQuestions(game.questions)?.length ?? 0;
  const next = nextState(game, command, total);
  if (!next) return;
  // Only from the state just read, so a double click cannot skip a question.
  await db.liveGame.updateMany({
    where: { id, state: game.state, current: game.current },
    data: {
      ...next,
      ...(next.state === "question" ? { startedAt: new Date() } : {}),
      ...(next.state === "finished" ? { endedAt: new Date() } : {}),
    },
  });
  if (next.state === "finished") revalidatePath("/admin/live");
}

export async function deleteLiveGameAction(id: string) {
  await requireAdmin("/admin/live");
  await getDb()
    ?.liveGame.delete({ where: { id } })
    .catch(() => null);
  revalidatePath("/admin/live");
}
