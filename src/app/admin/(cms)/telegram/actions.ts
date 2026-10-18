"use server";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { requireAdmin, requireOwner } from "@/lib/auth";
import { requireMember } from "@/lib/staff-guard";
import { getDb } from "@/lib/db";
import { site } from "@/lib/site";
import { newReportToken } from "@/lib/reports";
import {
  sendMessage,
  setCommands,
  setWebhook,
  telegramConfig,
} from "@/lib/telegram/api";
import { BOT_COMMANDS } from "@/lib/telegram/commands";
import { webhookSecret } from "@/lib/telegram/webhook";
import { escapeHtml } from "@/lib/telegram/escape";

export type TelegramState =
  | { error?: string; success?: string; values?: Record<string, string> }
  | undefined;

// Turns a learner's parent report link on (a new token, which also replaces
// an old one) or off.
export async function setReportLinkAction(
  kind: "student" | "junior" | "kids",
  id: string,
  on: boolean,
) {
  const page =
    kind === "student"
      ? `/admin/students/${id}`
      : kind === "kids"
        ? `/admin/kids/${id}`
        : `/admin/junior/${id}`;
  const session = await requireMember(kind, id, page);
  const db = getDb();
  if (!db) return;
  const data = { reportToken: on ? newReportToken() : null };
  if (kind === "student")
    await db.student.update({ where: { id }, data }).catch(() => null);
  else if (kind === "kids")
    await db.kidsMember.update({ where: { id }, data }).catch(() => null);
  else await db.juniorMember.update({ where: { id }, data }).catch(() => null);
  if (!on)
    await db.telegramChat.deleteMany({
      where: { subject: `parent:${kind}:${id}` },
    });
  await audit(
    "report.link",
    session.user.id,
    `${kind}:${id}:${on ? "on" : "off"}`,
  );
  revalidatePath(page);
}

export async function connectWebhookAction(): Promise<TelegramState> {
  const session = await requireOwner("/admin/telegram");
  if (!telegramConfig()) return { error: "The bot is not configured yet." };
  const secret = webhookSecret();
  if (!secret) return { error: "Set AUTH_SECRET or DATABASE_URL first." };
  const url = `${site.url.replace(/\/$/, "")}/api/telegram/webhook`;
  if (!url.startsWith("https://"))
    return { error: "Telegram needs a public HTTPS address (SITE_URL)." };
  const result = await setWebhook(url, secret);
  if (result.ok) await setCommands(BOT_COMMANDS);
  await audit("telegram.webhook", session.user.id, result.ok ? "ok" : "failed");
  return result.ok
    ? { success: "The bot is connected to the site." }
    : {
        error: "Telegram refused: {reason}",
        values: { reason: result.description || "—" },
      };
}

export async function testTeacherMessageAction(): Promise<TelegramState> {
  const session = await requireAdmin("/admin/telegram");
  const db = getDb();
  if (!db || !telegramConfig())
    return { error: "The bot is not configured yet." };
  const chats = await db.telegramChat.findMany({
    where: { subject: `teacher:${session.user.id}` },
  });
  if (!chats.length)
    return { error: "Link your Telegram first with the button above." };
  const results = await Promise.all(
    chats.map((c) =>
      sendMessage(
        c.chatId,
        "Cybervalue: test xabari. Bildirishnomalar ishlayapti.",
      ),
    ),
  );
  return results.includes("sent")
    ? { success: "Test message sent." }
    : { error: "Telegram did not accept the message." };
}

export async function unlinkChatAction(id: string) {
  const session = await requireOwner("/admin/telegram");
  const removed = await getDb()
    ?.telegramChat.delete({ where: { id } })
    .catch(() => null);
  if (removed) await audit("telegram.unlink", session.user.id, removed.subject);
  revalidatePath("/admin/telegram");
}

const AUDIENCES = ["students", "parents", "both"] as const;

// Sends the teacher's own message to the linked students and/or parents of
// one group (or every group). A chat linked for several people gets it once.
export async function broadcastAction(
  _state: TelegramState,
  form: FormData,
): Promise<TelegramState> {
  const session = await requireOwner("/admin/telegram");
  const db = getDb();
  if (!db || !telegramConfig())
    return { error: "The bot is not configured yet." };
  const audience = String(form.get("audience") ?? "");
  const group = String(form.get("group") ?? "").trim();
  const text = String(form.get("message") ?? "").trim();
  const values = { audience, group, message: text };
  if (!AUDIENCES.includes(audience as (typeof AUDIENCES)[number]))
    return { error: "Choose who receives the message.", values };
  if (!text) return { error: "Write the message first.", values };
  if (text.length > 3000)
    return {
      error: "The message is too long (3000 characters at most).",
      values,
    };
  const students = await db.student.findMany({
    where: { active: true, ...(group ? { group } : {}) },
    select: { id: true },
  });
  const subjects = students.flatMap((s) => [
    ...(audience !== "parents" ? [`student:${s.id}`] : []),
    ...(audience !== "students" ? [`parent:student:${s.id}`] : []),
  ]);
  const chats = subjects.length
    ? await db.telegramChat.findMany({
        where: { subject: { in: subjects } },
        select: { id: true, chatId: true },
      })
    : [];
  const unique = [...new Map(chats.map((c) => [c.chatId, c])).values()];
  if (!unique.length)
    return {
      error: "Nobody in this audience has linked Telegram yet.",
      values,
    };
  const html = `<b>Cybervalue · o‘qituvchidan xabar</b>\n\n${escapeHtml(text)}`;
  let sent = 0;
  for (const chat of unique) {
    const result = await sendMessage(chat.chatId, html);
    if (result === "sent") sent++;
    else if (result === "gone")
      await db.telegramChat
        .deleteMany({ where: { chatId: chat.chatId } })
        .catch(() => null);
  }
  await audit(
    "telegram.broadcast",
    session.user.id,
    `${audience}:${group || "*"}:${sent}/${unique.length}`,
  );
  return {
    success: "Sent to {sent} of {total} chats.",
    values: { sent: String(sent), total: String(unique.length) },
  };
}
