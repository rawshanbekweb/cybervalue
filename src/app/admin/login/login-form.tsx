"use client";
import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
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
      {state?.error && <p className="admin-error">{state.error}</p>}
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
