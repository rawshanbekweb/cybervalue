"use client";
import Link from "next/link";
import { useActionState } from "react";
import { useTranslator } from "@/components/locale-provider";
import { promoteJuniorAction } from "@/app/teacher/(panel)/junior/promote";
import { formatAccessCode } from "@/lib/student/format";

export function PromoteJuniorForm({
  id,
  group,
  xp,
  promoted,
}: {
  id: string;
  group: string;
  xp: number;
  promoted: { id: string; name: string } | null;
}) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    promoteJuniorAction.bind(null, id),
    undefined,
  );
  if (promoted && !state?.code)
    return (
      <p>
        {t("Moved to the Academy:")}{" "}
        <Link href={`/teacher/students/${promoted.id}`}>{promoted.name}</Link>
      </p>
    );
  if (state?.code)
    return (
      <section className="admin-form student-codes" aria-live="polite">
        <p role="status">
          {t(
            "Academy account created. Give the student this access code for /student/login; it is shown only now.",
          )}
        </p>
        <code className="student-code">{formatAccessCode(state.code)}</code>
        <p>
          <Link href={`/teacher/students/${state.studentId}`}>
            {t("Open the student page")}
          </Link>
        </p>
      </section>
    );
  return (
    <form
      action={action}
      className="admin-form"
      aria-labelledby={`promote-${id}`}
    >
      <h2 id={`promote-${id}`}>{t("Move to the Academy")}</h2>
      <p className="muted">
        {t(
          "Creates a student account with the same name. {xp} Junior XP carry over, the parent report link moves with them, and a finished Junior course becomes a certificate.",
          { xp },
        )}
      </p>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor={`promote-group-${id}`}>{t("Academy group")}</label>
          <input
            id={`promote-group-${id}`}
            name="group"
            className="admin-input"
            maxLength={40}
            defaultValue={group}
          />
        </div>
      </div>
      <label className="admin-field-checkbox">
        <input type="checkbox" name="close" defaultChecked />
        {t("Close the Junior account")}
      </label>
      {state?.error && (
        <p className="admin-error" role="alert">
          {t(state.error)}
        </p>
      )}
      <button
        type="submit"
        className="button button-primary"
        disabled={pending}
      >
        {t("Create the Academy account")}
      </button>
    </form>
  );
}
