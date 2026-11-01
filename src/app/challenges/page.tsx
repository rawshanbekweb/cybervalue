import { getCtfTranslator } from "@/lib/challenges/view";
import Link from "next/link";

import { getPlayerSession } from "@/lib/challenges/session";
import { ResendVerification } from "@/components/challenges/forms";
import { publishedEvents } from "@/lib/challenges/events";
import { phaseOf } from "@/lib/challenges/scoring";
import { formatWhen } from "@/lib/challenges/view";
import { getAdminLocale } from "@/lib/i18n/server";

export default async function ChallengesHome({
  searchParams,
}: PageProps<"/challenges">) {
  const t = await getCtfTranslator();
  const session = await getPlayerSession();
  const { welcome, deleted } = await searchParams;
  const player = session?.player;
  const locale = await getAdminLocale();
  const events = await publishedEvents();
  const groups = [
    ["running", t("Running now")],
    ["upcoming", t("Coming up")],
    ["ended", t("Finished")],
  ] as const;
  return (
    <>
      {deleted && (
        <p className="ctf-banner is-ok" role="status">
          {t("Your account was deleted.")}
        </p>
      )}
      {player && !player.emailVerifiedAt && (
        <div className="ctf-banner" role="status">
          <span>
            {welcome
              ? t("Welcome! We sent a confirmation link to {email}.", {
                  email: player.email,
                })
              : t("Confirm your email ({email}) to join competitions.", {
                  email: player.email,
                })}
          </span>
          <ResendVerification />
        </div>
      )}
      <section className="ctf-hero">
        <div>
          <p className="ctf-eyebrow">{t("Capture the flag")}</p>
          <h1 className="ctf-title">{t("CTF Challenges")}</h1>
          <p className="ctf-lead">
            {t(
              "Cybersecurity competitions in Uzbek. Solve tasks in cryptography, web, forensics, OSINT and steganography, find the hidden flags and climb the scoreboard alone or with your team.",
            )}
          </p>
          <div className="ctf-actions">
            {player ? (
              <Link href="/challenges/account" className="ctf-button">
                {t("My account")}
              </Link>
            ) : (
              <>
                <Link href="/challenges/register" className="ctf-button">
                  {t("Create an account")}
                </Link>
                <Link href="/challenges/login" className="ctf-button is-ghost">
                  {t("Sign in")}
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="ctf-terminal" aria-hidden="true">
          <p>$ nc ctf.cybervalue 1337</p>
          <p>{t("> Welcome, player.")}</p>
          <p>{t("> Find the flag and submit it:")}</p>
          <p>
            <b>
              CV{"{"}...{"}"}
            </b>
          </p>
        </div>
      </section>
      {groups.map(([phase, heading]) => {
        const list = events.filter((e) => phaseOf(e) === phase);
        if (!list.length) return null;
        return (
          <section
            key={phase}
            className="ctf-section"
            aria-labelledby={`ctf-${phase}`}
          >
            <h2 id={`ctf-${phase}`} className="ctf-h2">
              {heading}
            </h2>
            <div className="ctf-grid">
              {list.map((e) => (
                <Link
                  key={e.id}
                  href={`/challenges/${e.slug}`}
                  className="ctf-panel ctf-event-card"
                >
                  <span className={`ctf-phase is-${phase}`}>{heading}</span>
                  <h3>{e.title}</h3>
                  {e.summary && <p className="ctf-muted">{e.summary}</p>}
                  <p className="ctf-muted ctf-small">
                    {formatWhen(e.startsAt, locale)} ·{" "}
                    {t("{count} registered", { count: e._count.entrants })}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      {events.length === 0 && (
        <p className="ctf-panel ctf-section ctf-muted">
          {t(
            "No competitions yet. Create an account and build your team: the first one is coming.",
          )}
        </p>
      )}
      <section className="ctf-section" aria-labelledby="ctf-how">
        <h2 id="ctf-how" className="ctf-h2">
          {t("How it works")}
        </h2>
        <div className="ctf-grid">
          <div className="ctf-panel">
            <h3>{t("1. Sign up")}</h3>
            <p className="ctf-muted">
              {t("Create an account with your email and confirm it.")}
            </p>
          </div>
          <div className="ctf-panel">
            <h3>{t("2. Build a team")}</h3>
            <p className="ctf-muted">
              {t(
                "Play alone, create a team or join friends with an invite code.",
              )}
            </p>
          </div>
          <div className="ctf-panel">
            <h3>{t("3. Capture flags")}</h3>
            <p className="ctf-muted">
              {t(
                "Each solved task gives points. The fewer teams solve it, the more it is worth.",
              )}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
