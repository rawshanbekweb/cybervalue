import { notFound } from "next/navigation";
import { GameLab } from "@/components/kids/game-lab";
import { MazeLab } from "@/components/kids/maze-lab";
import { KidsLogin } from "@/components/kids/kids-home";
import { gameOpen, GAMES, isGameId } from "@/lib/kids/games";
import { dailyTask, kidsToday } from "@/lib/kids/extras";
import { GameLocked } from "@/components/kids/kids-home";
import { getKidsMember } from "@/lib/kids/session";
import { restoreKidsProgress } from "@/lib/kids/progress";
import { metadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/kids/[game]">) {
  const { game } = await params;
  if (!isGameId(game)) return {};
  return metadata(
    `${GAMES[game].title.en} · Academy Kids`,
    GAMES[game].tagline.en,
    `/kids/${game}`,
  );
}

export default async function KidsGamePage({
  params,
}: PageProps<"/[lang]/kids/[game]">) {
  const { game } = await params;
  if (!isGameId(game)) notFound();
  const member = await getKidsMember();
  if (!member) return <KidsLogin />;
  const progress = restoreKidsProgress(member.progress);
  const done = new Set(progress.done);
  if (!gameOpen(GAMES[game], done)) return <GameLocked gameId={game} />;
  if (GAMES[game].maze)
    return <MazeLab initialDone={progress.done} initialXp={member.xp} />;
  const today = kidsToday();
  const task = dailyTask(today, done);
  return (
    <GameLab
      gameId={game}
      initialCode={progress.code[game]}
      initialDone={progress.done}
      initialXp={member.xp}
      daily={task.game === game && progress.daily.last !== today ? task : null}
      tour={!progress.tour}
    />
  );
}
