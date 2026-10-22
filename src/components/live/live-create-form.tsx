"use client";
import { useActionState } from "react";
import { useTranslator } from "@/components/locale-provider";
import { createLiveGameAction } from "@/app/teacher/(panel)/live/actions";

export function LiveCreateForm({
  tests,
}: {
  tests: { id: string; title: string; count: number }[];
}) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    createLiveGameAction,
    undefined,
  );
  if (!tests.length)
    return (
      <p className="muted">
        {t(
          "Create a test under Student materials first; its questions are used in the game.",
        )}
      </p>
    );
  return (
    <form action={action} className="admin-form" aria-labelledby="live-new">
      <h2 id="live-new">{t("New live quiz")}</h2>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="live-material">{t("Test")}</label>
          <select
            id="live-material"
            name="material"
            className="admin-input"
            required
          >
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {t("{title} · {count} questions", {
                  title: test.title,
                  count: test.count,
                })}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="live-seconds">{t("Seconds per question")}</label>
          <select
            id="live-seconds"
            name="seconds"
            className="admin-input"
            defaultValue="20"
          >
            {[10, 20, 30, 60].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      {state?.error && (
        <p className="admin-error" role="alert">
          {t(state.error)}
        </p>
      )}
      <button
        type="submit"
        className="button button-primary"
        disabled={pending}
      >
        {t("Open the game")}
      </button>
    </form>
  );
}
