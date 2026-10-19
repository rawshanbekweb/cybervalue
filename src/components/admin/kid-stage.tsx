import type { GameSummary } from "@/lib/kids/summary";

type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

/** Where a child stands in one game: locked, a stage in progress, or done. */
export function KidStageCell({ game, t }: { game: GameSummary; t: Translate }) {
  if (!game.open) return <span className="muted">{t("Locked")}</span>;
  if (game.stage === null)
    return <span className="admin-chip ok">{t("Done")}</span>;
  const stage = game.stages[game.stage - 1];
  return (
    <span className="admin-kid-stage">
      <span className={`admin-chip stage-${game.stage}`}>
        {t("Stage {n}", { n: game.stage })}
      </span>
      <span className="admin-cell-detail">
        {stage.done}/{stage.total}
      </span>
    </span>
  );
}
