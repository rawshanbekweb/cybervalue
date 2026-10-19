"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useTranslator } from "@/components/locale-provider";
import { RosterFile } from "@/components/admin/roster-file";
import {
  createJuniorsAction,
  resetJuniorCodeAction,
  updateJuniorAction,
} from "@/app/admin/(cms)/junior/actions";
import { formatJuniorCode } from "@/lib/junior/code-format";

function downloadCodes(rows: { name: string; group: string; code: string }[]) {
  const lines = rows.map(
    (row) =>
      `${row.name}${row.group ? ` | ${row.group}` : ""} | ${formatJuniorCode(row.code)}`,
  );
  const url = URL.createObjectURL(
    new Blob(
      [
        `Cybervalue Academy Junior — ${location.origin}/junior\n\n${lines.join("\n")}\n`,
      ],
      { type: "text/plain;charset=utf-8" },
    ),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "junior-access-codes.txt";
  a.click();
  URL.revokeObjectURL(url);
}

export function CreateJuniorsForm() {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    createJuniorsAction,
    undefined,
  );
  const [roster, setRoster] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  if (state?.codes)
    return (
      <section className="admin-form student-codes" aria-live="polite">
        <h2>{t("Access codes created")}</h2>
        <p>
          {t(
            "Codes are shown only now. Download the list and give each member their own code. Lost codes can be replaced from the member’s page.",
          )}
        </p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t("Name")}</th>
                <th scope="col">{t("Group")}</th>
                <th scope="col">{t("Access code")}</th>
              </tr>
            </thead>
            <tbody>
              {state.codes.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/admin/junior/${row.id}`}>{row.name}</Link>
                  </td>
                  <td>{row.group || "—"}</td>
                  <td>
                    <code className="student-code">
                      {formatJuniorCode(row.code)}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-row-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={() => downloadCodes(state.codes!)}
          >
            {t("Download codes")}
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => location.reload()}
          >
            {t("Add more members")}
          </button>
        </div>
      </section>
    );
  return (
    <form action={action} className="admin-form">
      <h2>{t("Add members")}</h2>
      <div className="admin-field">
        <label htmlFor="junior-roster">
          {t("One member per line: Full name | group (group is optional)")}
        </label>
        <textarea
          id="junior-roster"
          name="roster"
          className="admin-textarea"
          rows={6}
          required
          maxLength={25000}
          value={roster}
          onChange={(event) => setRoster(event.target.value)}
          placeholder={"Aziza Karimova | 7-A\nBobur Aliyev | 7-A"}
        />
      </div>
      <RosterFile onLoad={setRoster} />
      <div className="admin-field">
        <label htmlFor="junior-expires">
          {t("Access ends after (optional)")}
        </label>
        <input
          id="junior-expires"
          name="expiresAt"
          type="date"
          className="admin-input"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
        />
      </div>
      {state?.error && (
        <p className="admin-error" role="alert">
          {t(state.error, state.values)}
        </p>
      )}
      <button
        type="submit"
        className="button button-primary"
        disabled={pending}
      >
        {pending ? t("Creating…") : t("Create members and codes")}
      </button>
    </form>
  );
}

export function JuniorEditForm({
  member,
}: {
  member: {
    id: string;
    name: string;
    group: string;
    note: string;
    active: boolean;
    expiresAt: string;
  };
}) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    updateJuniorAction.bind(null, member.id),
    undefined,
  );
  return (
    <form action={action} className="admin-form">
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="name">{t("Name")}</label>
          <input
            id="name"
            name="name"
            className="admin-input"
            required
            maxLength={100}
            defaultValue={member.name}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="group">{t("Group")}</label>
          <input
            id="group"
            name="group"
            className="admin-input"
            maxLength={40}
            defaultValue={member.group}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="expiresAt">{t("Access ends after")}</label>
          <input
            id="expiresAt"
            name="expiresAt"
            type="date"
            className="admin-input"
            defaultValue={member.expiresAt}
          />
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor="note">{t("Private note")}</label>
        <textarea
          id="note"
          name="note"
          className="admin-textarea"
          rows={3}
          maxLength={2000}
          defaultValue={member.note}
        />
      </div>
      <div className="admin-field-checkbox">
        <input
          id="active"
          name="active"
          type="checkbox"
          defaultChecked={member.active}
        />
        <label htmlFor="active">
          {t("Access allowed (turning it off signs the member out)")}
        </label>
      </div>
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
        {pending ? t("Saving…") : t("Save")}
      </button>
    </form>
  );
}

export function ResetJuniorCodeForm({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    resetJuniorCodeAction.bind(null, id),
    undefined,
  );
  if (state?.code)
    return (
      <div className="admin-form" aria-live="polite">
        <p>{t("New access code for {name}:", { name })}</p>
        <p>
          <code className="student-code student-code-large">
            {formatJuniorCode(state.code)}
          </code>
        </p>
        <p className="muted">
          {t(
            "Shown only once. The old code no longer works and open sessions were closed.",
          )}
        </p>
      </div>
    );
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !window.confirm(
            t("Replace the access code? The old code stops working."),
          )
        )
          event.preventDefault();
      }}
    >
      {state?.error && (
        <p className="admin-error" role="alert">
          {t(state.error)}
        </p>
      )}
      <button
        type="submit"
        className="button button-secondary"
        disabled={pending}
      >
        {t("Issue a new access code")}
      </button>
    </form>
  );
}
