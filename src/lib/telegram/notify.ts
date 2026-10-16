import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { sendMessage, telegramConfig } from "./api";

/**
 * Sends one message to every chat linked to any of the subjects. Chats that
 * blocked the bot are unlinked. With `once`, a key already in the log is
 * skipped, so a reminder goes out a single time.
 */
export async function notify(
  db: PrismaClient,
  subjects: string[],
  html: string,
  once?: string,
) {
  if (!telegramConfig() || subjects.length === 0) return 0;
  if (once) {
    const fresh = await db.notificationLog
      .create({ data: { key: once } })
      .then(() => true)
      .catch(() => false);
    if (!fresh) return 0;
  }
  const chats = await db.telegramChat.findMany({
    where: { subject: { in: subjects } },
    select: { id: true, chatId: true },
  });
  let sent = 0;
  for (const chat of chats) {
    const result = await sendMessage(chat.chatId, html);
    if (result === "sent") sent++;
    else if (result === "gone")
      await db.telegramChat
        .delete({ where: { id: chat.id } })
        .catch(() => null);
  }
  return sent;
}

/** Every linked teacher. */
export async function teacherSubjects(db: PrismaClient) {
  const chats = await db.telegramChat.findMany({
    where: { subject: { startsWith: "teacher:" } },
    distinct: ["subject"],
    select: { subject: true },
  });
  return chats.map((c) => c.subject);
}

/** Runs a notification without letting a Telegram failure break the action. */
export async function quietly(work: () => Promise<unknown>) {
  try {
    await work();
  } catch (error) {
    console.error("telegram notification failed", error);
  }
}
