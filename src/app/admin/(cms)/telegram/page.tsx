import { getAdminTranslator } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import {
  ConnectWebhookButton,
  TestMessageButton,
} from "@/components/admin/telegram-forms";
import { deepLink, telegramConfig } from "@/lib/telegram/api";
import { signLink } from "@/lib/telegram/link";
import { linkSecret } from "@/lib/telegram/webhook";
import { unlinkChatAction } from "./actions";

const ROLE: Record<string, string> = {
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

export default async function AdminTelegramPage() {
  const t = await getAdminTranslator();
  const session = await requireAdmin("/admin/telegram");
  const db = getDb();
  const config = telegramConfig();
  const secret = linkSecret();
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
              "Connect once after setting the token, and again if you change the site address.",
            )}
          </p>
          <ConnectWebhookButton />
          <h3>{t("Your notifications")}</h3>
          <p className="muted">
            {t(
              "Open this link on your phone and press Start: new practice answers and missed deadlines will reach you in Telegram.",
            )}
          </p>
          {teacherLink && (
            <p>
              <a href={teacherLink} target="_blank" rel="noreferrer">
                {t("Link my Telegram")}
              </a>
            </p>
          )}
          <TestMessageButton />
        </section>
      )}

      <div className="admin-cards">
        {(["teacher", "student", "parent"] as const).map((role) => (
          <div key={role} className="admin-card">
            <span className="eyebrow">{t(ROLE[role])}</span>
            <strong>{counts[role]}</strong>
            <span className="muted">{t("linked chats")}</span>
          </div>
        ))}
      </div>

      <h2>{t("What is sent")}</h2>
      <ul className="admin-steps">
        <li>
          {t(
            "Students: a new assignment for their group, and a reminder the day before it is due if it is not done.",
          )}
        </li>
        <li>
          {t(
            "Parents: every Monday morning, the week’s summary with a link to the full report.",
          )}
        </li>
        <li>
          {t(
            "You: each new practice answer to review, and every morning the deadlines students missed.",
          )}
        </li>
      </ul>
      <p className="muted">
        {t(
          "Students link their Telegram from their own page; parents from the link on the student’s or Junior member’s admin page. Anyone can stop with /stop.",
        )}
      </p>

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
                  <td>{formatDate(chat.createdAt)}</td>
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
