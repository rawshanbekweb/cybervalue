"use client";
import { useTranslator } from "@/components/locale-provider";

import { useActionState } from "react";
import { changeContentAction } from "@/app/admin/(cms)/[collection]/actions";
import { ConfirmButton } from "./confirm-button";

export function EntryActions({
  collection,
  entry,
}: {
  collection: string;
  entry: { id: string; title: string; status: string };
}) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    changeContentAction.bind(null, collection, entry.id),
    undefined,
  );
  return (
    <form action={action} aria-label={`Actions for ${entry.title}`}>
      <fieldset disabled={pending} className="admin-row-actions">
        {entry.status !== "PUBLISHED" && (
          <button
            name="operation"
            value="PUBLISHED"
            className="button button-secondary"
          >
            {t("Publish")}
          </button>
        )}
        {entry.status !== "DRAFT" && (
          <button
            name="operation"
            value="DRAFT"
            className="button button-secondary"
          >
            {t("Move to draft")}
          </button>
        )}
        {entry.status !== "ARCHIVED" && (
          <button
            name="operation"
            value="ARCHIVED"
            className="button button-secondary"
          >
            {t("Archive")}
          </button>
        )}
        <ConfirmButton
          type="submit"
          name="operation"
          value="delete"
          className="button button-secondary"
          message={`Permanently delete "${entry.title}"? This cannot be undone.`}
        >
          {t("Delete")}
        </ConfirmButton>
      </fieldset>
      {pending && (
        <span role="status" className="admin-help">
          {t("Saving…")}
        </span>
      )}
      {state?.error && (
        <p role="alert" className="admin-error">
          {t(state.error)}
        </p>
      )}
    </form>
  );
}
