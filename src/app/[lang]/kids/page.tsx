import { KidsHub, KidsLogin } from "@/components/kids/kids-home";
import { getKidsMember } from "@/lib/kids/session";
import { restoreKidsProgress } from "@/lib/kids/progress";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Cybervalue Academy Kids",
    "Game hacking for children aged 7–10: change the code of a game and watch it obey. Children sign in with the access code from their teacher.",
    "/kids",
  );

export default async function KidsPage() {
  const member = await getKidsMember();
  if (!member) return <KidsLogin />;
  const progress = restoreKidsProgress(member.progress);
  return (
    <KidsHub
      name={member.name}
      xp={member.xp}
      done={progress.done}
      best={progress.best}
    />
  );
}
