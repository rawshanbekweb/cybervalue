import { getCtfTranslator } from "@/lib/challenges/view";
import { notFound } from "next/navigation";
import { getAdminLocale } from "@/lib/i18n/server";
import { getPlayerSession } from "@/lib/challenges/session";
import { entrantFor, eventBySlug, scoreboard } from "@/lib/challenges/events";
import { formatWhen, isCtfOrganiser } from "@/lib/challenges/view";
import { phaseOf } from "@/lib/challenges/scoring";
import Link from "next/link";
import { EventHeader } from "@/components/challenges/event-header";
import { ScoreChart } from "@/components/challenges/score-chart";
import { AutoRefresh } from "@/components/challenges/auto-refresh";

export async function generateMetadata({
  params,
}: PageProps<"/challenges/[slug]/scoreboard">) {
  const t = await getCtfTranslator();
  const event = await eventBySlug((await params).slug, await isCtfOrganiser());
  return event ? { title: `${t("Scoreboard")} · ${event.title}` } : {};
}

const TOP = 10;

export default async function ScoreboardPage({
  params,
}: PageProps<"/challenges/[slug]/scoreboard">) {
  const { slug } = await params;
  const organiser = await isCtfOrganiser();
  const event = await eventBySlug(slug, organiser);
  if (!event) notFound();
  const t = await getCtfTranslator();
  const locale = await getAdminLocale();
  const board = await scoreboard(event, organiser);
  const player = (await getPlayerSession())?.player;
  const mine = player ? await entrantFor(event.id, player.id) : null;

  // Cumulative score of the leaders after each of their solves.
  const top = board.rows.slice(0, TOP);
  const series = top.map((row) => {
    let score = 0;
    const points = board.timeline
      .filter((s) => s.entrantId === row.entrantId)
      .map((s) => {
        score += board.values.get(s.challengeId) ?? 0;
        return { at: s.at.getTime(), score };
      });
    return { name: row.name, points };
  });

  return (
    <>
      <EventHeader event={event} current="scoreboard" />
      {phaseOf(event) === "running" && <AutoRefresh seconds={30} />}
      {phaseOf(event) === "ended" && board.rows.length > 0 && (
        <p className="ctf-muted ctf-small">
          {t(
            "The competition is over. Each entrant's certificate is next to its name.",
          )}
        </p>
      )}
      {board.frozenAt && (
        <p className="ctf-banner" role="status">
          {t(
            "The scoreboard is frozen since {time}. The final standings appear when the competition ends.",
            { time: formatWhen(board.frozenAt, locale) },
          )}
        </p>
      )}
      {organiser && event.freezeAt && (
        <p className="ctf-muted ctf-small">
          {t("You see the live standings as an organiser.")}
        </p>
      )}
      {board.rows.some((r) => r.score > 0) && (
        <section className="ctf-section" aria-labelledby="ctf-chart">
          <h2 id="ctf-chart" className="ctf-h2">
            {t("Top {count} over time", { count: Math.min(TOP, top.length) })}
          </h2>
          <ScoreChart
            series={series}
            start={event.startsAt.getTime()}
            end={Math.min(
              board.now.getTime(),
              (board.frozenAt ?? event.endsAt).getTime(),
            )}
          />
        </section>
      )}
      <section className="ctf-section" aria-labelledby="ctf-table">
        <h2 id="ctf-table" className="ctf-h2">
          {t("Standings")}
        </h2>
        {board.rows.length === 0 ? (
          <p className="ctf-muted">{t("Nobody is registered yet.")}</p>
        ) : (
          <div className="ctf-table-wrap">
            <table className="ctf-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">{t("Name")}</th>
                  <th scope="col">{t("Points")}</th>
                  <th scope="col">{t("Solved")}</th>
                  <th scope="col">{t("First bloods")}</th>
                  <th scope="col">{t("Last solve")}</th>
                </tr>
              </thead>
              <tbody>
                {board.rows.map((row) => (
                  <tr
                    key={row.entrantId}
                    className={row.entrantId === mine?.id ? "is-me" : undefined}
                  >
                    <td>{row.rank}</td>
                    <td>
                      <Link
                        href={`/challenges/${event.slug}/entrant/${row.entrantId}`}
                      >
                        {row.name}
                      </Link>{" "}
                      {phaseOf(event) === "ended" && row.score > 0 && (
                        <Link
                          href={`/challenges/${event.slug}/certificate/${row.entrantId}`}
                          className="ctf-small"
                        >
                          {t("certificate")}
                        </Link>
                      )}{" "}
                      <span className="ctf-muted ctf-small">
                        {row.team
                          ? t("team · {count}", { count: row.members })
                          : t("solo")}
                      </span>
                    </td>
                    <td>
                      <b>{row.score}</b>
                    </td>
                    <td>{row.solved}</td>
                    <td>{row.firstBloods || "—"}</td>
                    <td>
                      {row.lastSolveAt
                        ? formatWhen(row.lastSolveAt, locale)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
