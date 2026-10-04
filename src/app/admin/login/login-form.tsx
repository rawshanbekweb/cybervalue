"use client";
import { useActionState } from "react";
import {
  cancelChallengeAction,
  loginAction,
  verifyCodeAction,
  type LoginState,
} from "./actions";

export function LoginForm({
  next,
  pendingCode = false,
}: {
  next?: string;
  pendingCode?: boolean;
}) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  if (state?.step === "code" || pendingCode)
    return <CodeForm next={next} initial={state} />;
  return (
    <form action={action} className="admin-form admin-login-form">
      {next && <input type="hidden" name="next" value={next} />}
      <div className="admin-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="admin-input"
        />
      </div>
      <div className="admin-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="admin-input"
        />
      </div>
      {state?.error && (
        <p className="admin-error" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="button button-primary"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function CodeForm({ next, initial }: { next?: string; initial: LoginState }) {
  const [state, action, pending] = useActionState(verifyCodeAction, initial);
  return (
    <div className="admin-form admin-login-form">
      <form action={action} className="admin-form">
        {next && <input type="hidden" name="next" value={next} />}
        <div className="admin-field">
          <label htmlFor="code">Authentication code</label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            autoFocus
            required
            maxLength={32}
            aria-describedby="code-help"
            className="admin-input"
          />
          <p id="code-help" className="muted">
            Enter the 6-digit code from your authenticator app, or one of your
            recovery codes.
          </p>
        </div>
        {state?.error && (
          <p className="admin-error" role="alert">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="button button-primary"
        >
          {pending ? "Verifying…" : "Verify"}
        </button>
      </form>
      <form action={cancelChallengeAction}>
        <button type="submit" className="button button-secondary">
          Start over
        </button>
      </form>
    </div>
  );
}
