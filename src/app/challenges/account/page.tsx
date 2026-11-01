import { getCtfTranslator } from "@/lib/challenges/view";

import { requirePlayer } from "@/lib/challenges/session";
import {
  DeleteAccountForm,
  PasswordForm,
  ResendVerification,
  UsernameForm,
} from "@/components/challenges/forms";

export async function generateMetadata() {
  const t = await getCtfTranslator();
  return { title: t("My account") };
}

export default async function AccountPage() {
  const player = await requirePlayer("/challenges/account");
  const t = await getCtfTranslator();
  const date = new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeZone: "Asia/Tashkent",
  });
  return (
    <>
      <p className="ctf-eyebrow">{t("Player")}</p>
      <h1 className="ctf-title">{player.username}</h1>
      <div className="ctf-grid">
        <section className="ctf-panel" aria-labelledby="ctf-profile">
          <h2 id="ctf-profile" className="ctf-h2">
            {t("Profile")}
          </h2>
          <dl className="ctf-dl">
            <dt>{t("Email")}</dt>
            <dd>{player.email}</dd>
            <dt>{t("Status")}</dt>
            <dd>
              {player.emailVerifiedAt
                ? t("Email confirmed")
                : t("Email not confirmed")}
            </dd>
            <dt>{t("Joined")}</dt>
            <dd>{date.format(player.createdAt)}</dd>
          </dl>
          {!player.emailVerifiedAt && <ResendVerification />}
        </section>
        <section className="ctf-panel" aria-labelledby="ctf-username">
          <h2 id="ctf-username" className="ctf-h2">
            {t("Username")}
          </h2>
          <UsernameForm username={player.username} />
        </section>
        <section className="ctf-panel" aria-labelledby="ctf-password">
          <h2 id="ctf-password" className="ctf-h2">
            {t("Password")}
          </h2>
          <PasswordForm />
        </section>
        <section className="ctf-panel" aria-labelledby="ctf-delete">
          <h2 id="ctf-delete" className="ctf-h2">
            {t("Delete the account")}
          </h2>
          <p className="ctf-muted ctf-small">
            {t("Your account, sessions and results are removed for good.")}
          </p>
          <DeleteAccountForm />
        </section>
      </div>
    </>
  );
}
