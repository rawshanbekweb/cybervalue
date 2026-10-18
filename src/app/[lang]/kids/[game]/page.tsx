import { notFound } from "next/navigation";
import { GameLab } from "@/components/kids/game-lab";
import { KidsLogin } from "@/components/kids/kids-home";
import { GAMES, isGameId } from "@/lib/kids/games";
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
  return (
    <GameLab
      gameId={game}
      initialCode={progress.code[game]}
      initialDone={progress.done}
      initialXp={member.xp}
    />
  );
}
