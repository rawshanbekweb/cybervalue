import { ConfirmButton } from "@/components/admin/confirm-button";
import { setReportLinkAction } from "@/app/admin/(cms)/telegram/actions";
import { site } from "@/lib/site";
import { reportPath } from "@/lib/reports";
import { deepLink, telegramConfig } from "@/lib/telegram/api";
import { signLink } from "@/lib/telegram/link";
import { linkSecret } from "@/lib/telegram/webhook";
import { CopyField } from "./copy-field";

type T = (source: string, values?: Record<string, string | number>) => string;

// The parent report link of a student or Junior member, and the Telegram
// link that sends parents the weekly summary.
export function ParentAccess({
  kind,
  id,
  token,
  chats,
  t,
}: {
  kind: "student" | "junior";
  id: string;
  token: string | null;
  chats: number;
  t: T;
}) {
  const config = telegramConfig();
  const secret = linkSecret();
  const url = token
    ? `${site.url.replace(/\/$/, "")}${reportPath(token)}`
    : null;
  const telegram =
    token && config && secret
      ? deepLink(
          config.username,
          signLink(secret, kind === "student" ? "p" : "j", id),
        )
      : null;
  return (
    <section className="admin-form" aria-labelledby={`parents-${id}`}>
      <h2 id={`parents-${id}`}>{t("Parents")}</h2>
      {url ? (
        <>
          <p className="muted">
            {t(
              "A read-only progress page. Anyone with the link can open it, so share it only with the family.",
            )}
          </p>
          <CopyField label={t("Report link")} value={url} />
          {telegram ? (
            <CopyField
              label={t("Weekly report in Telegram")}
              value={telegram}
            />
          ) : (
            <p className="muted">
              {t("Set up the Telegram bot to send parents a weekly summary.")}
            </p>
          )}
          {chats > 0 && (
            <p className="muted">
              {t("{count} parent chats receive the weekly summary.", {
                count: chats,
              })}
            </p>
          )}
          <div className="admin-row-actions">
            <form action={setReportLinkAction.bind(null, kind, id, true)}>
              <ConfirmButton
                type="submit"
                className="button button-secondary"
                message={t("Replace the link? The old one stops working.")}
              >
                {t("Replace link")}
              </ConfirmButton>
            </form>
            <form action={setReportLinkAction.bind(null, kind, id, false)}>
              <ConfirmButton
                type="submit"
                className="button button-secondary"
                message={t(
                  "Turn the report off? The link stops working and parent chats are unlinked.",
                )}
              >
                {t("Turn off")}
              </ConfirmButton>
            </form>
          </div>
        </>
      ) : (
        <>
          <p className="muted">
            {t(
              "Create a private link to a progress page that parents can open on any phone.",
            )}
          </p>
          <form action={setReportLinkAction.bind(null, kind, id, true)}>
            <button type="submit" className="button button-secondary">
              {t("Create report link")}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
