import { timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";
import { telegramConfig } from "@/lib/telegram/api";
import { handleUpdate, webhookSecret } from "@/lib/telegram/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ok = () => new Response(null, { status: 200 });

// Telegram calls this with every message to the bot. The reply goes back in
// the response body, which Telegram turns into a sendMessage call.
export async function POST(request: Request) {
  const secret = webhookSecret();
  const given = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  if (
    !telegramConfig() ||
    !secret ||
    given.length !== secret.length ||
    !timingSafeEqual(Buffer.from(given), Buffer.from(secret))
  )
    return new Response("Forbidden", { status: 403 });
  const db = getDb();
  if (!db) return ok();
  const text = await request.text();
  if (text.length > 65536) return ok();
  let update: unknown;
  try {
    update = JSON.parse(text);
  } catch {
    return ok();
  }
  const result = await handleUpdate(
    db,
    update as Parameters<typeof handleUpdate>[1],
  );
  if (!result) return ok();
  return Response.json({
    method: "sendMessage",
    chat_id: result.chatId,
    text: result.reply,
  });
}
