"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useTranslator } from "@/components/locale-provider";
import {
  createStudentsAction,
  resetStudentCodeAction,
  updateStudentAction,
} from "@/app/admin/(cms)/students/actions";
import {
  reviewSubmissionAction,
  saveMaterialAction,
} from "@/app/admin/(cms)/materials/actions";
import { formatAccessCode } from "@/lib/student/format";
import type { MaterialFormValues as MaterialDefaults } from "@/lib/student/admin";

function downloadCodes(rows: { name: string; group: string; code: string }[]) {
  const lines = rows.map(
    (row) =>
      `${row.name}${row.group ? ` | ${row.group}` : ""} | ${formatAccessCode(row.code)}`,
  );
  const url = URL.createObjectURL(
    new Blob(
      [
        `CyberValue — ${location.origin}/student/login\n\n${lines.join("\n")}\n`,
      ],
      { type: "text/plain;charset=utf-8" },
    ),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "student-access-codes.txt";
  a.click();
  URL.revokeObjectURL(url);
}

export function CreateStudentsForm() {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    createStudentsAction,
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
            "Codes are shown only now. Download the list and give each student their own code. Lost codes can be replaced from the student’s page.",
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
                    <Link href={`/admin/students/${row.id}`}>{row.name}</Link>
                  </td>
                  <td>{row.group || "—"}</td>
                  <td>
                    <code className="student-code">
                      {formatAccessCode(row.code)}
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
            {t("Add more students")}
          </button>
        </div>
      </section>
    );
  return (
    <form action={action} className="admin-form">
      <h2>{t("Add students")}</h2>
      <div className="admin-field">
        <label htmlFor="roster">
          {t("One student per line: Full name | group (group is optional)")}
        </label>
        <textarea
          id="roster"
          name="roster"
          className="admin-textarea"
          rows={6}
          required
          maxLength={25000}
          value={roster}
          onChange={(event) => setRoster(event.target.value)}
          placeholder={"Ali Valiyev | 9-A\nMadina Karimova | 9-A"}
        />
      </div>
      <div className="admin-field">
        <label htmlFor="expiresAt">{t("Access ends after (optional)")}</label>
        <input
          id="expiresAt"
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
        {pending ? t("Creating…") : t("Create students and codes")}
      </button>
    </form>
  );
}

