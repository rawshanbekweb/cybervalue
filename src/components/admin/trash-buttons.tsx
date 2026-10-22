"use client";
import { useActionState } from "react";
import { useTranslator } from "@/components/locale-provider";
import {
  emptyTrashAction,
  purgeAction,
  restoreAction,
  type TrashState,
} from "@/app/teacher/(panel)/trash/actions";

export function TrashItemButtons({ id, label }: { id: string; label: string }) {
  const t = useTranslator();
  const [restored, restore, restoring] = useActionState<TrashState>(
    () => restoreAction(id),
    undefined,
  );
  const [purged, purge, purging] = useActionState<TrashState>(
    () => purgeAction(id),
    undefined,
  );
  const error = restored?.error ?? purged?.error;
  return (
    <div className="admin-row-actions">
      <form action={restore}>
        <button
          type="submit"
          className="button button-primary"
          disabled={restoring || purging}
          aria-label={t("Restore {name}", { name: label })}
        >
          {t("Restore")}
        </button>
      </form>
      <form
        action={purge}
        onSubmit={(event) => {
          if (
            !window.confirm(
              t("Delete “{name}” for good? This cannot be undone.", {
                name: label,
              }),
            )
          )
            event.preventDefault();
        }}
      >
        <button
          type="submit"
          className="button button-secondary"
          disabled={restoring || purging}
          aria-label={t("Delete {name} for good", { name: label })}
        >
          {t("Delete for good")}
        </button>
      </form>
      {error && (
        <p className="admin-error" role="alert">
          {t(error)}
        </p>
      )}
    </div>
  );
}

export function EmptyTrashButton({ count }: { count: number }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState<TrashState>(
    () => emptyTrashAction(),
    undefined,
  );
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !window.confirm(
            t("Delete all {count} items for good? This cannot be undone.", {
              count,
            }),
          )
        )
          event.preventDefault();
      }}
    >
      <button
        type="submit"
        className="button button-danger"
        disabled={pending || count === 0}
      >
        {t("Empty trash")}
      </button>
      {state?.error && (
        <p className="admin-error" role="alert">
          {t(state.error)}
        </p>
      )}
    </form>
  );
}
