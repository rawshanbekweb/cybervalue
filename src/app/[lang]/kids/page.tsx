import { KidsHub, KidsLogin } from "@/components/kids/kids-home";
import { getKidsMember } from "@/lib/kids/session";
import { getDb } from "@/lib/db";
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
  // The group's top ten, with the child marked; first names only.
  const ranking = member.group
    ? ((await getDb()?.kidsMember.findMany({
        where: { group: member.group, active: true, xp: { gt: 0 } },
        orderBy: [{ xp: "desc" }, { updatedAt: "asc" }],
        take: 10,
        select: { id: true, name: true, xp: true },
      })) ?? [])
    : [];
  return (
    <KidsHub
      name={member.name}
      xp={member.xp}
      done={progress.done}
      best={progress.best}
      group={member.group}
      ranking={ranking.map((r) => ({
        name: r.name.split(/\s+/)[0],
        xp: r.xp,
        me: r.id === member.id,
      }))}
    />
  );
}
