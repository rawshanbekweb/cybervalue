"use client";
import { useActionState } from "react";
import {
  changePasswordAction,
  revokeOtherSessionsAction,
} from "@/app/admin/(cms)/account/actions";

export function AccountForms() {
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
        <h2>Change password</h2>
        <p className="admin-help">
          Changing your password signs out all sessions. Sign in again with the
          new password.
        </p>
        <div className="admin-field">
          <label htmlFor="current-password">Current password</label>
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
          <label htmlFor="new-password">New password</label>
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
          <label htmlFor="confirm-password">Confirm new password</label>
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
            {state.error}
          </p>
        )}
        <button className="button button-primary" disabled={pending}>
          {pending ? "Changing…" : "Change password"}
        </button>
      </form>
      <form action={revoke} className="admin-form">
        <h2>Sessions</h2>
        <button disabled={revoking} className="button button-secondary">
          Sign out other sessions
        </button>
        {sessions?.error && (
          <p role="alert" className="admin-error">
            {sessions.error}
          </p>
        )}
        {sessions?.success && <p role="status">{sessions.success}</p>}
      </form>
    </>
  );
}
