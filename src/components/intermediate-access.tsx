import Link from "next/link";
import { ArrowRight, KeyRound, LockKeyhole, Unlock } from "lucide-react";
import type { Translator } from "@/lib/i18n/core";
import type { IntermediateAccess } from "@/lib/intermediate/access";

/** Where a visitor goes to sign in and come back to `path`. */
export const signInFor = (path: string) =>
  `/student/continue?to=${encodeURIComponent(path)}`;

// Says whether the Intermediate labs are open to this visitor and, if not,
// what opens them. The roadmap around it stays public.
export function IntermediateAccessCard({
  access,
  t,
  path,
  start,
}: {
  access: IntermediateAccess;
  t: Translator;
  /** The page to come back to after signing in. */
  path: string;
  /** The first open lab, for the "continue" button. */
  start?: { href: string; label: string };
}) {
  if (access.open)
    return (
      <section className="im-access is-open" aria-labelledby="im-access">
        <span className="im-access-ring" aria-hidden="true">
          <Unlock size={20} />
        </span>
        <div>
          <h2 id="im-access">
            {access.who === "student"
              ? t("Welcome, {name}. Your labs are open.", { name: access.name })
              : t("Staff preview: the labs are open for you.")}
          </h2>
          <p>
            {t(
              "Progress is saved to your account, so you can continue on any device.",
            )}
          </p>
        </div>
        {start && (
          <Link className="button button-primary" href={start.href}>
            {start.label}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        )}
      </section>
    );
  return (
    <section className="im-access" aria-labelledby="im-access">
      <span className="im-access-ring" aria-hidden="true">
        <LockKeyhole size={20} />
      </span>
      <div>
        <h2 id="im-access">
          {access.reason === "level"
            ? t("Your teacher has not opened Intermediate for you yet.")
            : t("The labs open to Intermediate students.")}
        </h2>
        <p>
          {access.reason === "level"
            ? t(
                "Finish the beginner labs and the entrance test in the student portal. Your teacher then places you at the Intermediate level.",
              )
            : t(
                "Anyone can read the roadmap. To work in the labs, sign in with the access code from your teacher; they open Intermediate once you are ready.",
              )}
        </p>
      </div>
      {access.reason === "level" ? (
        <Link className="button button-secondary" href="/student">
          {t("Student portal")}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ) : (
        <Link className="button button-primary" href={signInFor(path)}>
          <KeyRound size={16} aria-hidden="true" />
          {t("Sign in with a code")}
        </Link>
      )}
    </section>
  );
}
