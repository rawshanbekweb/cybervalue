"use client";
import Link from "next/link";
import { useActionState } from "react";
import { useTranslator } from "@/components/locale-provider";
import { promoteKidAction } from "@/app/admin/(cms)/kids/promote";
import { formatJuniorCode } from "@/lib/junior/code-format";

export function PromoteKidForm({
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
    promoteKidAction.bind(null, id),
    undefined,
  );
  if (promoted && !state?.code)
    return (
      <p>
        {t("Moved to Academy Junior:")}{" "}
        <Link href={`/admin/junior/${promoted.id}`}>{promoted.name}</Link>
      </p>
    );
  if (state?.code)
    return (
      <section className="admin-form student-codes" aria-live="polite">
        <p role="status">
          {t(
            "Junior account created. Give the child this access code for /junior; it is shown only now.",
          )}
        </p>
        <code className="student-code">{formatJuniorCode(state.code)}</code>
        <p>
          <Link href={`/admin/junior/${state.juniorId}`}>
            {t("Open the Junior page")}
          </Link>
        </p>
      </section>
    );
  return (
    <form action={action} className="admin-form" aria-labelledby={`kp-${id}`}>
      <h2 id={`kp-${id}`}>{t("Move to Academy Junior")}</h2>
      <p className="muted">
        {t(
          "Creates a Junior account with the same name. The parent report link and parent chats move with the child; the {xp} Kids XP are noted on the Junior page.",
          { xp },
        )}
      </p>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor={`kp-group-${id}`}>{t("Junior group")}</label>
          <input
            id={`kp-group-${id}`}
            name="group"
            className="admin-input"
            maxLength={40}
            defaultValue={group}
          />
        </div>
      </div>
      <label className="admin-field-checkbox">
        <input type="checkbox" name="close" defaultChecked />
        {t("Close the Kids account")}
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
        {t("Create the Junior account")}
      </button>
    </form>
  );
}
