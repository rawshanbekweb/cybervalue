import type { JuniorStages } from "@/lib/junior/summary";

type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

/** The mission stage a member is on, or done when every mission is. */
export function JuniorMissionCell({
  stages,
  t,
}: {
  stages: JuniorStages;
  t: Translate;
}) {
  if (stages.missionStage === null)
    return <span className="admin-chip ok">{t("Done")}</span>;
  const stage = stages.missionStages[stages.missionStage - 1];
  return (
    <span className="admin-kid-stage">
      <span className={`admin-chip stage-${stage.stage}`}>
        {t("Stage {n}", { n: stage.stage })}
      </span>
      <span className="admin-cell-detail">
        {stage.done}/{stage.total}
      </span>
    </span>
  );
}

/** The cipher level a member is on, or done when every level is passed. */
export function JuniorLevelCell({
  stages,
  t,
}: {
  stages: JuniorStages;
  t: Translate;
}) {
  if (stages.cipherLevel === null)
    return <span className="admin-chip ok">{t("Done")}</span>;
  const level = stages.levels[stages.cipherLevel - 1];
  return (
    <span className="admin-kid-stage">
      <span className={`admin-chip stage-${level.level}`}>
        {t("Level {n}", { n: level.level })}
      </span>
      <span className="admin-cell-detail">
        {level.solved}/{level.total}
      </span>
    </span>
  );
}
