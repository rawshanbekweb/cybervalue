"use client";
import { useTranslator } from "@/components/locale-provider";
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
  const t = useTranslator();
  return (
    <>
      {state?.error && (
        <p role="alert" className="admin-error">
          {t(state.error)}
        </p>
      )}
      {state?.success && <p role="status">{t(state.success)}</p>}
    </>
  );
}

export function MfaForms({ view }: { view: MfaView }) {
  const t = useTranslator();
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
      <h2 id="mfa-heading">{t("Two-factor authentication")}</h2>
      {confirmed?.recoveryCodes && (
        <div role="status">
          <p>
            <strong>{t("Save these recovery codes now.")}</strong>{" "}
            {t(
              "Each works once if you lose your authenticator. They will not be shown again.",
            )}
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
          {t(
            "Set {name} (32+ random characters) on the server to enable 2FA.",
            {
              name: "AUTH_SECRET",
            },
          )}
        </p>
      )}
      {view.status === "off" && (
        <form action={start}>
          <p className="admin-help">
            {t("Require a code from an authenticator app at every sign-in.")}
          </p>
          <Messages state={started} />
          <button className="button button-primary" disabled={starting}>
            {t("Set up 2FA")}
          </button>
        </form>
      )}
      {view.status === "setup" && (
        <>
          <p className="admin-help">
            {t(
              "Scan the QR code with an authenticator app, or enter the key manually, then type the 6-digit code it shows.",
            )}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- inline data URI, nothing to optimize */}
          <img
            src={view.qr}
            alt={t("QR code for your authenticator app")}
            width={200}
            height={200}
            className="admin-qr"
          />
          <p>
            {t("Key:")} <code className="admin-secret">{view.secret}</code>
          </p>
          <form action={confirm}>
            <div className="admin-field">
              <label htmlFor="mfa-code">{t("Code from the app")}</label>
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
              {confirming ? t("Checking…") : t("Turn on 2FA")}
            </button>
          </form>
          <form action={cancelMfaAction}>
            <button className="button button-secondary">
              {t("Cancel setup")}
            </button>
          </form>
        </>
      )}
      {view.status === "on" && (
        <form action={disable}>
          <p className="admin-help">
            {t("2FA is on. {count} of 8 recovery codes remain.", {
              count: view.recoveryLeft,
            })}
          </p>
          <div className="admin-field">
            <label htmlFor="mfa-password">{t("Current password")}</label>
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
            <label htmlFor="mfa-disable-code">{t("Authentication code")}</label>
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
            {t("Turn off 2FA")}
          </button>
        </form>
      )}
    </section>
  );
}
