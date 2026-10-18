"use client";
import { useActionState } from "react";
import { useTranslator } from "@/components/locale-provider";
import {
  cleanupAction,
  type CleanupState,
} from "@/app/admin/(cms)/cleanup/actions";

export function CleanupButton({
  id,
  count,
  people,
}: {
  id: string;
  count: number;
  people: boolean;
}) {
  const t = useTranslator();
  const [state, action, pending] = useActionState<CleanupState>(
    () => cleanupAction(id),
    undefined,
  );
  return (
    <form
      action={action}
      className="admin-inline-form"
      onSubmit={(event) => {
        const question = people
          ? t(
              "Move {count} accounts with all their answers and progress to the trash? You can restore them for 30 days.",
              { count },
            )
          : t("Delete {count} items for good?", { count });
        if (!window.confirm(question)) event.preventDefault();
      }}
    >
      <button
        type="submit"
        className={`button ${people ? "button-danger" : "button-secondary"}`}
        disabled={pending || count === 0}
      >
        {count === 0 ? t("Nothing to delete") : t("Delete {count}", { count })}
      </button>
      {state?.error && (
        <p className="admin-error" role="alert">
          {t(state.error)}
        </p>
      )}
      {state?.success && <p role="status">{t(state.success, state.values)}</p>}
    </form>
  );
}
