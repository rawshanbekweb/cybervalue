"use client";
import { useActionState } from "react";
import { useTranslator } from "@/components/locale-provider";
import {
  connectWebhookAction,
  testTeacherMessageAction,
  type TelegramState,
} from "@/app/admin/(cms)/telegram/actions";

function ActionButton({
  action,
  label,
  primary,
}: {
  action: () => Promise<TelegramState>;
  label: string;
  primary?: boolean;
}) {
  const t = useTranslator();
  const [state, run, pending] = useActionState(action, undefined);
  return (
    <form action={run} className="admin-inline-form">
      <button
        type="submit"
        className={`button ${primary ? "button-primary" : "button-secondary"}`}
        disabled={pending}
      >
        {t(label)}
      </button>
      {state?.error && (
        <p className="admin-error" role="alert">
          {t(state.error, state.values)}
        </p>
      )}
      {state?.success && <p role="status">{t(state.success)}</p>}
    </form>
  );
}

export function ConnectWebhookButton() {
  return (
    <ActionButton
      action={connectWebhookAction}
      label="Connect the bot to this site"
      primary
    />
  );
}

export function TestMessageButton() {
  return (
    <ActionButton
      action={testTeacherMessageAction}
      label="Send a test message"
    />
  );
}
