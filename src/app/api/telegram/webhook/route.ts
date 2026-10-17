import { timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";
import { telegramConfig } from "@/lib/telegram/api";
import { handleUpdate, webhookSecret } from "@/lib/telegram/webhook";
import { recordError } from "@/lib/errors/record";

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
  let result: Awaited<ReturnType<typeof handleUpdate>>;
  try {
    result = await handleUpdate(
      db,
      update as Parameters<typeof handleUpdate>[1],
    );
  } catch (error) {
    // Answer anyway, so Telegram does not resend the same update for hours;
    // the error shows in Admin → Errors.
    await recordError({
      source: "server",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      route: "route /api/telegram/webhook",
    });
    return ok();
  }
  if (!result) return ok();
  return Response.json({
    method: "sendMessage",
    chat_id: result.chatId,
    text: result.reply,
  });
}
