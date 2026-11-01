import "server-only";
import { appendFile } from "node:fs/promises";

// Email for CTF Challenges goes through Resend (https://resend.com) when
// RESEND_API_KEY and EMAIL_FROM are set. Without them nothing leaves the
// server: development and tests read the message from the server log or,
// when EMAIL_OUTBOX is set, from that file (one JSON line per message).
export type Mail = { to: string; subject: string; text: string; html: string };

export function mailConfig() {
  const key = process.env.RESEND_API_KEY ?? "";
  const from = process.env.EMAIL_FROM ?? "";
  if (!/^re_[A-Za-z0-9_]{10,}$/.test(key) || !from.includes("@")) return null;
  return {
    key,
    from,
    api: (process.env.RESEND_API_URL || "https://api.resend.com").replace(
      /\/$/,
      "",
    ),
  };
}

export async function sendMail(mail: Mail): Promise<boolean> {
  const config = mailConfig();
  if (!config) {
    const outbox = process.env.EMAIL_OUTBOX;
    if (outbox)
      await appendFile(
        outbox,
        `${JSON.stringify({ ...mail, at: Date.now() })}\n`,
      );
    else if (process.env.NODE_ENV !== "production")
      console.info(`[mail to ${mail.to}] ${mail.subject}\n${mail.text}`);
    else
      console.warn(
        "Email is not configured: set RESEND_API_KEY and EMAIL_FROM.",
      );
    return Boolean(outbox) || process.env.NODE_ENV !== "production";
  }
  const response = await fetch(`${config.api}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!response?.ok)
    console.warn(
      `Email to the CTF player failed (${response?.status ?? "no response"}).`,
    );
  return Boolean(response?.ok);
}
