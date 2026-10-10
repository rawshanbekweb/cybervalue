"use client";
import { useActionState } from "react";
import { useTranslator } from "@/components/locale-provider";
import { studentLoginAction } from "../actions";

export function StudentLoginForm() {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    studentLoginAction,
    undefined,
  );
  return (
    <form action={action} className="student-login-form">
      <label htmlFor="student-code" className="student-field-label">
        {t("Access code")}
      </label>
      <input
        id="student-code"
        name="code"
        required
        autoComplete="one-time-code"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={40}
        placeholder="XXXX-XXXX-XXXX-XXXX"
        aria-describedby={state?.error ? "student-code-error" : undefined}
        aria-invalid={state?.error ? true : undefined}
        className="student-input student-code-input"
      />
      {state?.error && (
        <p id="student-code-error" className="student-error" role="alert">
          {t(state.error)}
        </p>
      )}
      <button type="submit" className="student-button" disabled={pending}>
        {pending ? t("Checking…") : t("Enter")}
      </button>
    </form>
  );
}
