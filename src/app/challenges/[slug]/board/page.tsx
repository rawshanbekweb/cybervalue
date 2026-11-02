import { getCtfTranslator } from "@/lib/challenges/view";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPlayerSession } from "@/lib/challenges/session";
import {
  challengeBoard,
  entrantFor,
  eventBySlug,
} from "@/lib/challenges/events";
import { phaseOf } from "@/lib/challenges/scoring";
import { isCtfOrganiser } from "@/lib/challenges/view";
import { Markdown } from "@/components/markdown";
import { EventHeader } from "@/components/challenges/event-header";
import { FlagForm, HintButton } from "@/components/challenges/event-forms";

export async function generateMetadata({
  params,
}: PageProps<"/challenges/[slug]/board">) {
  const t = await getCtfTranslator();
  const event = await eventBySlug((await params).slug, await isCtfOrganiser());
  return event ? { title: `${t("Challenges")} · ${event.title}` } : {};
}

const size = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export default async function BoardPage({
  params,
}: PageProps<"/challenges/[slug]/board">) {
  const { slug } = await params;
  const organiser = await isCtfOrganiser();
  const event = await eventBySlug(slug, organiser);
  if (!event) notFound();
  const t = await getCtfTranslator();
  const phase = phaseOf(event);
  const player = (await getPlayerSession())?.player;
  const entrant = player ? await entrantFor(event.id, player.id) : null;
  // Entrants see the board while the competition runs; after the end every
  // signed-in player may read it; organisers always.
  const allowed =
    organiser ||
    (phase === "running" && entrant && !entrant.banned) ||
    (phase === "ended" && player);
  if (!allowed)
    return (
      <>
        <EventHeader event={event} current="board" />
        <div className="ctf-panel ctf-section">
          <p className="ctf-muted">
            {phase === "upcoming"
              ? t("The challenges open when the competition starts.")
              : !player
                ? t("Sign in to see the challenges.")
                : t("Register for the competition first.")}
          </p>
          <Link
            href={`/challenges/${event.slug}`}
            className="ctf-button is-ghost"
          >
            {t("Overview")}
          </Link>
        </div>
      </>
    );
  // After the end every hint is open, for practice.
  const board = await challengeBoard(
    event.id,
    entrant?.id ?? null,
    phase === "ended" || organiser,
    phase === "ended" || organiser,
  );
  const categories = [...new Set(board.map((c) => c.category))];
  const playing = phase === "running" && entrant && !entrant.banned;
  const solved = board.filter((c) => c.solved).length;
  return (
    <>
      <EventHeader event={event} current="board" />
      {entrant && (
        <p className="ctf-muted">
          {t("{name}: {solved} of {total} solved", {
            name: entrant.name,
            solved,
            total: board.length,
          })}
        </p>
      )}
      {board.length === 0 && (
        <p className="ctf-muted">{t("No challenges yet.")}</p>
      )}
      {categories.map((category) => (
        <section
          key={category}
          className="ctf-section"
          aria-labelledby={`cat-${category}`}
        >
          <h2 id={`cat-${category}`} className="ctf-h2">
            {category}
          </h2>
          <div className="ctf-board">
            {board
              .filter((c) => c.category === category)
              .map((c) => (
                <details
                  key={c.id}
                  className={`ctf-card${c.solved ? " is-solved" : ""}`}
                  id={`c-${c.id}`}
                >
                  <summary>
                    <span className="ctf-card-title">
                      {c.lockedBy !== null && (
                        <span aria-hidden="true">🔒 </span>
                      )}
                      {c.title}
                    </span>
                    <span className="ctf-card-meta">
                      <b>{c.value}</b> {t("pts")} ·{" "}
                      {t("{count} solves", { count: c.solves })}
                      {c.solved && ` · ${t("Solved")}`}
                    </span>
                  </summary>
                  <div className="ctf-card-body">
                    {c.lockedBy !== null && (
                      <p className="ctf-muted">
                        {t("Opens after you solve “{title}”.", {
                          title: c.lockedBy,
                        })}
                      </p>
                    )}
                    <Markdown>{c.description}</Markdown>
                    {c.files.length > 0 && (
                      <ul className="ctf-files">
                        {c.files.map((f) => (
                          <li key={f.id}>
                            <a href={`/challenges/files/${f.id}`} download>
                              {f.name}
                            </a>{" "}
                            <span className="ctf-muted ctf-small">
                              ({size(f.size)})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {c.hints.map((h, i) => (
                      <div key={h.id} className="ctf-hint-box">
                        <p className="ctf-label">
                          {t("Hint {n}", { n: i + 1 })}
                        </p>
                        {h.text !== null ? (
                          <Markdown>{h.text}</Markdown>
                        ) : playing ? (
                          <HintButton
                            slug={event.slug}
                            hintId={h.id}
                            cost={h.cost}
                          />
                        ) : (
                          <p className="ctf-muted ctf-small">{t("Closed")}</p>
                        )}
                      </div>
                    ))}
                    {playing &&
                      !c.solved &&
                      c.lockedBy === null &&
                      c.attemptsLeft !== null && (
                        <p className="ctf-muted ctf-small">
                          {t("Attempts left: {count}", {
                            count: c.attemptsLeft,
                          })}
                        </p>
                      )}
                    {playing &&
                      !c.solved &&
                      c.lockedBy === null &&
                      c.attemptsLeft !== 0 && (
                        <FlagForm slug={event.slug} challengeId={c.id} />
                      )}
                  </div>
                </details>
              ))}
          </div>
        </section>
      ))}
    </>
  );
}
