"use client";
import { useActionState, useId, useState } from "react";
import { useTranslator } from "@/components/locale-provider";
import {
  createTeamAction,
  joinTeamAction,
  leaveTeamAction,
  makeCaptainAction,
  removeMemberAction,
  renameTeamAction,
  renewInviteCodeAction,
  type FormState,
} from "@/app/challenges/actions";

function Message({ state }: { state: FormState }) {
  const t = useTranslator();
  if (state?.error)
    return (
      <p className="ctf-error" role="alert">
        {t(state.error)}
      </p>
    );
  if (state?.success)
    return (
      <p className="ctf-success" role="status">
        {t(state.success)}
      </p>
    );
  return null;
}

function OneField({
  action,
  label,
  name,
  button,
  defaultValue,
  ...input
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  label: string;
  name: string;
  button: string;
  defaultValue?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="ctf-form">
      <div className="ctf-field">
        <label htmlFor={id} className="ctf-label">
          {label}
        </label>
        <input
          id={id}
          name={name}
          className="ctf-input"
          required
          defaultValue={defaultValue}
          {...input}
        />
      </div>
      <Message state={state} />
      <div className="ctf-actions">
        <button type="submit" className="ctf-button" disabled={pending}>
          {button}
        </button>
      </div>
    </form>
  );
}

export function CreateTeamForm() {
  const t = useTranslator();
  return (
    <OneField
      action={createTeamAction}
      label={t("Team name")}
      name="name"
      button={t("Create the team")}
      minLength={2}
      maxLength={32}
      autoComplete="off"
    />
  );
}

export function JoinTeamForm() {
  const t = useTranslator();
  return (
    <OneField
      action={joinTeamAction}
      label={t("Invite code")}
      name="code"
      button={t("Join the team")}
      placeholder="XXXXX-XXXXX"
      maxLength={20}
      autoComplete="off"
      autoCapitalize="characters"
      spellCheck={false}
    />
  );
}

export function RenameTeamForm({ name }: { name: string }) {
  const t = useTranslator();
  return (
    <OneField
      action={renameTeamAction}
      label={t("Team name")}
      name="name"
      button={t("Save")}
      defaultValue={name}
      minLength={2}
      maxLength={32}
      autoComplete="off"
    />
  );
}

export function InviteCode({
  code,
  captain,
}: {
  code: string;
  captain: boolean;
}) {
  const t = useTranslator();
  const [copied, setCopied] = useState(false);
  const [state, action, pending] = useActionState(
    renewInviteCodeAction,
    undefined,
  );
  return (
    <div className="ctf-form">
      <p className="ctf-label">{t("Invite code")}</p>
      <div className="ctf-actions">
        <code className="ctf-code">{code}</code>
        <button
          type="button"
          className="ctf-button is-ghost"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? t("Copied") : t("Copy")}
        </button>
        {captain && (
          <form
            action={action}
            onSubmit={(event) => {
              if (
                !confirm(
                  t("Make a new code? The old one stops working at once."),
                )
              )
                event.preventDefault();
            }}
          >
            <button
              type="submit"
              className="ctf-button is-ghost"
              disabled={pending}
            >
              {t("New code")}
            </button>
          </form>
        )}
      </div>
      <p className="ctf-hint">
        {t("Share it only with your teammates. Anyone with the code can join.")}
      </p>
      <Message state={state} />
    </div>
  );
}

export function MemberActions({
  memberId,
  name,
}: {
  memberId: string;
  name: string;
}) {
  const t = useTranslator();
  const [removeState, remove, removing] = useActionState(
    removeMemberAction.bind(null, memberId),
    undefined,
  );
  const [captainState, promote, promoting] = useActionState(
    makeCaptainAction.bind(null, memberId),
    undefined,
  );
  return (
    <div className="ctf-actions">
      <form
        action={promote}
        onSubmit={(event) => {
          if (!confirm(t("Make {name} the captain?", { name })))
            event.preventDefault();
        }}
      >
        <button type="submit" className="ctf-link-button" disabled={promoting}>
          {t("Make captain")}
        </button>
      </form>
      <form
        action={remove}
        onSubmit={(event) => {
          if (!confirm(t("Remove {name} from the team?", { name })))
            event.preventDefault();
        }}
      >
        <button type="submit" className="ctf-link-button" disabled={removing}>
          {t("Remove")}
        </button>
      </form>
      <Message state={removeState ?? captainState} />
    </div>
  );
}

export function LeaveTeamButton({ last }: { last: boolean }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(leaveTeamAction, undefined);
  return (
    <form
      action={action}
      className="ctf-form"
      onSubmit={(event) => {
        const question = last
          ? t("You are the last member: the team will be deleted. Leave?")
          : t("Leave the team?");
        if (!confirm(question)) event.preventDefault();
      }}
    >
      <Message state={state} />
      <div className="ctf-actions">
        <button
          type="submit"
          className="ctf-button is-danger"
          disabled={pending}
        >
          {t("Leave the team")}
        </button>
      </div>
    </form>
  );
}
