"use client";
import Link from "next/link";
import { useActionState, useId } from "react";
import { useTranslator } from "@/components/locale-provider";
import {
  changePasswordAction,
  changeUsernameAction,
  deleteAccountAction,
  forgotAction,
  loginAction,
  registerAction,
  resendVerificationAction,
  resetPasswordAction,
  verifyEmailAction,
  type FormState,
} from "@/app/challenges/actions";

function Message({ state, id }: { state: FormState; id: string }) {
  const t = useTranslator();
  if (state?.error)
    return (
      <p id={id} className="ctf-error" role="alert">
        {t(state.error)}
      </p>
    );
  if (state?.success)
    return (
      <p id={id} className="ctf-success" role="status">
        {t(state.success)}
      </p>
    );
  return null;
}

function Field({
  label,
  hint,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}) {
  // Several forms on one page share field names, so ids must be unique.
  const id = useId();
  return (
    <div className="ctf-field">
      <label htmlFor={id} className="ctf-label">
        {label}
      </label>
      <input
        id={id}
        className="ctf-input"
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...input}
      />
      {hint && (
        <p id={`${id}-hint`} className="ctf-hint">
          {hint}
        </p>
      )}
    </div>
  );
}

function CheckEmail({ title }: { title: string }) {
  const t = useTranslator();
  return (
    <div className="ctf-panel" role="status">
      <h3>{title}</h3>
      <p className="ctf-muted">
        {t(
          "If the address can be used, a message is on its way. Check your inbox and the spam folder; the link works for a limited time.",
        )}
      </p>
      <Link href="/challenges/login" className="ctf-button is-ghost">
        {t("Sign in")}
      </Link>
    </div>
  );
}

export function RegisterForm() {
  const t = useTranslator();
  const [state, action, pending] = useActionState(registerAction, undefined);
  if (state?.success === "check-email")
    return <CheckEmail title={t("Check your email")} />;
  return (
    <form action={action} className="ctf-form" noValidate={false}>
      <Field
        label={t("Email")}
        name="email"
        type="email"
        required
        autoComplete="email"
        maxLength={254}
        defaultValue={state?.values?.email}
      />
      <Field
        label={t("Username")}
        hint={t("Shown on the scoreboard. 3–24 Latin letters, digits, . _ -")}
        name="username"
        required
        autoComplete="username"
        minLength={3}
        maxLength={24}
        pattern="[A-Za-z0-9][A-Za-z0-9._\-]*"
        spellCheck={false}
        defaultValue={state?.values?.username}
      />
      <Field
        label={t("Password")}
        hint={t("At least 10 characters. A long phrase is easier to remember.")}
        name="password"
        type="password"
        required
        autoComplete="new-password"
        minLength={10}
        maxLength={200}
      />
      <Field
        label={t("Repeat the password")}
        name="confirm"
        type="password"
        required
        autoComplete="new-password"
        minLength={10}
        maxLength={200}
      />
      <div className="ctf-hidden" aria-hidden="true">
        <label htmlFor="ctf-website">Website</label>
        <input
          id="ctf-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <label className="ctf-check">
        <input type="checkbox" name="rules" required />
        <span>
          {t("I accept the")}{" "}
          <Link href="/challenges/rules" target="_blank">
            {t("competition rules")}
          </Link>
        </span>
      </label>
      <Message state={state} id="ctf-register-message" />
      <button type="submit" className="ctf-button" disabled={pending}>
        {pending ? t("Creating the account…") : t("Create an account")}
      </button>
    </form>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="ctf-form">
      {next && <input type="hidden" name="next" value={next} />}
      <Field
        label={t("Email")}
        name="email"
        type="email"
        required
        autoComplete="email"
        defaultValue={state?.values?.email}
      />
      <Field
        label={t("Password")}
        name="password"
        type="password"
        required
        autoComplete="current-password"
        maxLength={200}
      />
      <Message state={state} id="ctf-login-message" />
      <button type="submit" className="ctf-button" disabled={pending}>
        {pending ? t("Checking…") : t("Sign in")}
      </button>
    </form>
  );
}

