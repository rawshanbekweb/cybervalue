import { getAdminTranslator } from "@/lib/i18n/server";
import { getSession } from "@/lib/auth";
import { hasPendingChallenge } from "@/lib/mfa";
import { LoginForm } from "./login-form";
import { continueSessionAction } from "../actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; changed?: string }>;
}) {
  const t = await getAdminTranslator();
  const session = await getSession();
  const { next, changed } = await searchParams;
  // A redirect here could loop for a browser holding the old /admin-only
  // cookie; the button moves the cookie first.
  if (session)
    return (
      <div className="container admin-auth-page">
        <span className="eyebrow">{t("Cybervalue staff")}</span>
        <h1>{t("You are signed in")}</h1>
        <p className="muted">{session.user.email}</p>
        <form action={continueSessionAction}>
          {next && <input type="hidden" name="next" value={next} />}
          <button type="submit" className="button button-primary">
            {t("Continue")}
          </button>
        </form>
      </div>
    );
  return (
    <div className="container admin-auth-page">
      <span className="eyebrow">{t("Cybervalue staff")}</span>
      <h1>{t("Sign in")}</h1>
      <p className="muted">{t("Private area. Not for public use.")}</p>
      {changed === "1" && (
        <p role="status">
          {t("Password changed. Sign in with your new password.")}
        </p>
      )}
      <LoginForm next={next} pendingCode={await hasPendingChallenge()} />
    </div>
  );
}
