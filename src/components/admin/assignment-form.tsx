"use client";
import { useActionState } from "react";
import { useTranslator } from "@/components/locale-provider";
import { createAssignmentAction } from "@/app/admin/(cms)/assignments/actions";

export type TargetGroup = {
  label: string;
  options: { value: string; label: string }[];
};

export function AssignmentForm({
  groups,
  everyone = true,
  targets,
  defaultDue,
}: {
  groups: string[];
  /** Owners may set work for every student; teachers only for a group. */
  everyone?: boolean;
  targets: TargetGroup[];
  defaultDue: string;
}) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    createAssignmentAction,
    undefined,
  );
  return (
    <form
      // A fresh form after each created assignment.
      key={state?.at ?? "new"}
      action={action}
      className="admin-form"
      aria-labelledby="new-assignment"
    >
      <h2 id="new-assignment">{t("New assignment")}</h2>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="assignment-title">{t("Title")}</label>
          <input
            id="assignment-title"
            name="title"
            className="admin-input"
            required
            maxLength={160}
            placeholder={t("e.g. Finish lessons 1–6 before Friday")}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="assignment-group">{t("Group")}</label>
          <select id="assignment-group" name="group" className="admin-input">
            {everyone && <option value="">{t("Every student")}</option>}
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="assignment-target">{t("What to do")}</label>
          <select
            id="assignment-target"
            name="target"
            className="admin-input"
            required
            defaultValue=""
          >
            <option value="" disabled>
              {t("Choose…")}
            </option>
            {targets.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="assignment-due">
            {t("Deadline (Tashkent time)")}
          </label>
          <input
            id="assignment-due"
            name="dueAt"
            type="datetime-local"
            className="admin-input"
            required
            defaultValue={defaultDue}
          />
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor="assignment-note">{t("Note for students")}</label>
        <textarea
          id="assignment-note"
          name="note"
          className="admin-textarea"
          rows={3}
          maxLength={2000}
        />
      </div>
      <p className="muted">
        {t(
          "Done is read from the site itself: a finished material or handed-in test, a passed lab checkpoint, or every lesson of a lab.",
        )}
      </p>
      {state?.error && (
        <p className="admin-error" role="alert">
          {t(state.error)}
        </p>
      )}
      {state?.success && <p role="status">{t(state.success)}</p>}
      <button
        type="submit"
        className="button button-primary"
        disabled={pending}
      >
        {pending ? t("Saving…") : t("Create assignment")}
      </button>
    </form>
  );
}