export function ForgotForm() {
  const t = useTranslator();
  const [state, action, pending] = useActionState(forgotAction, undefined);
  if (state?.success === "check-email")
    return <CheckEmail title={t("Check your email")} />;
  return (
    <form action={action} className="ctf-form">
      <Field
        label={t("Email")}
        name="email"
        type="email"
        required
        autoComplete="email"
        defaultValue={state?.values?.email}
      />
      <Message state={state} id="ctf-forgot-message" />
      <button type="submit" className="ctf-button" disabled={pending}>
        {pending ? t("Sending…") : t("Send a reset link")}
      </button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    resetPasswordAction,
    undefined,
  );
  if (state?.success === "reset")
    return (
      <div className="ctf-panel" role="status">
        <h3>{t("Password changed")}</h3>
        <p className="ctf-muted">
          {t("Every device was signed out. Sign in with the new password.")}
        </p>
        <Link href="/challenges/login" className="ctf-button">
          {t("Sign in")}
        </Link>
      </div>
    );
  return (
    <form action={action} className="ctf-form">
      <input type="hidden" name="token" value={token} />
      <Field
        label={t("New password")}
        hint={t("At least 10 characters. A long phrase is easier to remember.")}
        name="password"
        type="password"
        required
        autoComplete="new-password"
        minLength={10}
        maxLength={200}
      />
      <Field
        label={t("Repeat the password")}
        name="confirm"
        type="password"
        required
        autoComplete="new-password"
        minLength={10}
        maxLength={200}
      />
      <Message state={state} id="ctf-reset-message" />
      <button type="submit" className="ctf-button" disabled={pending}>
        {pending ? t("Saving…") : t("Set the new password")}
      </button>
    </form>
  );
}

export function VerifyForm({ token }: { token: string }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(verifyEmailAction, undefined);
  if (state?.success === "verified")
    return (
      <div className="ctf-panel" role="status">
        <h3>{t("Email confirmed")}</h3>
        <p className="ctf-muted">
          {t("You can now join competitions and teams.")}
        </p>
        <Link href="/challenges" className="ctf-button">
          {t("Go to CTF Challenges")}
        </Link>
      </div>
    );
  return (
    <form action={action} className="ctf-form">
      <input type="hidden" name="token" value={token} />
      <Message state={state} id="ctf-verify-message" />
      <button type="submit" className="ctf-button" disabled={pending}>
        {pending ? t("Checking…") : t("Confirm my email")}
      </button>
    </form>
  );
}

export function ResendVerification() {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    resendVerificationAction,
    undefined,
  );
  return (
    <form action={action} className="ctf-actions">
      <button type="submit" className="ctf-button is-ghost" disabled={pending}>
        {pending ? t("Sending…") : t("Send the link again")}
      </button>
      <Message state={state} id="ctf-resend-message" />
    </form>
  );
}

export function UsernameForm({ username }: { username: string }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    changeUsernameAction,
    undefined,
  );
  return (
    <form action={action} className="ctf-form">
      <Field
        label={t("Username")}
        hint={t("Shown on the scoreboard. 3–24 Latin letters, digits, . _ -")}
        name="username"
        required
        minLength={3}
        maxLength={24}
        pattern="[A-Za-z0-9][A-Za-z0-9._\-]*"
        spellCheck={false}
        defaultValue={username}
      />
      <Message state={state} id="ctf-username-message" />
      <div className="ctf-actions">
        <button type="submit" className="ctf-button" disabled={pending}>
          {t("Save")}
        </button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    changePasswordAction,
    undefined,
  );
  return (
    <form action={action} className="ctf-form">
      <Field
        label={t("Current password")}
        name="current"
        type="password"
        required
        autoComplete="current-password"
        maxLength={200}
      />
      <Field
        label={t("New password")}
        name="password"
        type="password"
        required
        autoComplete="new-password"
        minLength={10}
        maxLength={200}
      />
      <Field
        label={t("Repeat the password")}
        name="confirm"
        type="password"
        required
        autoComplete="new-password"
        minLength={10}
        maxLength={200}
      />
      <Message state={state} id="ctf-password-message" />
      <div className="ctf-actions">
        <button type="submit" className="ctf-button" disabled={pending}>
          {t("Change the password")}
        </button>
      </div>
    </form>
  );
}

export function DeleteAccountForm() {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    deleteAccountAction,
    undefined,
  );
  return (
    <form
      action={action}
      className="ctf-form"
      onSubmit={(event) => {
        if (!confirm(t("Delete the account for good? This cannot be undone.")))
          event.preventDefault();
      }}
    >
      <Field
        label={t("Current password")}
        name="current"
        type="password"
        required
        autoComplete="current-password"
        maxLength={200}
      />
      <Message state={state} id="ctf-delete-message" />
      <div className="ctf-actions">
        <button
          type="submit"
          className="ctf-button is-danger"
          disabled={pending}
        >
          {t("Delete the account")}
        </button>
      </div>
    </form>
  );
}
