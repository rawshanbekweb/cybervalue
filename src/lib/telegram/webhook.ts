import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { serverSecret } from "../server-secret";
import { readLink } from "./link";

export const webhookSecret = () => {
  const key = serverSecret("telegram-webhook");
  // Telegram allows 1–256 characters of A-Z, a-z, 0-9, _ and -.
  return key ? key.slice(0, 64) : null;
};
export const linkSecret = () => serverSecret("telegram-link");

type Update = {
  message?: {
    chat?: { id?: number; type?: string; first_name?: string; title?: string };
    text?: string;
  };
};

// What each kind of link connects, in the reply the person sees.
const LINKED: Record<string, string> = {
  teacher:
    "Ulandi. Endi bu chatga yangi javoblar va topshirilmagan topshiriqlar haqida xabar keladi.",
  student:
    "Ulandi. Topshiriq muddati yaqinlashganda shu yerga eslatma yuboramiz.",
  "parent:student":
    "Ulandi. Har dushanba farzandingizning haftalik natijalari shu yerga keladi.",
  "parent:junior":
    "Ulandi. Har dushanba farzandingizning Academy Junior natijalari shu yerga keladi.",
};

const HELP =
  "Bu Cybervalue bildirishnomalar boti. Ulash uchun o‘qituvchi bergan yoki saytdagi havolani oching. To‘xtatish: /stop";

/**
 * Handles one update and returns the reply, or null for nothing to say.
 * /start <payload> links the chat; /stop unlinks every subject of the chat.
 */
export async function handleUpdate(
  db: PrismaClient,
  update: Update,
): Promise<{ chatId: string; reply: string } | null> {
  const chat = update.message?.chat;
  const text = update.message?.text?.trim() ?? "";
  if (!chat?.id || chat.type !== "private") return null;
  const chatId = String(chat.id);
  if (text === "/stop") {
    await db.telegramChat.deleteMany({ where: { chatId } });
    return {
      chatId,
      reply:
        "Bildirishnomalar to‘xtatildi. Qayta ulash uchun havolani yana oching.",
    };
  }
  const payload = /^\/start\s+(\S+)$/.exec(text)?.[1];
  const secret = linkSecret();
  const link = payload && secret ? readLink(secret, payload) : null;
  if (!link) return { chatId, reply: HELP };
  const [role] = link.subject.split(":");
  const exists =
    link.kind === "t"
      ? await db.user.count({ where: { id: link.id } })
      : link.kind === "s"
        ? await db.student.count({ where: { id: link.id, active: true } })
        : link.kind === "p"
          ? await db.student.count({
              where: { id: link.id, reportToken: { not: null } },
            })
          : await db.juniorMember.count({
              where: { id: link.id, reportToken: { not: null } },
            });
  if (!exists)
    return {
      chatId,
      reply: "Bu havola endi ishlamaydi. O‘qituvchidan yangisini so‘rang.",
    };
  await db.telegramChat.upsert({
    where: { chatId_subject: { chatId, subject: link.subject } },
    update: {},
    create: {
      chatId,
      subject: link.subject,
      name: (chat.first_name ?? "").slice(0, 80),
    },
  });
  const key =
    role === "parent" ? link.subject.split(":").slice(0, 2).join(":") : role;
  return { chatId, reply: LINKED[key] ?? LINKED.student };
}
