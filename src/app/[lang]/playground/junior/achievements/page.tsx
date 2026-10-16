import { Achievements } from "@/components/playground/junior/Achievements";
import { JuniorLogin } from "@/components/playground/junior/JuniorLogin";
import { AcademyShell } from "@/components/playground/junior/AcademyShell";
import { getJuniorMember } from "@/lib/junior/session";
import { rankingName } from "@/lib/junior/progress";
import { rankFor } from "@/lib/junior/rank";
import { getDb } from "@/lib/db";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Junior achievements",
    "Rank, badges, certificate and group ranking for Cybervalue Academy Junior members.",
    "/playground/junior/achievements",
    true,
  );

export default async function JuniorAchievementsPage() {
  const member = await getJuniorMember();
  if (!member) return <JuniorLogin />;
  const rows =
    member.group && getDb()
      ? await getDb()!.juniorMember.findMany({
          where: { group: member.group, active: true, xp: { gt: 0 } },
          orderBy: [{ xp: "desc" }, { lastActiveAt: "asc" }],
          take: 30,
          select: { id: true, name: true, codename: true, xp: true },
        })
      : [];
  return (
    <AcademyShell>
      <Achievements
        group={member.group}
        ranking={rows.map((row, i) => ({
          place: i + 1,
          me: row.id === member.id,
          name: rankingName(row),
          xp: row.xp,
          rank: rankFor(row.xp).rank.title,
        }))}
      />
    </AcademyShell>
  );
}
