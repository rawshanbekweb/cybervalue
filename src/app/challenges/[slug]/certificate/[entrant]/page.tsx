import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminLocale } from "@/lib/i18n/server";
import { getDb } from "@/lib/db";
import { eventBySlug, scoreboard } from "@/lib/challenges/events";
import { phaseOf } from "@/lib/challenges/scoring";
import { formatWhen, getCtfTranslator } from "@/lib/challenges/view";
import { PrintButton } from "@/components/challenges/print-button";

export async function generateMetadata() {
  const t = await getCtfTranslator();
  return { title: t("Certificate"), robots: { index: false } };
}

// The certificate of one entrant, opened from the final scoreboard. It is
// served by the site itself, so the address proves the result; the standings
// come from the same computation as the scoreboard.
export default async function CertificatePage({
  params,
}: PageProps<"/challenges/[slug]/certificate/[entrant]">) {
  const { slug, entrant: entrantId } = await params;
  const event = await eventBySlug(slug);
  if (!event || phaseOf(event) !== "ended") notFound();
  const board = await scoreboard(event);
  const row = board.rows.find((r) => r.entrantId === entrantId);
  if (!row) notFound();
  const entrant = await getDb()!.ctfEntrant.findUnique({
    where: { id: entrantId },
    select: {
      team: { select: { members: { select: { username: true } } } },
    },
  });
  const t = await getCtfTranslator();
  const locale = await getAdminLocale();
  const podium = row.rank <= 3 && row.score > 0;
  return (
    <>
      <div className="ctf-actions ctf-no-print">
        <Link
          href={`/challenges/${slug}/scoreboard`}
          className="ctf-button is-ghost"
        >
          {t("Scoreboard")}
        </Link>
        <PrintButton />
      </div>
      <article className={`ctf-certificate${podium ? " is-podium" : ""}`}>
        <p className="ctf-eyebrow">Cybervalue · CTF Challenges</p>
        <h1>
          {podium
            ? t("Winner’s certificate")
            : t("Certificate of participation")}
        </h1>
        <p className="ctf-muted">{t("This confirms that")}</p>
        <p className="ctf-certificate-name">{row.name}</p>
        {entrant?.team && (
          <p className="ctf-muted ctf-small">
            {entrant.team.members.map((m) => m.username).join(" · ")}
          </p>
        )}
        <p>
          {t("took part in {event}", { event: event.title })}
          <br />
          <span className="ctf-muted ctf-small">
            {formatWhen(event.startsAt, locale)} —{" "}
            {formatWhen(event.endsAt, locale)}
          </span>
        </p>
        <p className="ctf-certificate-rank">
          {t("Place {rank} of {total}", {
            rank: row.rank,
            total: board.rows.length,
          })}
        </p>
        <p className="ctf-muted">
          {t("{score} points · {solved} challenges solved", {
            score: row.score,
            solved: row.solved,
          })}
        </p>
        <p className="ctf-muted ctf-small">
          {t("Check it at")} {`/challenges/${slug}/certificate/${entrantId}`}
        </p>
      </article>
    </>
  );
}
