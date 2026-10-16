"use server";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { site } from "@/lib/site";
import { newReportToken } from "@/lib/reports";
import { sendMessage, setWebhook, telegramConfig } from "@/lib/telegram/api";
import { webhookSecret } from "@/lib/telegram/webhook";

export type TelegramState =
  | { error?: string; success?: string; values?: Record<string, string> }
  | undefined;

// Turns a learner's parent report link on (a new token, which also replaces
// an old one) or off.
export async function setReportLinkAction(
  kind: "student" | "junior",
  id: string,
  on: boolean,
) {
  const session = await requireAdmin(
    kind === "student" ? `/admin/students/${id}` : `/admin/junior/${id}`,
  );
  const db = getDb();
  if (!db) return;
  const data = { reportToken: on ? newReportToken() : null };
  if (kind === "student")
    await db.student.update({ where: { id }, data }).catch(() => null);
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
  revalidatePath(
    kind === "student" ? `/admin/students/${id}` : `/admin/junior/${id}`,
  );
}

export async function connectWebhookAction(): Promise<TelegramState> {
  const session = await requireAdmin("/admin/telegram");
  if (!telegramConfig()) return { error: "The bot is not configured yet." };
  const secret = webhookSecret();
  if (!secret) return { error: "Set AUTH_SECRET or DATABASE_URL first." };
  const url = `${site.url.replace(/\/$/, "")}/api/telegram/webhook`;
  if (!url.startsWith("https://"))
    return { error: "Telegram needs a public HTTPS address (SITE_URL)." };
  const result = await setWebhook(url, secret);
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
  const session = await requireAdmin("/admin/telegram");
  const removed = await getDb()
    ?.telegramChat.delete({ where: { id } })
    .catch(() => null);
  if (removed) await audit("telegram.unlink", session.user.id, removed.subject);
  revalidatePath("/admin/telegram");
}
