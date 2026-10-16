import "server-only";

// The bot is optional: without TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_USERNAME
// every notification is skipped and the admin page explains the setup.
export function telegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
  const username = (process.env.TELEGRAM_BOT_USERNAME ?? "").replace(/^@/, "");
  if (!/^\d{5,}:[A-Za-z0-9_-]{30,}$/.test(token)) return null;
  if (!/^[A-Za-z][A-Za-z0-9_]{3,31}bot$/i.test(username)) return null;
  return {
    token,
    username,
    // Tests point this at a local stand-in.
    api: (process.env.TELEGRAM_API_URL || "https://api.telegram.org").replace(
      /\/$/,
      "",
    ),
  };
}

export { escapeHtml } from "./escape";

export type SendResult = "sent" | "gone" | "failed";

async function call(method: string, body: Record<string, unknown>) {
  const config = telegramConfig();
  if (!config) return null;
  const response = await fetch(`${config.api}/bot${config.token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  return response;
}

/** Sends HTML text; "gone" means the person blocked the bot or left. */
export async function sendMessage(
  chatId: string,
  html: string,
): Promise<SendResult> {
  const response = await call("sendMessage", {
    chat_id: chatId,
    text: html,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
  });
  if (!response) return "failed";
  if (response.ok) return "sent";
  return response.status === 403 || response.status === 400 ? "gone" : "failed";
}

export async function setWebhook(url: string, secret: string) {
  const response = await call("setWebhook", {
    url,
    secret_token: secret,
    allowed_updates: ["message"],
    drop_pending_updates: true,
  });
  if (!response) return { ok: false, description: "No response" };
  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    description?: string;
  } | null;
  return { ok: Boolean(data?.ok), description: data?.description ?? "" };
}

export const deepLink = (username: string, payload: string) =>
  `https://t.me/${username}?start=${payload}`;
