import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import {
  BroadcastForm,
  ConnectWebhookButton,
  TestMessageButton,
} from "@/components/admin/telegram-forms";
import { BOT_COMMANDS } from "@/lib/telegram/commands";
import { deepLink, telegramConfig, webhookInfo } from "@/lib/telegram/api";
import { signLink } from "@/lib/telegram/link";
import { linkSecret } from "@/lib/telegram/webhook";
import { site } from "@/lib/site";
import { unlinkChatAction } from "./actions";

const ROLE: Record<string, string> = {
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

export default async function AdminTelegramPage() {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const session = await requireAdmin("/admin/telegram");
  const db = getDb();
  const config = telegramConfig();
  const secret = linkSecret();
  const delivery = config ? await webhookInfo() : null;
  const expected = `${site.url.replace(/\/$/, "")}/api/telegram/webhook`;
  const chats = db
    ? await db.telegramChat.findMany({
        orderBy: { createdAt: "desc" },
        take: 500,
      })
    : [];
  // Names for the subjects, looked up in one go per kind.
  const ids = (prefix: string) =>
    chats
      .filter((c) => c.subject.startsWith(prefix))
      .map((c) => c.subject.slice(prefix.length));
  const groups = db
    ? (
        await db.student.findMany({
          where: { active: true, group: { not: "" } },
          distinct: ["group"],
          orderBy: { group: "asc" },
          select: { group: true },
        })
      ).map((s) => s.group)
    : [];
  const [students, juniors, users] = db
    ? await Promise.all([
        db.student.findMany({
          where: {
            id: { in: [...ids("student:"), ...ids("parent:student:")] },
          },
          select: { id: true, name: true },
        }),
        db.juniorMember.findMany({
          where: { id: { in: ids("parent:junior:") } },
          select: { id: true, name: true },
        }),
        db.user.findMany({
          where: { id: { in: ids("teacher:") } },
          select: { id: true, email: true },
        }),
      ])
    : [[], [], []];
  const nameOf = (subject: string) => {
    const id = subject.split(":").at(-1)!;
    return (
      students.find((s) => s.id === id)?.name ??
      juniors.find((j) => j.id === id)?.name ??
      users.find((u) => u.id === id)?.email ??
      "—"
    );
  };
  const teacherLink =
    config && secret
      ? deepLink(config.username, signLink(secret, "t", session.user.id))
      : null;
  const counts = {
    teacher: chats.filter((c) => c.subject.startsWith("teacher:")).length,
    student: chats.filter((c) => c.subject.startsWith("student:")).length,
    parent: chats.filter((c) => c.subject.startsWith("parent:")).length,
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Telegram</h1>
          <p className="muted">
            {t(
              "Reminders for students, weekly reports for parents and alerts for you, sent by your own Telegram bot.",
            )}
          </p>
        </div>
      </div>

      {!config ? (
        <section className="admin-form" aria-labelledby="tg-setup">
          <h2 id="tg-setup">{t("Set up the bot")}</h2>
          <ol className="admin-steps">
            <li>
              {t(
                "In Telegram, open @BotFather, send /newbot and choose a name and a username ending in “bot”.",
              )}
            </li>
            <li>
              {t(
                "In Vercel → Settings → Environment Variables add TELEGRAM_BOT_TOKEN (the token from BotFather) and TELEGRAM_BOT_USERNAME (the username without @).",
              )}
            </li>
            <li>
              {t(
                "Add CRON_SECRET (any long random text) so the daily reminders can run, then redeploy.",
              )}
            </li>
            <li>
              {t("Come back here and press “Connect the bot to this site”.")}
            </li>
          </ol>
        </section>
      ) : (
        <section className="admin-form" aria-labelledby="tg-bot">
          <h2 id="tg-bot">{t("Bot @{name}", { name: config.username })}</h2>
          <p className="muted">
            {t(
              "Connect once after setting the token, and again if you change the site address. Connecting also refreshes the bot’s command menu.",
            )}
          </p>
          <ConnectWebhookButton />
          <ul className="admin-checks">
            <li>
              <span
                className={`admin-chip ${delivery?.url === expected ? "ok" : "warn"}`}
              >
                {delivery?.url === expected ? t("OK") : t("Check")}
              </span>
              <strong>{t("Webhook")}</strong>
              <span className="muted">
                {delivery === null
                  ? t("Telegram did not answer. Check TELEGRAM_BOT_TOKEN.")
                  : delivery.url
                    ? delivery.url
                    : t("Not connected yet. Press the button above.")}
              </span>
            </li>
            {delivery && (
              <li>
                <span
                  className={`admin-chip ${delivery.lastError ? "warn" : "ok"}`}
                >
                  {delivery.lastError ? t("Check") : t("OK")}
                </span>
                <strong>{t("Delivery")}</strong>
                <span className="muted">
                  {delivery.lastError
                    ? t("Last error from Telegram: {error}", {
                        error: delivery.lastError,
                      })
                    : t("No delivery errors.")}
                  {delivery.pending > 0 &&
                    ` · ${t("{count} messages waiting", { count: delivery.pending })}`}
                </span>
              </li>
            )}
          </ul>
          <h3>{t("Your notifications")}</h3>
          <p className="muted">
            {t(
              "Open this link on your phone and press Start: new practice answers and missed deadlines will reach you in Telegram.",
            )}
          </p>
          {teacherLink && (
            <p>
              <a
                href={teacherLink}
                target="_blank"
                rel="noreferrer"
                className="button button-primary"
              >
                {t("Link my Telegram")}
              </a>
            </p>
          )}
          <TestMessageButton />
        </section>
      )}

      <section className="admin-panel" aria-labelledby="tg-how">
        <h2 id="tg-how">{t("How it works")}</h2>
        <ol className="admin-steps">
          <li>
            <strong>{t("You")}:</strong>{" "}
            {t(
              "press “Link my Telegram” above and Start in the bot. You get new practice answers and missed deadlines; send /bugun for today’s class summary.",
            )}
          </li>
          <li>
            <strong>{t("Students")}:</strong>{" "}
            {t(
              "on their own page press “Link my Telegram”. They get new assignments and a reminder the day before the deadline; /topshiriqlar and /natija show their tasks and progress.",
            )}
          </li>
          <li>
            <strong>{t("Parents")}:</strong>{" "}
            {t(
              "on a student’s admin page, under Parents, create a report link and send the parent the Telegram link. Every Monday they get the week’s summary; /hisobot shows it any time.",
            )}
          </li>
        </ol>
        <p className="muted">{t("Anyone can stop the messages with /stop.")}</p>
      </section>

      {config && <BroadcastForm groups={groups} />}

      <div className="admin-cards">
        {(["teacher", "student", "parent"] as const).map((role) => (
          <div key={role} className="admin-card">
            <span className="eyebrow">{t(ROLE[role])}</span>
            <strong>{counts[role]}</strong>
            <span className="muted">{t("linked chats")}</span>
          </div>
        ))}
      </div>

      <h2>{t("Bot commands")}</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">{t("Command")}</th>
              <th scope="col">{t("What it does")}</th>
            </tr>
          </thead>
          <tbody>
            {BOT_COMMANDS.map((c) => (
              <tr key={c.command}>
                <td>
                  <code>/{c.command}</code>
                </td>
                <td>{c.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>{t("Linked chats")}</h2>
      {chats.length === 0 ? (
        <p className="muted">{t("No chats linked yet.")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t("For")}</th>
                <th scope="col">{t("Role")}</th>
                <th scope="col">{t("Telegram name")}</th>
                <th scope="col">{t("Linked")}</th>
                <th scope="col">
                  <span className="visually-hidden">{t("Actions")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {chats.map((chat) => (
                <tr key={chat.id}>
                  <td>{nameOf(chat.subject)}</td>
                  <td>{t(ROLE[chat.subject.split(":")[0]] ?? "—")}</td>
                  <td>{chat.name || "—"}</td>
                  <td>{formatDate(chat.createdAt, locale)}</td>
                  <td>
                    <form action={unlinkChatAction.bind(null, chat.id)}>
                      <ConfirmButton
                        type="submit"
                        className="button button-secondary"
                        message={t("Stop sending to this chat?")}
                      >
                        {t("Unlink")}
                      </ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
