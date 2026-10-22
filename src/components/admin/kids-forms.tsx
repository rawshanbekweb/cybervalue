"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useTranslator } from "@/components/locale-provider";
import { RosterFile } from "@/components/admin/roster-file";
import {
  createKidsAction,
  resetKidCodeAction,
  updateKidAction,
} from "@/app/teacher/(panel)/kids/actions";
import { formatJuniorCode } from "@/lib/junior/code-format";

function downloadCodes(rows: { name: string; group: string; code: string }[]) {
  const lines = rows.map(
    (row) =>
      `${row.name}${row.group ? ` | ${row.group}` : ""} | ${formatJuniorCode(row.code)}`,
  );
  const url = URL.createObjectURL(
    new Blob(
      [
        `Cybervalue Academy Kids — ${location.origin}/kids\n\n${lines.join("\n")}\n`,
      ],
      { type: "text/plain;charset=utf-8" },
    ),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "kids-access-codes.txt";
  a.click();
  URL.revokeObjectURL(url);
}

export function CreateKidsForm() {
  const t = useTranslator();
  const [state, action, pending] = useActionState(createKidsAction, undefined);
  const [roster, setRoster] = useState("");
  if (state?.codes)
    return (
      <section className="admin-form student-codes" aria-live="polite">
        <h2>{t("Access codes created")}</h2>
        <p>
          {t(
            "Codes are shown only now. Download the list and give each child their own code. Lost codes can be replaced from the child’s page.",
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
                    <Link href={`/teacher/kids/${row.id}`}>{row.name}</Link>
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
            {t("Add more children")}
          </button>
        </div>
      </section>
    );
  return (
    <form action={action} className="admin-form">
      <h2>{t("Add children")}</h2>
      <div className="admin-field">
        <label htmlFor="kids-roster">
          {t("One child per line: Full name | group (group is optional)")}
        </label>
        <textarea
          id="kids-roster"
          name="roster"
          className="admin-textarea"
          rows={6}
          required
          maxLength={25000}
          value={roster}
          onChange={(event) => setRoster(event.target.value)}
          placeholder={"Lola Karimova | 3-A\nSardor Aliyev | 3-A"}
        />
      </div>
      <RosterFile onLoad={setRoster} />
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
        {pending ? t("Creating…") : t("Create children and codes")}
      </button>
    </form>
  );
}

export function KidEditForm({
  id,
  name,
  group,
  note,
  active,
}: {
  id: string;
  name: string;
  group: string;
  note: string;
  active: boolean;
}) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    updateKidAction.bind(null, id),
    undefined,
  );
  return (
    <form action={action} className="admin-form">
      <h2>{t("Details")}</h2>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="kid-name">{t("Name")}</label>
          <input
            id="kid-name"
            name="name"
            className="admin-input"
            defaultValue={name}
            required
            maxLength={100}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="kid-group">{t("Group")}</label>
          <input
            id="kid-group"
            name="group"
            className="admin-input"
            defaultValue={group}
            maxLength={40}
          />
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor="kid-note">{t("Private note")}</label>
        <textarea
          id="kid-note"
          name="note"
          className="admin-textarea"
          rows={3}
          maxLength={2000}
          defaultValue={note}
        />
      </div>
      <label className="admin-field-checkbox">
        <input type="checkbox" name="active" defaultChecked={active} />
        {t("Access allowed (turning it off signs the child out)")}
      </label>
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
  );
}

export function ResetKidCodeForm({ id, name }: { id: string; name: string }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    () => resetKidCodeAction(id),
    undefined,
  );
  return (
    <form action={action} className="admin-inline-form">
      {state?.code ? (
        <p role="status">
          {t("New access code for {name}:", { name })}{" "}
          <code className="student-code">{formatJuniorCode(state.code)}</code>
        </p>
      ) : (
        <button
          type="submit"
          className="button button-secondary"
          disabled={pending}
        >
          {t("Issue a new access code")}
        </button>
      )}
      {state?.error && (
        <p className="admin-error" role="alert">
          {t(state.error)}
        </p>
      )}
    </form>
  );
}
