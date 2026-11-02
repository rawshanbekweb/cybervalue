import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { challengeValue } from "@/lib/challenges/scoring";
import { formatWhen } from "@/lib/challenges/view";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ChallengeFields, Outcome } from "@/components/admin/ctf-forms";
import { CtfUpload } from "@/components/admin/ctf-upload";
import {
  addFlagAction,
  deleteFlagAction,
  testFlagAction,
  addHintAction,
  deleteChallengeAction,
  deleteFileAction,
  deleteHintAction,
  updateChallengeAction,
} from "../../actions";

export async function generateMetadata() {
  const t = await getAdminTranslator();
  return { title: t("CTF challenge") };
}

export default async function CtfChallengePage({
  params,
  searchParams,
}: PageProps<"/admin/ctf/challenges/[id]">) {
  const { id } = await params;
  await requireOwner(`/admin/ctf/challenges/${id}`);
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const db = getDb();
  const challenge = await db?.ctfChallenge.findUnique({
    where: { id },
    include: {
      event: { select: { id: true, title: true, slug: true } },
      files: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, size: true },
      },
      hints: { orderBy: { position: "asc" } },
      flags: {
        orderBy: { createdAt: "asc" },
        select: { id: true, caseSensitive: true, createdAt: true },
      },
      solves: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          createdAt: true,
          entrant: { select: { name: true } },
          player: { select: { username: true } },
        },
      },
      _count: { select: { submissions: true } },
    },
  });
  if (!db || !challenge) notFound();
  const others = await db.ctfChallenge.findMany({
    where: { eventId: challenge.event.id },
    orderBy: [{ category: "asc" }, { position: "asc" }],
    select: { id: true, title: true },
  });
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{challenge.title}</h1>
          <p className="muted">
            {challenge.category} ·{" "}
            {t("{value} points now, {solves} solves, {tries} attempts", {
              value: challengeValue(challenge, challenge.solves.length),
              solves: challenge.solves.length,
              tries: challenge._count.submissions,
            })}
          </p>
        </div>
        <Link
          href={`/admin/ctf/events/${challenge.event.id}`}
          className="button button-secondary"
        >
          {challenge.event.title}
        </Link>
      </div>
      <Outcome query={await searchParams} />

      <section className="admin-panel">
        <h2>{t("Challenge")}</h2>
        <form
          action={updateChallengeAction.bind(null, challenge.id)}
          className="admin-form"
        >
          <ChallengeFields challenge={challenge} others={others} />
          <button type="submit" className="button">
            {t("Save")}
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <h2>{t("Flags")}</h2>
        <p className="admin-help">
          {t(
            "Any of these answers solves the challenge. Only salted digests are stored, so a flag cannot be shown again; test an answer below instead.",
          )}
        </p>
        <ol>
          {challenge.flags.map((f) => (
            <li key={f.id}>
              {f.caseSensitive ? t("exact letter case") : t("any letter case")}{" "}
              <span className="muted">· {formatWhen(f.createdAt, locale)}</span>{" "}
              {challenge.flags.length > 1 && (
                <form
                  action={deleteFlagAction.bind(null, challenge.id, f.id)}
                  className="admin-inline-form"
                >
                  <button type="submit" className="button button-secondary">
                    {t("Delete")}
                  </button>
                </form>
              )}
            </li>
          ))}
        </ol>
        <form
          action={addFlagAction.bind(null, challenge.id)}
          className="admin-form"
        >
          <div className="admin-field">
            <label htmlFor="flag-new">{t("Another accepted flag")}</label>
            <input
              id="flag-new"
              name="flag"
              className="admin-input"
              maxLength={200}
              required
              autoComplete="off"
              spellCheck={false}
              placeholder="CV{...}"
            />
          </div>
          <div className="admin-field admin-field-checkbox">
            <label>
              <input type="checkbox" name="caseInsensitive" />{" "}
              {t("Accept the flag in any letter case")}
            </label>
          </div>
          <button type="submit" className="button">
            {t("Add the flag")}
          </button>
        </form>
        <form
          action={testFlagAction.bind(null, challenge.id)}
          className="admin-form"
        >
          <div className="admin-field">
            <label htmlFor="flag-test">{t("Test an answer")}</label>
            <input
              id="flag-test"
              name="attempt"
              className="admin-input"
              maxLength={200}
              required
              autoComplete="off"
              spellCheck={false}
            />
            <p className="admin-help">
              {t("Nothing is recorded; players do not see the test.")}
            </p>
          </div>
          <button type="submit" className="button button-secondary">
            {t("Check")}
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <h2>{t("Files")}</h2>
        <ul>
          {challenge.files.map((f) => (
            <li key={f.id}>
              <a href={`/challenges/files/${f.id}`}>{f.name}</a>{" "}
              <span className="muted">({Math.ceil(f.size / 1024)} KB)</span>{" "}
              <form
                action={deleteFileAction.bind(null, challenge.id, f.id)}
                className="admin-inline-form"
              >
                <button type="submit" className="button button-secondary">
                  {t("Delete")}
                </button>
              </form>
            </li>
          ))}
        </ul>
        <CtfUpload challengeId={challenge.id} />
      </section>

      <section className="admin-panel">
        <h2>{t("Hints")}</h2>
        <ol>
          {challenge.hints.map((h) => (
            <li key={h.id}>
              {h.text}{" "}
              <span className="muted">
                (
                {h.cost > 0
                  ? t("costs {cost} points", { cost: h.cost })
                  : t("free")}
                )
              </span>{" "}
              <form
                action={deleteHintAction.bind(null, challenge.id, h.id)}
                className="admin-inline-form"
              >
                <button type="submit" className="button button-secondary">
                  {t("Delete")}
                </button>
              </form>
            </li>
          ))}
        </ol>
        <form
          action={addHintAction.bind(null, challenge.id)}
          className="admin-form"
        >
          <div className="admin-field">
            <label htmlFor="hint-text">{t("New hint (Markdown)")}</label>
            <textarea
              id="hint-text"
              name="text"
              className="admin-textarea"
              rows={3}
              maxLength={4000}
              required
            />
          </div>
          <div className="admin-field">
            <label htmlFor="hint-cost">{t("Cost in points")}</label>
            <input
              id="hint-cost"
              name="cost"
              type="number"
              min={0}
              max={10000}
              defaultValue={0}
              className="admin-input"
            />
          </div>
          <button type="submit" className="button">
            {t("Add the hint")}
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <h2>{t("Solves")}</h2>
        {challenge.solves.length === 0 ? (
          <p className="muted">{t("Nobody has solved it yet.")}</p>
        ) : (
          <ol>
            {challenge.solves.map((s) => (
              <li key={s.id}>
                {s.entrant.name}
                {s.player && ` (${s.player.username})`} —{" "}
                {formatWhen(s.createdAt, locale)}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="admin-panel">
        <h2>{t("Delete the challenge")}</h2>
        <form action={deleteChallengeAction.bind(null, challenge.id)}>
          <ConfirmButton
            type="submit"
            className="button button-danger"
            message={t("Delete {title} with its files, hints and solves?", {
              title: challenge.title,
            })}
          >
            {t("Delete")}
          </ConfirmButton>
        </form>
      </section>
    </div>
  );
}