export function StudentEditForm({
  student,
}: {
  student: {
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
    updateStudentAction.bind(null, student.id),
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
            defaultValue={student.name}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="group">{t("Group")}</label>
          <input
            id="group"
            name="group"
            className="admin-input"
            maxLength={40}
            defaultValue={student.group}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="expiresAt">{t("Access ends after")}</label>
          <input
            id="expiresAt"
            name="expiresAt"
            type="date"
            className="admin-input"
            defaultValue={student.expiresAt}
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
          defaultValue={student.note}
        />
      </div>
      <div className="admin-field-checkbox">
        <input
          id="active"
          name="active"
          type="checkbox"
          defaultChecked={student.active}
        />
        <label htmlFor="active">
          {t("Access allowed (turning it off signs the student out)")}
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

export function ResetCodeForm({ id, name }: { id: string; name: string }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    resetStudentCodeAction.bind(null, id),
    undefined,
  );
  if (state?.code)
    return (
      <div className="admin-form" aria-live="polite">
        <p>{t("New access code for {name}:", { name })}</p>
        <p>
          <code className="student-code student-code-large">
            {formatAccessCode(state.code)}
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

const KINDS = [
  ["LESSON", "Lesson"],
  ["LAB", "Lab"],
  ["PRACTICE", "Practice"],
  ["QUIZ", "Test"],
  ["CHALLENGE", "Personal lab"],
] as const;

const ARTIFACT_EXAMPLE = `2026-10-11 09:14:02 sshd: Failed password for admin from 203.0.113.9
2026-10-11 09:14:05 sshd: Failed password for admin from 203.0.113.9
2026-10-11 09:14:09 app: debug token={{decoy}}
2026-10-11 09:15:41 app: export payload={{flag:base64}}
=== variant ===
2026-10-11 10:02:17 nginx: GET /?q={{flag:url}} 200
2026-10-11 10:02:19 app: cache key {{decoy}}`;

export function MaterialForm({
  id,
  defaults,
}: {
  id: string | null;
  defaults: MaterialDefaults;
}) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    saveMaterialAction.bind(null, id),
    undefined,
  );
  // A rejected save returns what was typed, so the reset form refills with it.
  const values = state?.input ?? defaults;
  return (
    <MaterialFields
      key={state?.at ?? "initial"}
      action={action}
      pending={pending}
      values={values}
      error={state?.error && t(state.error, state.values)}
      success={state?.success && t(state.success)}
    />
  );
}

function MaterialFields({
  action,
  pending,
  values: defaults,
  error,
  success,
}: {
  action: (form: FormData) => void;
  pending: boolean;
  values: MaterialDefaults;
  error?: string;
  success?: string;
}) {
  const t = useTranslator();
  const [kind, setKind] = useState(defaults.kind);
  return (
    <form action={action} className="admin-form">
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="title">{t("Title")}</label>
          <input
            id="title"
            name="title"
            className="admin-input"
            required
            maxLength={160}
            defaultValue={defaults.title}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="slug">{t("Slug")}</label>
          <input
            id="slug"
            name="slug"
            className="admin-input"
            required
            maxLength={100}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="sql-injection-lab"
            defaultValue={defaults.slug}
          />
        </div>
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="kind">{t("Kind")}</label>
          <select
            id="kind"
            name="kind"
            className="admin-input"
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as MaterialDefaults["kind"])
            }
          >
            {KINDS.map(([value, label]) => (
              <option key={value} value={value}>
                {t(label)}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="groups">{t("Groups (comma-separated)")}</label>
          <input
            id="groups"
            name="groups"
            className="admin-input"
            maxLength={400}
            placeholder={t("Empty = every student")}
            defaultValue={defaults.groups}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="position">{t("Order")}</label>
          <input
            id="position"
            name="position"
            type="number"
            className="admin-input"
            min={-10000}
            max={10000}
            defaultValue={defaults.position}
          />
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor="summary">{t("Summary")}</label>
        <input
          id="summary"
          name="summary"
          className="admin-input"
          maxLength={400}
          defaultValue={defaults.summary}
        />
      </div>
      <div className="admin-field">
        <label htmlFor="body">{t("Body (Markdown)")}</label>
        <textarea
          id="body"
          name="body"
          className="admin-textarea"
          rows={16}
          maxLength={60000}
          defaultValue={defaults.body}
        />
      </div>
      {kind === "QUIZ" && (
        <>
          <div className="admin-field">
            <label htmlFor="quizText">{t("Questions")}</label>
            <textarea
              id="quizText"
              name="quizText"
              className="admin-textarea student-quiz-source"
              rows={14}
              maxLength={60000}
              required
              aria-describedby="quiz-help"
              defaultValue={defaults.quizText}
              placeholder={
                "? HTTPS odatda qaysi portdan foydalanadi?\n- 80\n+ 443\n- 22\n> 443 — HTTPS uchun standart port."
              }
            />
            <p id="quiz-help" className="muted">
              {t(
                "Start a question with ?, each option with -, and the one correct option with +. Under the options, > lines explain the answer in simple words. Leave a blank line between questions. Answers are checked on the server and never sent to the browser.",
              )}
            </p>
          </div>
        </>
      )}
      {kind === "CHALLENGE" && (
        <>
          <div className="admin-field">
            <label htmlFor="artifactName">{t("File name")}</label>
            <input
              id="artifactName"
              name="artifactName"
              className="admin-input"
              required
              maxLength={80}
              pattern="[A-Za-z0-9][A-Za-z0-9._\-]*"
              placeholder="access.log"
              defaultValue={defaults.artifactName}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="artifact">{t("Artifact template")}</label>
            <textarea
              id="artifact"
              name="artifact"
              className="admin-textarea student-quiz-source"
              rows={16}
              required
              aria-describedby="artifact-help"
              defaultValue={defaults.artifact}
              placeholder={ARTIFACT_EXAMPLE}
            />
            <div id="artifact-help" className="muted">
              <p>
                {t(
                  "Every student downloads their own copy. Place the flag with {{flag}}, or encoded with {{flag:base64}}, {{flag:hex}}, {{flag:rot13}}, {{flag:reverse}} or {{flag:url}}. {{decoy}} adds a fake flag (also encodable, e.g. {{decoy:base64}}), {{name}} the student’s name.",
                )}
              </p>
              <p>
                {t(
                  "Separate alternative versions with a line === variant ===; each student gets one of them. Flags are derived from a secret key and never stored. The file always downloads and never opens on the site.",
                )}
              </p>
            </div>
          </div>
        </>
      )}
      {(kind === "QUIZ" || kind === "CHALLENGE") && (
        <div className="admin-field">
          <label htmlFor="explanation">
            {t("Explanation after answering (Markdown)")}
          </label>
          <textarea
            id="explanation"
            name="explanation"
            className="admin-textarea"
            rows={10}
            maxLength={20000}
            aria-describedby="explanation-help"
            defaultValue={defaults.explanation}
          />
          <p id="explanation-help" className="muted">
            {kind === "QUIZ"
              ? t(
                  "Shown with the correct answers after the student’s last attempt. Explain single questions with > lines under their options.",
                )
              : t(
                  "Shown once the student solves the lab or runs out of attempts: what happened, why it matters and how to fix it. Separate one text per artifact variant with === variant ===.",
                )}
          </p>
        </div>
      )}
      {(kind === "QUIZ" || kind === "CHALLENGE") && (
        <div className="admin-field">
          <label htmlFor="maxAttempts">
            {t("Attempts per student (0 = unlimited)")}
          </label>
          <input
            id="maxAttempts"
            name="maxAttempts"
            type="number"
            className="admin-input"
            min={0}
            max={20}
            defaultValue={defaults.maxAttempts}
          />
        </div>
      )}
      <div className="admin-field-checkbox">
        <input
          id="published"
          name="published"
          type="checkbox"
          defaultChecked={defaults.published}
        />
        <label htmlFor="published">{t("Visible to students")}</label>
      </div>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      {success && <p role="status">{success}</p>}
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

export function ReviewForm({
  id,
  score,
  feedback,
}: {
  id: string;
  score: number | null;
  feedback: string;
}) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    reviewSubmissionAction.bind(null, id),
    undefined,
  );
  return (
    <form action={action} className="admin-form student-review-form">
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor={`score-${id}`}>{t("Score (0–100)")}</label>
          <input
            id={`score-${id}`}
            name="score"
            type="number"
            min={0}
            max={100}
            className="admin-input"
            defaultValue={score ?? ""}
          />
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor={`feedback-${id}`}>
          {t("Feedback for the student")}
        </label>
        <textarea
          id={`feedback-${id}`}
          name="feedback"
          rows={3}
          maxLength={5000}
          className="admin-textarea"
          defaultValue={feedback}
        />
      </div>
      {state?.error && (
        <p className="admin-error" role="alert">
          {t(state.error)}
        </p>
      )}
      {state?.success && <p role="status">{t(state.success)}</p>}
      <button
        type="submit"
        className="button button-secondary"
        disabled={pending}
      >
        {pending ? t("Saving…") : t("Save review")}
      </button>
    </form>
  );
}
