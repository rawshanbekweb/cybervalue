import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { scoreboard } from "@/lib/challenges/events";
import { challengeValue } from "@/lib/challenges/scoring";
import { formatWhen } from "@/lib/challenges/view";
import { ConfirmButton } from "@/components/admin/confirm-button";
import {
  ChallengeFields,
  EventFields,
  Outcome,
} from "@/components/admin/ctf-forms";
import {
  addAwardAction,
  deleteAwardAction,
  cloneEventAction,
  announceAction,
  createChallengeAction,
  deleteAnnouncementAction,
  deleteEventAction,
  setEntrantBannedAction,
  updateEventAction,
} from "../../actions";

export async function generateMetadata() {
  const t = await getAdminTranslator();
  return { title: t("CTF competition") };
}

export default async function CtfEventPage({
  params,
  searchParams,
}: PageProps<"/admin/ctf/events/[id]">) {
  const { id } = await params;
  await requireOwner(`/admin/ctf/events/${id}`);
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const db = getDb();
  const event = await db?.ctfEvent.findUnique({ where: { id } });
  if (!db || !event) notFound();
  const [
    challenges,
    entrants,
    announcements,
    board,
    suspicious,
    feed,
    awards,
    attempts,
  ] = await Promise.all([
    db.ctfChallenge.findMany({
      where: { eventId: id },
      orderBy: [{ category: "asc" }, { position: "asc" }],
      select: {
        id: true,
        title: true,
        category: true,
        visible: true,
        releaseAt: true,
        requires: { select: { title: true } },
        initialPoints: true,
        minimumPoints: true,
        decay: true,
        _count: { select: { solves: true, files: true, hints: true } },
      },
    }),
    db.ctfEntrant.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        banned: true,
        teamId: true,
        createdAt: true,
        _count: { select: { solves: true, submissions: true } },
      },
    }),
    db.ctfAnnouncement.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "desc" },
    }),
    scoreboard(event, true),
    // The same wrong answer typed by different entrants hints at shared
    // (or planted) answers; the same correct answer within seconds too.
    db.$queryRaw<
      {
        challengeId: string;
        title: string;
        entrants: bigint;
        tries: bigint;
      }[]
    >`
        SELECT s."challengeId", c."title",
               COUNT(DISTINCT s."entrantId") AS "entrants",
               COUNT(*) AS "tries"
        FROM "CtfSubmission" s
        JOIN "CtfChallenge" c ON c."id" = s."challengeId"
        WHERE c."eventId" = ${id} AND s."correct" = false
        GROUP BY s."challengeId", c."title", s."valueHash"
        HAVING COUNT(DISTINCT s."entrantId") >= 3
        ORDER BY "entrants" DESC
        LIMIT 10`,
    // The latest attempts, newest first, for watching the competition live.
    db.ctfSubmission.findMany({
      where: { challenge: { eventId: id } },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        correct: true,
        createdAt: true,
        entrant: { select: { name: true } },
        player: { select: { username: true } },
        challenge: { select: { title: true } },
      },
    }),
    db.ctfAward.findMany({
      where: { entrant: { eventId: id } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        points: true,
        reason: true,
        createdAt: true,
        entrant: { select: { name: true } },
      },
    }),
    db.ctfSubmission.groupBy({
      by: ["challengeId", "correct"],
      where: { challenge: { eventId: id } },
      _count: { _all: true },
    }),
  ]);
  const tries = new Map<string, { right: number; wrong: number }>();
  for (const a of attempts) {
    const row = tries.get(a.challengeId) ?? { right: 0, wrong: 0 };
    if (a.correct) row.right += a._count._all;
    else row.wrong += a._count._all;
    tries.set(a.challengeId, row);
  }
  const scoreOf = new Map(board.rows.map((r) => [r.entrantId, r]));
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{event.title}</h1>
          <p className="muted">
            {formatWhen(event.startsAt, locale)} —{" "}
            {formatWhen(event.endsAt, locale)} ·{" "}
            {event.published ? t("Published") : t("Draft")}
          </p>
        </div>
        <div className="admin-row-actions">
          <Link
            href={`/challenges/${event.slug}`}
            className="button button-secondary"
          >
            {t("Open the page")}
          </Link>
          <Link
            href={`/challenges/${event.slug}/scoreboard`}
            className="button button-secondary"
          >
            {t("Scoreboard")}
          </Link>
          <Link href="/admin/ctf/events" className="button button-secondary">
            {t("All competitions")}
          </Link>
          <a
            href={`/admin/ctf/results?event=${event.id}`}
            className="button button-secondary"
            download
          >
            {t("Results (CSV)")}
          </a>
          <a
            href={`/admin/ctf/export?event=${event.id}`}
            className="button button-secondary"
            download
          >
            {t("Export (JSON)")}
          </a>
          <form action={cloneEventAction.bind(null, event.id)}>
            <button type="submit" className="button button-secondary">
              {t("Copy as a draft")}
            </button>
          </form>
        </div>
      </div>
      <Outcome query={await searchParams} />

      <section className="admin-panel">
        <h2>{t("Challenges")}</h2>
        {challenges.length === 0 ? (
          <p className="muted">{t("No challenges yet.")}</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table" tabIndex={0}>
              <thead>
                <tr>
                  <th scope="col">{t("Title")}</th>
                  <th scope="col">{t("Category")}</th>
                  <th scope="col">{t("Value now")}</th>
                  <th scope="col">{t("Solves")}</th>
                  <th scope="col">{t("Wrong answers")}</th>
                  <th scope="col">{t("Files / hints")}</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/admin/ctf/challenges/${c.id}`}>
                        {c.title}
                      </Link>
                      {!c.visible && (
                        <div className="admin-cell-detail">{t("Hidden")}</div>
                      )}
                      {c.releaseAt && (
                        <div className="admin-cell-detail">
                          {t("opens {time}", {
                            time: formatWhen(c.releaseAt, locale),
                          })}
                        </div>
                      )}
                      {c.requires && (
                        <div className="admin-cell-detail">
                          {t("after {title}", { title: c.requires.title })}
                        </div>
                      )}
                    </td>
                    <td>{c.category}</td>
                    <td>{challengeValue(c, c._count.solves)}</td>
                    <td>{c._count.solves}</td>
                    <td>{tries.get(c.id)?.wrong ?? 0}</td>
                    <td>
                      {c._count.files} / {c._count.hints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <details>
          <summary>{t("New challenge")}</summary>
          <form
            action={createChallengeAction.bind(null, event.id)}
            className="admin-form"
          >
            <ChallengeFields others={challenges} />
            <button type="submit" className="button">
              {t("Create")}
            </button>
          </form>
        </details>
      </section>

      <section className="admin-panel">
        <h2>{t("Entrants")}</h2>
        {entrants.length === 0 ? (
          <p className="muted">{t("Nobody is registered yet.")}</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table" tabIndex={0}>
              <thead>
                <tr>
                  <th scope="col">{t("Name")}</th>
                  <th scope="col">{t("Rank")}</th>
                  <th scope="col">{t("Points")}</th>
                  <th scope="col">{t("Attempts")}</th>
                  <th scope="col">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {entrants.map((e) => {
                  const row = scoreOf.get(e.id);
                  return (
                    <tr key={e.id}>
                      <td>
                        {e.name}
                        <div className="admin-cell-detail">
                          {e.teamId ? t("Team") : t("Solo")}
                          {e.banned && ` · ${t("Blocked")}`}
                        </div>
                      </td>
                      <td>{row?.rank ?? "—"}</td>
                      <td>{row?.score ?? 0}</td>
                      <td>
                        {e._count.solves} / {e._count.submissions}
                      </td>
                      <td>
                        <form
                          action={setEntrantBannedAction.bind(
                            null,
                            event.id,
                            e.id,
                            !e.banned,
                          )}
                        >
                          <button
                            type="submit"
                            className="button button-secondary"
                          >
                            {e.banned ? t("Unblock") : t("Block")}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {suspicious.length > 0 && (
          <div className="admin-warn">
            <h3>{t("The same wrong answer from several entrants")}</h3>
            <ul>
              {suspicious.map((s, i) => (
                <li key={i}>
                  {t("{title}: one wrong answer from {count} entrants", {
                    title: s.title,
                    count: Number(s.entrants),
                  })}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <h2>{t("Latest attempts")}</h2>
        {feed.length === 0 ? (
          <p className="muted">{t("No attempts yet.")}</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table" tabIndex={0}>
              <thead>
                <tr>
                  <th scope="col">{t("Time")}</th>
                  <th scope="col">{t("Entrant")}</th>
                  <th scope="col">{t("Challenge")}</th>
                  <th scope="col">{t("Result")}</th>
                </tr>
              </thead>
              <tbody>
                {feed.map((f) => (
                  <tr key={f.id}>
                    <td>{formatWhen(f.createdAt, locale)}</td>
                    <td>
                      {f.entrant.name}
                      {f.player && (
                        <div className="admin-cell-detail">
                          {f.player.username}
                        </div>
                      )}
                    </td>
                    <td>{f.challenge.title}</td>
                    <td>{f.correct ? t("Correct") : t("Wrong")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <h2>{t("Score adjustments")}</h2>
        <p className="admin-help">
          {t(
            "A bonus or a penalty for an entrant. The reason is shown on the entrant's page.",
          )}
        </p>
        {entrants.length > 0 && (
          <form
            action={addAwardAction.bind(null, event.id)}
            className="admin-form"
          >
            <div className="admin-field-row">
              <div className="admin-field">
                <label htmlFor="award-entrant">{t("Entrant")}</label>
                <select
                  id="award-entrant"
                  name="entrantId"
                  className="admin-input"
                  required
                >
                  {entrants.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="award-points">
                  {t("Points (negative for a penalty)")}
                </label>
                <input
                  id="award-points"
                  name="points"
                  type="number"
                  min={-10000}
                  max={10000}
                  required
                  className="admin-input"
                />
              </div>
            </div>
            <div className="admin-field">
              <label htmlFor="award-reason">{t("Reason")}</label>
              <input
                id="award-reason"
                name="reason"
                className="admin-input"
                required
                minLength={3}
                maxLength={200}
              />
            </div>
            <button type="submit" className="button">
              {t("Adjust the score")}
            </button>
          </form>
        )}
        <ul>
          {awards.map((a) => (
            <li key={a.id}>
              <b>{a.points > 0 ? `+${a.points}` : a.points}</b> {a.entrant.name}{" "}
              — {a.reason}{" "}
              <span className="muted">{formatWhen(a.createdAt, locale)}</span>{" "}
              <form
                action={deleteAwardAction.bind(null, event.id, a.id)}
                className="admin-inline-form"
              >
                <button type="submit" className="button button-secondary">
                  {t("Delete")}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-panel">
        <h2>{t("Announcements")}</h2>
        <form
          action={announceAction.bind(null, event.id)}
          className="admin-form"
        >
          <div className="admin-field">
            <label htmlFor="ctf-announce">
              {t("New announcement (Markdown)")}
            </label>
            <textarea
              id="ctf-announce"
              name="body"
              className="admin-textarea"
              rows={3}
              maxLength={2000}
              required
            />
          </div>
          <button type="submit" className="button">
            {t("Post")}
          </button>
        </form>
        <ul>
          {announcements.map((a) => (
            <li key={a.id}>
              <span className="muted">{formatWhen(a.createdAt, locale)}</span>{" "}
              {a.body}{" "}
              <form
                action={deleteAnnouncementAction.bind(null, event.id, a.id)}
                className="admin-inline-form"
              >
                <button type="submit" className="button button-secondary">
                  {t("Delete")}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-panel">
        <h2>{t("Settings")}</h2>
        <form
          action={updateEventAction.bind(null, event.id)}
          className="admin-form"
        >
          <EventFields event={event} />
          <button type="submit" className="button">
            {t("Save")}
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <h2>{t("Delete the competition")}</h2>
        <form action={deleteEventAction.bind(null, event.id)}>
          <ConfirmButton
            type="submit"
            className="button button-danger"
            message={t(
              "Delete {title} with its challenges, files and results?",
              {
                title: event.title,
              },
            )}
          >
            {t("Delete")}
          </ConfirmButton>
        </form>
      </section>
    </div>
  );
}
