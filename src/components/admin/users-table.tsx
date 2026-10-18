"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useTranslator } from "@/components/locale-provider";
import {
  bulkUsersAction,
  type BulkState,
} from "@/app/admin/(cms)/users/actions";

export type UserRow = {
  key: string;
  kind: "student" | "junior" | "kids";
  href: string;
  name: string;
  group: string;
  status: "active" | "blocked" | "expired";
  detail: string;
  lastActive: string | null;
};

// Students, Academy Junior and Academy Kids members in one list, with bulk
// actions on the selected rows.
export function UsersTable({
  rows,
  empty,
}: {
  rows: UserRow[];
  empty: string;
}) {
  const t = useTranslator();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState("group");
  const [confirm, setConfirm] = useState("");
  const [state, formAction, pending] = useActionState<BulkState, FormData>(
    bulkUsersAction,
    undefined,
  );
  const all = rows.length > 0 && selected.size === rows.length;
  const toggle = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const question =
          action === "block"
            ? t("Block the selected users? They are signed out at once.")
            : action === "delete"
              ? t(
                  "Delete {count} users for good? Their answers, progress and certificates are removed and cannot be restored.",
                  { count: selected.size },
                )
              : null;
        if (question && !window.confirm(question)) event.preventDefault();
      }}
    >
      <div className="admin-bulk" role="group" aria-label={t("Bulk actions")}>
        <span className="muted">
          {t("{count} selected", { count: selected.size })}
        </span>
        <label className="visually-hidden" htmlFor="bulk-action">
          {t("Action")}
        </label>
        <select
          id="bulk-action"
          name="action"
          className="admin-input"
          value={action}
          onChange={(event) => setAction(event.target.value)}
        >
          <option value="group">{t("Move to group")}</option>
          <option value="activate">{t("Allow access")}</option>
          <option value="block">{t("Block access")}</option>
          <option value="signout">{t("Sign out everywhere")}</option>
          <option value="delete">{t("Delete permanently")}</option>
        </select>
        {action === "delete" && (
          <>
            <label className="visually-hidden" htmlFor="bulk-confirm">
              {t("Type DELETE to confirm")}
            </label>
            <input
              id="bulk-confirm"
              name="confirm"
              className="admin-input"
              placeholder={t("Type DELETE to confirm")}
              autoComplete="off"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              maxLength={10}
            />
          </>
        )}
        {action === "group" && (
          <>
            <label className="visually-hidden" htmlFor="bulk-group">
              {t("Group")}
            </label>
            <input
              id="bulk-group"
              name="group"
              className="admin-input"
              placeholder={t("Group, e.g. 7-A")}
              maxLength={40}
            />
          </>
        )}
        <button
          type="submit"
          className={`button ${action === "delete" ? "button-danger" : "button-secondary"}`}
          disabled={
            pending ||
            selected.size === 0 ||
            (action === "delete" && confirm !== "DELETE")
          }
        >
          {action === "delete" ? t("Delete") : t("Apply")}
        </button>
        {state?.error && (
          <span className="admin-error" role="alert">
            {t(state.error)}
          </span>
        )}
        {state?.success && (
          <span role="status">{t(state.success, state.values)}</span>
        )}
      </div>
      {[...selected].map((key) => (
        <input key={key} type="hidden" name="id" value={key} />
      ))}
      {rows.length === 0 ? (
        <p className="muted">{empty}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    aria-label={t("Select all")}
                    checked={all}
                    onChange={() =>
                      setSelected(
                        all ? new Set() : new Set(rows.map((r) => r.key)),
                      )
                    }
                  />
                </th>
                <th scope="col">{t("Name")}</th>
                <th scope="col">{t("Type")}</th>
                <th scope="col">{t("Group")}</th>
                <th scope="col">{t("Progress")}</th>
                <th scope="col">{t("Last activity")}</th>
                <th scope="col">{t("Status")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={t("Select {name}", { name: row.name })}
                      checked={selected.has(row.key)}
                      onChange={() => toggle(row.key)}
                    />
                  </td>
                  <td>
                    <Link href={row.href}>{row.name}</Link>
                  </td>
                  <td>
                    <span className={`admin-chip admin-kind-${row.kind}`}>
                      {row.kind === "junior"
                        ? "Junior"
                        : row.kind === "kids"
                          ? "Kids"
                          : t("Student")}
                    </span>
                  </td>
                  <td>{row.group || "—"}</td>
                  <td>{row.detail}</td>
                  <td>{row.lastActive ?? t("Never")}</td>
                  <td>
                    {row.status === "active" ? (
                      t("Active")
                    ) : (
                      <span className="admin-warn">
                        {t(row.status === "blocked" ? "Blocked" : "Expired")}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </form>
  );
}
