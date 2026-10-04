"use client";
import { useActionState } from "react";
import {
  cancelMfaAction,
  confirmMfaAction,
  disableMfaAction,
  startMfaAction,
  type MfaState,
} from "@/app/admin/(cms)/account/mfa-actions";

export type MfaView =
  | { status: "unavailable" }
  | { status: "off" }
  | { status: "setup"; qr: string; secret: string }
  | { status: "on"; recoveryLeft: number };

function Messages({ state }: { state: MfaState }) {
  return (
    <>
      {state?.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
      {state?.success && <p role="status">{state.success}</p>}
    </>
  );
}

export function MfaForms({ view }: { view: MfaView }) {
  const [started, start, starting] = useActionState(startMfaAction, undefined);
  const [confirmed, confirm, confirming] = useActionState(
    confirmMfaAction,
    undefined,
  );
  const [disabled, disable, disabling] = useActionState(
    disableMfaAction,
    undefined,
  );

  return (
    <section className="admin-form" aria-labelledby="mfa-heading">
      <h2 id="mfa-heading">Two-factor authentication</h2>
      {confirmed?.recoveryCodes && (
        <div role="status">
          <p>
            <strong>Save these recovery codes now.</strong> Each works once if
            you lose your authenticator. They will not be shown again.
          </p>
          <ul className="admin-codes">
            {confirmed.recoveryCodes.map((code) => (
              <li key={code}>
                <code>{code}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
      {view.status === "unavailable" && (
        <p className="admin-help">
          Set <code>AUTH_SECRET</code> (32+ random characters) on the server to
          enable 2FA.
        </p>
      )}
      {view.status === "off" && (
        <form action={start}>
          <p className="admin-help">
            Require a code from an authenticator app at every sign-in.
          </p>
          <Messages state={started} />
          <button className="button button-primary" disabled={starting}>
            Set up 2FA
          </button>
        </form>
      )}
      {view.status === "setup" && (
        <>
          <p className="admin-help">
            Scan the QR code with an authenticator app, or enter the key
            manually, then type the 6-digit code it shows.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- inline data URI, nothing to optimize */}
          <img
            src={view.qr}
            alt="QR code for your authenticator app"
            width={200}
            height={200}
            className="admin-qr"
          />
          <p>
            Key: <code className="admin-secret">{view.secret}</code>
          </p>
          <form action={confirm}>
            <div className="admin-field">
              <label htmlFor="mfa-code">Code from the app</label>
              <input
                id="mfa-code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9 ]{6,7}"
                maxLength={7}
                required
                className="admin-input"
              />
            </div>
            <Messages state={confirmed} />
            <button className="button button-primary" disabled={confirming}>
              {confirming ? "Checking…" : "Turn on 2FA"}
            </button>
          </form>
          <form action={cancelMfaAction}>
            <button className="button button-secondary">Cancel setup</button>
          </form>
        </>
      )}
      {view.status === "on" && (
        <form action={disable}>
          <p className="admin-help">
            2FA is on. {view.recoveryLeft} of 8 recovery codes remain.
          </p>
          <div className="admin-field">
            <label htmlFor="mfa-password">Current password</label>
            <input
              id="mfa-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={200}
              className="admin-input"
            />
          </div>
          <div className="admin-field">
            <label htmlFor="mfa-disable-code">Authentication code</label>
            <input
              id="mfa-disable-code"
              name="code"
              autoComplete="one-time-code"
              required
              maxLength={32}
              className="admin-input"
            />
          </div>
          <Messages state={disabled} />
          <button className="button button-secondary" disabled={disabling}>
            Turn off 2FA
          </button>
        </form>
      )}
    </section>
  );
}
