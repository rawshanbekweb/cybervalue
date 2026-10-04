"use client";
import { useTranslator } from "@/components/locale-provider";
import { useActionState } from "react";
import {
  changePasswordAction,
  revokeOtherSessionsAction,
} from "@/app/admin/(cms)/account/actions";

export function AccountForms() {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    changePasswordAction,
    undefined,
  );
  const [sessions, revoke, revoking] = useActionState(
    revokeOtherSessionsAction,
    undefined,
  );
  return (
    <>
      <form className="admin-form" action={action}>
        <h2>{t("Change password")}</h2>
        <p className="admin-help">
          {t(
            "Changing your password signs out all sessions. Sign in again with the new password.",
          )}
        </p>
        <div className="admin-field">
          <label htmlFor="current-password">{t("Current password")}</label>
          <input
            id="current-password"
            name="current"
            type="password"
            autoComplete="current-password"
            required
            maxLength={200}
            className="admin-input"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="new-password">{t("New password")}</label>
          <input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={200}
            className="admin-input"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="confirm-password">{t("Confirm new password")}</label>
          <input
            id="confirm-password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={200}
            className="admin-input"
          />
        </div>
        {state?.error && (
          <p role="alert" className="admin-error">
            {t(state.error)}
          </p>
        )}
        <button className="button button-primary" disabled={pending}>
          {pending ? t("Changing…") : t("Change password")}
        </button>
      </form>
      <form action={revoke} className="admin-form">
        <h2>{t("Sessions")}</h2>
        <button disabled={revoking} className="button button-secondary">
          {t("Sign out other sessions")}
        </button>
        {sessions?.error && (
          <p role="alert" className="admin-error">
            {t(sessions.error)}
          </p>
        )}
        {sessions?.success && <p role="status">{t(sessions.success)}</p>}
      </form>
    </>
  );
}
