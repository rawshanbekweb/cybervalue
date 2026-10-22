import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { LiveCreateForm } from "@/components/live/live-create-form";
import { quizSchema } from "@/lib/student/quiz";
import { deleteLiveGameAction } from "./actions";

const STATE_TEXT: Record<string, string> = {
  lobby: "Waiting for players",
  question: "Running",
  reveal: "Running",
  finished: "Finished",
};

export default async function AdminLivePage() {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  await requireAdmin("/teacher/live");
  const db = getDb();
  const [materials, games] = db
    ? await Promise.all([
        db.studentMaterial.findMany({
          where: { kind: "QUIZ" },
          orderBy: [{ position: "asc" }, { createdAt: "asc" }],
          select: { id: true, title: true, quiz: true },
        }),
        db.liveGame.findMany({
          orderBy: { createdAt: "desc" },
          take: 30,
          select: {
            id: true,
            code: true,
            title: true,
            state: true,
            createdAt: true,
            _count: { select: { players: true } },
          },
        }),
      ])
    : [[], []];
  const tests = materials.flatMap((m) => {
    const quiz = quizSchema.safeParse(m.quiz);
    return quiz.success
      ? [{ id: m.id, title: m.title, count: quiz.data.length }]
      : [];
  });
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Live quiz")}</h1>
          <p className="muted">
            {t(
              "Show a test on the classroom screen. Students join from their phones at /live with the game code; faster right answers score more and the ranking updates after every question.",
            )}
          </p>
        </div>
      </div>
      {!db && (
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      )}
      <LiveCreateForm tests={tests} />
      <h2>{t("Recent games")}</h2>
      {games.length === 0 ? (
        <p className="muted">{t("No games yet.")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t("Test")}</th>
                <th scope="col">{t("Code")}</th>
                <th scope="col">{t("Players")}</th>
                <th scope="col">{t("Status")}</th>
                <th scope="col">{t("Created")}</th>
                <th scope="col">
                  <span className="visually-hidden">{t("Actions")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td>
                    <Link href={`/teacher/live/${game.id}`}>{game.title}</Link>
                  </td>
                  <td>{game.code}</td>
                  <td>{game._count.players}</td>
                  <td>{t(STATE_TEXT[game.state] ?? game.state)}</td>
                  <td>{formatDate(game.createdAt, locale)}</td>
                  <td>
                    <form action={deleteLiveGameAction.bind(null, game.id)}>
                      <ConfirmButton
                        type="submit"
                        className="button button-danger"
                        message={t("Delete this game and its results?")}
                      >
                        {t("Delete")}
                      </ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
