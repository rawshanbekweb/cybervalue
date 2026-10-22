"use client";
import { useActionState } from "react";
import { useTranslator } from "@/components/locale-provider";
import {
  renameGroupAction,
  setGroupTeachersAction,
} from "@/app/teacher/(panel)/groups/actions";

export function GroupForms({
  group,
  teachers,
  assigned,
}: {
  group: string;
  teachers: { id: string; name: string }[];
  assigned: string[];
}) {
  const t = useTranslator();
  const [renamed, rename, renaming] = useActionState(
    renameGroupAction.bind(null, group),
    undefined,
  );
  const [saved, save, saving] = useActionState(
    setGroupTeachersAction.bind(null, group),
    undefined,
  );
  const id = group.replace(/[^\p{L}\p{N}]/gu, "_");
  return (
    <div className="admin-form">
      <form action={rename} className="admin-filters">
        <div className="admin-field">
          <label htmlFor={`rename-${id}`}>{t("Group name")}</label>
          <input
            id={`rename-${id}`}
            name="name"
            className="admin-input"
            defaultValue={group}
            required
            maxLength={40}
          />
        </div>
        <button
          type="submit"
          className="button button-secondary"
          disabled={renaming}
          onClick={(event) => {
            const input = event.currentTarget.form?.elements.namedItem(
              "name",
            ) as HTMLInputElement | null;
            if (
              input &&
              input.value.trim() !== group &&
              !window.confirm(
                t(
                  "Rename “{from}” to “{to}” for every student, assignment, material and teacher?",
                  { from: group, to: input.value.trim() },
                ),
              )
            )
              event.preventDefault();
          }}
        >
          {t("Rename")}
        </button>
      </form>
      {renamed?.error && (
        <p className="admin-error" role="alert">
          {t(renamed.error)}
        </p>
      )}
      <form action={save}>
        <fieldset className="admin-field">
          <legend>{t("Teachers of this group")}</legend>
          {teachers.length === 0 ? (
            <p className="muted">
              {t("No teacher accounts yet. Add them on the Team page.")}
            </p>
          ) : (
            teachers.map((teacher) => (
              <label key={teacher.id} className="admin-field-checkbox">
                <input
                  type="checkbox"
                  name="teacher"
                  value={teacher.id}
                  defaultChecked={assigned.includes(teacher.id)}
                />
                {teacher.name}
              </label>
            ))
          )}
        </fieldset>
        {saved?.success && <p role="status">{t(saved.success)}</p>}
        {teachers.length > 0 && (
          <button
            type="submit"
            className="button button-primary"
            disabled={saving}
          >
            {t("Save teachers")}
          </button>
        )}
      </form>
    </div>
  );
}
