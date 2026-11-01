import { getCtfTranslator } from "@/lib/challenges/view";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminLocale } from "@/lib/i18n/server";
import { getPlayerSession } from "@/lib/challenges/session";
import { entrantFor, eventBySlug } from "@/lib/challenges/events";
import { phaseOf, registrationOpen } from "@/lib/challenges/scoring";
import { formatWhen, isCtfOrganiser } from "@/lib/challenges/view";
import { teamOf } from "@/lib/challenges/teams";
import { getDb } from "@/lib/db";
import { Markdown } from "@/components/markdown";
import { EventHeader } from "@/components/challenges/event-header";
import {
  RegisterButtons,
  WithdrawButton,
} from "@/components/challenges/event-forms";

export async function generateMetadata({
  params,
}: PageProps<"/challenges/[slug]">) {
  const event = await eventBySlug((await params).slug, await isCtfOrganiser());
  return event ? { title: event.title, description: event.summary } : {};
}

export default async function EventPage({
  params,
}: PageProps<"/challenges/[slug]">) {
  const { slug } = await params;
  const event = await eventBySlug(slug, await isCtfOrganiser());
  if (!event) notFound();
  const t = await getCtfTranslator();
  const locale = await getAdminLocale();
  const session = await getPlayerSession();
  const player = session?.player;
  const phase = phaseOf(event);
  const open = registrationOpen(event);
  const entrant = player ? await entrantFor(event.id, player.id) : null;
  const team = player ? await teamOf(player.id) : null;
  const captain = team?.captainId === player?.id;
  const [announcements, entrants] = await Promise.all([
    getDb()!.ctfAnnouncement.findMany({
      where: { eventId: event.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    getDb()!.ctfEntrant.count({ where: { eventId: event.id, banned: false } }),
  ]);

  return (
    <>
      <EventHeader event={event} current="overview" />
      <div
        className={
          announcements.length || event.description
            ? "ctf-event-grid"
            : "ctf-event-grid is-single"
        }
      >
        <div>
          {announcements.length > 0 && (
            <section className="ctf-section" aria-labelledby="ctf-news">
              <h2 id="ctf-news" className="ctf-h2">
                {t("Announcements")}
              </h2>
              <ul className="ctf-news">
                {announcements.map((a) => (
                  <li key={a.id}>
                    <time className="ctf-muted ctf-small">
                      {formatWhen(a.createdAt, locale)}
                    </time>
                    <Markdown>{a.body}</Markdown>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {event.description && (
            <section className="ctf-section ctf-prose">
              <Markdown>{event.description}</Markdown>
            </section>
          )}
        </div>
        <aside className="ctf-panel ctf-entry" aria-labelledby="ctf-entry">
          <h2 id="ctf-entry" className="ctf-h2">
            {t("Taking part")}
          </h2>
          <dl className="ctf-dl">
            <dt>{t("Team size")}</dt>
            <dd>
              {t("up to {max}", { max: event.maxTeamSize })}
              {event.allowSolo ? ` · ${t("solo allowed")}` : ""}
            </dd>
            <dt>{t("Registered")}</dt>
            <dd>{entrants}</dd>
            {event.registrationEndsAt && (
              <>
                <dt>{t("Registration until")}</dt>
                <dd>{formatWhen(event.registrationEndsAt, locale)}</dd>
              </>
            )}
          </dl>
          {!player ? (
            <p>
              <Link
                href={`/challenges/login?next=/challenges/${event.slug}`}
                className="ctf-button"
              >
                {t("Sign in to register")}
              </Link>
            </p>
          ) : entrant ? (
            <>
              <p className="ctf-success">
                {entrant.teamId
                  ? t("Your team {name} is registered.", { name: entrant.name })
                  : t("You are registered on your own.")}
              </p>
              {entrant.banned && (
                <p className="ctf-error">
                  {t("Your entry was blocked by the organisers.")}
                </p>
              )}
              {phase !== "upcoming" && (
                <Link
                  href={`/challenges/${event.slug}/board`}
                  className="ctf-button"
                >
                  {t("Open the challenges")}
                </Link>
              )}
              {phase === "upcoming" && (!entrant.teamId || captain) && (
                <WithdrawButton slug={event.slug} />
              )}
            </>
          ) : !open ? (
            <p className="ctf-muted">
              {t("Registration for this competition is closed.")}
            </p>
          ) : !player.emailVerifiedAt ? (
            <p className="ctf-muted">
              {t("Confirm your email to register.")}{" "}
              <Link href="/challenges/account">{t("My account")}</Link>
            </p>
          ) : (
            <>
              {team && !captain && (
                <p className="ctf-muted ctf-small">
                  {t("Only the captain can register the team.")}
                </p>
              )}
              {!team && (
                <p className="ctf-muted ctf-small">
                  <Link href="/challenges/team">
                    {t("Create or join a team")}
                  </Link>{" "}
                  {event.allowSolo ? t("or play on your own.") : ""}
                </p>
              )}
              <RegisterButtons
                slug={event.slug}
                team={Boolean(team && captain)}
                solo={event.allowSolo}
              />
            </>
          )}
        </aside>
      </div>
    </>
  );
}
