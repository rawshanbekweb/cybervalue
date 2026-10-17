"use client";
import { useActionState } from "react";
import { useTranslator } from "@/components/locale-provider";
import {
  broadcastAction,
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

export function BroadcastForm({ groups }: { groups: string[] }) {
  const t = useTranslator();
  const [state, run, pending] = useActionState(broadcastAction, undefined);
  const values = state?.error ? state.values : undefined;
  return (
    <form
      action={run}
      className="admin-form"
      aria-labelledby="broadcast-title"
      id="broadcast"
    >
      <h2 id="broadcast-title">{t("Send a message")}</h2>
      <p className="muted">
        {t(
          "Goes to everyone in the chosen audience who has linked Telegram. Use it for lesson changes, homework or news.",
        )}
      </p>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="broadcast-audience">{t("Who receives it")}</label>
          <select
            id="broadcast-audience"
            name="audience"
            className="admin-input"
            defaultValue={values?.audience ?? "both"}
          >
            <option value="both">{t("Students and parents")}</option>
            <option value="students">{t("Students only")}</option>
            <option value="parents">{t("Parents only")}</option>
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="broadcast-group">{t("Group")}</label>
          <select
            id="broadcast-group"
            name="group"
            className="admin-input"
            defaultValue={values?.group ?? ""}
          >
            <option value="">{t("All groups")}</option>
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor="broadcast-message">{t("Message")}</label>
        <textarea
          id="broadcast-message"
          name="message"
          className="admin-input"
          rows={5}
          maxLength={3000}
          required
          defaultValue={values?.message ?? ""}
        />
      </div>
      {state?.error && (
        <p className="admin-error" role="alert">
          {t(state.error)}
        </p>
      )}
      {state?.success && <p role="status">{t(state.success, state.values)}</p>}
      <button
        type="submit"
        className="button button-primary"
        disabled={pending}
      >
        {t("Send")}
      </button>
    </form>
  );
}
