"use client";
import { useActionState } from "react";
import { useTranslator } from "@/components/locale-provider";
import { CopyField } from "@/components/admin/copy-field";
import {
  createStaffAction,
  deleteStaffAction,
  resetStaffPasswordAction,
  updateStaffAction,
  type TeamState,
} from "@/app/admin/(cms)/team/actions";

function Password({ state }: { state: TeamState }) {
  const t = useTranslator();
  if (!state?.password) return null;
  return (
    <div className="admin-notice" role="status">
      <p>
        {t(
          "The password is shown only now. Give it to {email} privately; they can change it under Account.",
          { email: state.email ?? "" },
        )}
      </p>
      <CopyField label={t("One-time password")} value={state.password} />
    </div>
  );
}

function GroupsField({
  id,
  defaultValue,
  groups,
}: {
  id: string;
  defaultValue: string;
  groups: string[];
}) {
  const t = useTranslator();
  return (
    <div className="admin-field">
      <label htmlFor={id}>{t("Groups (for teachers, comma separated)")}</label>
      <input
        id={id}
        name="groups"
        className="admin-input"
        defaultValue={defaultValue}
        maxLength={2000}
        list="team-groups"
        placeholder="3-A, 3-B"
      />
      <datalist id="team-groups">
        {groups.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>
    </div>
  );
}

export function CreateStaffForm({ groups }: { groups: string[] }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(createStaffAction, undefined);
  return (
    <form action={action} className="admin-form">
      <h2>{t("Add a team member")}</h2>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="staff-name">{t("Name")}</label>
          <input
            id="staff-name"
            name="name"
            className="admin-input"
            required
            maxLength={100}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="staff-email">{t("Email")}</label>
          <input
            id="staff-email"
            name="email"
            type="email"
            className="admin-input"
            required
            maxLength={200}
            autoComplete="off"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="staff-role">{t("Role")}</label>
          <select
            id="staff-role"
            name="role"
            className="admin-input"
            defaultValue="teacher"
          >
            <option value="teacher">{t("Teacher")}</option>
            <option value="owner">{t("Owner")}</option>
          </select>
        </div>
      </div>
      <GroupsField id="staff-groups" defaultValue="" groups={groups} />
      <p className="muted">
        {t(
          "A teacher sees only their groups, materials and assignments. An owner sees everything, including settings and clean-up.",
        )}
      </p>
      {state?.error && (
        <p className="admin-error" role="alert">
          {t(state.error)}
        </p>
      )}
      <Password state={state} />
      <button
        type="submit"
        className="button button-primary"
        disabled={pending}
      >
        {pending ? t("Creating…") : t("Create account")}
      </button>
    </form>
  );
}

export function StaffEditForm({
  id,
  name,
  role,
  groups,
  active,
  allGroups,
  self,
}: {
  id: string;
  name: string;
  role: string;
  groups: string[];
  active: boolean;
  allGroups: string[];
  self: boolean;
}) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    updateStaffAction.bind(null, id),
    undefined,
  );
  const [reset, resetAction, resetting] = useActionState(
    () => resetStaffPasswordAction(id),
    undefined,
  );
  const [removed, removeAction, removing] = useActionState(
    () => deleteStaffAction(id),
    undefined,
  );
  return (
    <div className="admin-form">
      <form action={action}>
        <div className="admin-field-row">
          <div className="admin-field">
            <label htmlFor={`role-${id}`}>{t("Role")}</label>
            <select
              id={`role-${id}`}
              name="role"
              className="admin-input"
              defaultValue={role}
              disabled={self}
            >
              <option value="teacher">{t("Teacher")}</option>
              <option value="owner">{t("Owner")}</option>
            </select>
            {self && <input type="hidden" name="role" value={role} />}
          </div>
        </div>
        <GroupsField
          id={`groups-${id}`}
          defaultValue={groups.join(", ")}
          groups={allGroups}
        />
        <label className="admin-field-checkbox">
          <input
            type="checkbox"
            name="active"
            defaultChecked={active}
            disabled={self}
          />
          {t("Can sign in (switching it off signs them out)")}
        </label>
        {self && <input type="hidden" name="active" value="on" />}
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
          {t("Save")}
        </button>
      </form>
      {!self && (
        <div className="admin-row-actions">
          <form action={resetAction}>
            <button
              type="submit"
              className="button button-secondary"
              disabled={resetting}
              onClick={(event) => {
                if (
                  !window.confirm(
                    t(
                      "Make a new password for {name}? The old one stops working.",
                      {
                        name,
                      },
                    ),
                  )
                )
                  event.preventDefault();
              }}
            >
              {t("New password")}
            </button>
          </form>
          <form action={removeAction}>
            <button
              type="submit"
              className="button button-danger"
              disabled={removing}
              onClick={(event) => {
                if (
                  !window.confirm(
                    t(
                      "Delete {name}'s account? Their site content stays, credited to you.",
                      {
                        name,
                      },
                    ),
                  )
                )
                  event.preventDefault();
              }}
            >
              {t("Delete account")}
            </button>
          </form>
        </div>
      )}
      {(reset?.error || removed?.error) && (
        <p className="admin-error" role="alert">
          {t((reset?.error || removed?.error)!)}
        </p>
      )}
      <Password state={reset} />
    </div>
  );
}
