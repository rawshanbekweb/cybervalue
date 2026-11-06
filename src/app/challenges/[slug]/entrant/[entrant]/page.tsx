import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminLocale } from "@/lib/i18n/server";
import { entrantRecord, eventBySlug } from "@/lib/challenges/events";
import {
  formatWhen,
  getCtfTranslator,
  isCtfOrganiser,
} from "@/lib/challenges/view";
import { EventHeader } from "@/components/challenges/event-header";
import {
  StrengthBars,
  StrengthRadar,
  categoryColor,
} from "@/components/challenges/strengths";
import { strongest } from "@/lib/challenges/strengths";

export async function generateMetadata() {
  const t = await getCtfTranslator();
  return { title: t("Entrant") };
}

export default async function EntrantPage({
  params,
}: PageProps<"/challenges/[slug]/entrant/[entrant]">) {
  const { slug, entrant: entrantId } = await params;
  const organiser = await isCtfOrganiser();
  const event = await eventBySlug(slug, organiser);
  if (!event) notFound();
  const record = await entrantRecord(event, entrantId, organiser);
  if (!record) notFound();
  const t = await getCtfTranslator();
  const locale = await getAdminLocale();
  const { entrant, row } = record;
  const stats = row?.byCategory ?? [];
  const best = strongest(stats);
  return (
    <>
      <EventHeader event={event} current="scoreboard" />
      <section className="ctf-section">
        <p className="ctf-eyebrow">{entrant.teamId ? t("Team") : t("solo")}</p>
        <h2 className="ctf-title">{entrant.name}</h2>
        {entrant.team && (
          <p className="ctf-muted">
            {entrant.team.members.map((m) => m.username).join(" · ")}
          </p>
        )}
        {row && (
          <p className="ctf-lead">
            {t("Place {rank} of {total}", {
              rank: row.rank,
              total: record.total,
            })}{" "}
            · {t("{score} points", { score: row.score })}
          </p>
        )}
        {record.frozenAt && (
          <p className="ctf-muted ctf-small">
            {t("Shown as at the freeze, {time}.", {
              time: formatWhen(record.frozenAt, locale),
            })}
          </p>
        )}
      </section>
      {stats.length > 0 && (
        <section className="ctf-section" aria-labelledby="ctf-strengths">
          <h2 id="ctf-strengths" className="ctf-h2">
            {t("Strengths by category")}
          </h2>
          {best ? (
            <p className="ctf-best">
              {t("Strongest category:")}{" "}
              <b style={{ color: categoryColor(best.category) }}>
                {best.category}
              </b>{" "}
              <span className="ctf-muted">
                {t("{share}% of its points", {
                  share: Math.round(best.share * 100),
                })}
              </span>
            </p>
          ) : (
            <p className="ctf-muted">
              {t("The chart fills in as challenges are solved.")}
            </p>
          )}
          <div className="ctf-strengths">
            <StrengthRadar
              stats={stats}
              label={stats
                .map((s) => `${s.category} ${Math.round(s.share * 100)}%`)
                .join(", ")}
            />
            <StrengthBars stats={stats} t={t} />
          </div>
        </section>
      )}
      <section className="ctf-section" aria-labelledby="ctf-solves">
        <h2 id="ctf-solves" className="ctf-h2">
          {t("Solved challenges")}
        </h2>
        {record.solves.length === 0 ? (
          <p className="ctf-muted">{t("Nothing solved yet.")}</p>
        ) : (
          <div className="ctf-table-wrap">
            <table className="ctf-table">
              <thead>
                <tr>
                  <th scope="col">{t("Challenge")}</th>
                  <th scope="col">{t("Category")}</th>
                  <th scope="col">{t("Points")}</th>
                  <th scope="col">{t("Solved by")}</th>
                  <th scope="col">{t("Time")}</th>
                </tr>
              </thead>
              <tbody>
                {record.solves.map((s) => (
                  <tr key={s.challengeId}>
                    <td>{s.challenge.title}</td>
                    <td>{s.challenge.category}</td>
                    <td>{s.value}</td>
                    <td>{s.player?.username ?? "—"}</td>
                    <td>{formatWhen(s.createdAt, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {(record.hintCost > 0 || record.awards.length > 0) && (
        <section className="ctf-section" aria-labelledby="ctf-changes">
          <h2 id="ctf-changes" className="ctf-h2">
            {t("Other points")}
          </h2>
          <ul>
            {record.hintCost > 0 && (
              <li>
                −{record.hintCost} · {t("hints opened")}
              </li>
            )}
            {record.awards.map((a, i) => (
              <li key={i}>
                {a.points > 0 ? `+${a.points}` : a.points} · {a.reason}{" "}
                <span className="ctf-muted ctf-small">
                  ({formatWhen(a.createdAt, locale)})
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p>
        <Link
          href={`/challenges/${slug}/scoreboard`}
          className="ctf-button is-ghost"
        >
          {t("Scoreboard")}
        </Link>
      </p>
    </>
  );
}
