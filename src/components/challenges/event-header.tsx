import { getCtfTranslator } from "@/lib/challenges/view";
import Link from "next/link";
import { getAdminLocale } from "@/lib/i18n/server";
import { phaseOf } from "@/lib/challenges/scoring";
import { formatWhen } from "@/lib/challenges/view";

type Event = {
  slug: string;
  title: string;
  summary: string;
  startsAt: Date;
  endsAt: Date;
  published: boolean;
};

export async function EventHeader({
  event,
  current,
}: {
  event: Event;
  current: "overview" | "board" | "scoreboard";
}) {
  const t = await getCtfTranslator();
  const locale = await getAdminLocale();
  const phase = phaseOf(event);
  const label = {
    upcoming: t("Starts soon"),
    running: t("Running now"),
    ended: t("Finished"),
  }[phase];
  const tabs = [
    ["overview", `/challenges/${event.slug}`, t("Overview")],
    ["board", `/challenges/${event.slug}/board`, t("Challenges")],
    ["scoreboard", `/challenges/${event.slug}/scoreboard`, t("Scoreboard")],
  ] as const;
  return (
    <header className="ctf-event-header">
      <p className="ctf-eyebrow">
        <span className={`ctf-phase is-${phase}`}>{label}</span>
        {!event.published && ` · ${t("Not published (preview)")}`}
      </p>
      <h1 className="ctf-title">{event.title}</h1>
      {event.summary && <p className="ctf-lead">{event.summary}</p>}
      <p className="ctf-muted ctf-small">
        {formatWhen(event.startsAt, locale)} —{" "}
        {formatWhen(event.endsAt, locale)} ({t("Tashkent time")})
      </p>
      <nav className="ctf-tabs" aria-label={t("Competition")}>
        {tabs.map(([key, href, name]) => (
          <Link
            key={key}
            href={href}
            aria-current={key === current ? "page" : undefined}
          >
            {name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
