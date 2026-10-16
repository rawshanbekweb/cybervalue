"use client";

import { Users } from "lucide-react";
import { useT } from "../network-lab/use-t";
import { AgentCard } from "./AgentCard";
import { Badges, Certificate } from "./campaign";

export type RankingRow = {
  place: number;
  me: boolean;
  name: string;
  xp: number;
  rank: { uz: string; en: string };
};

// Everything the member has earned, on one calm page: the agent card,
// their group's ranking, the badges and, once earned, the certificate.
export function Achievements({
  group,
  ranking,
}: {
  group: string;
  ranking: RankingRow[];
}) {
  const { t, text } = useT();
  return (
    <div className="jr-achievements">
      <header className="jr-hero jr-page-head">
        <span className="eyebrow">
          <span className="status-dot" /> {t("YUTUQLAR", "ACHIEVEMENTS")}
        </span>
        <h1>
          {t("Har bir qadam.", "Every step.")}{" "}
          <span>{t("Hisobga olinadi.", "Counts.")}</span>
        </h1>
      </header>
      <div className="jr-ach-grid">
        <AgentCard />
        <section className="jr-ranking" aria-labelledby="jr-ranking-title">
          <h2 id="jr-ranking-title">
            <span className="jr-ring jr-ring-sm" aria-hidden="true">
              <Users size={15} />
            </span>
            {group
              ? t(`${group} guruhi reytingi`, `${group} group ranking`)
              : t("Guruh reytingi", "Group ranking")}
          </h2>
          {ranking.length ? (
            <ol>
              {ranking.map((row) => (
                <li key={row.place} className={row.me ? "me" : undefined}>
                  <span className="jr-ranking-place">{row.place}</span>
                  <span className="jr-ranking-name">
                    {row.name}
                    {row.me && <small> · {t("siz", "you")}</small>}
                  </span>
                  <span className="jr-ranking-rank">{text(row.rank)}</span>
                  <span className="jr-ranking-xp">{row.xp} XP</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="jr-note">
              {group
                ? t(
                    "Guruhingizda hali hech kim XP to‘plamagan. Birinchi bo‘ling!",
                    "No one in your group has earned XP yet. Be the first!",
                  )
                : t(
                    "O‘qituvchingiz sizni guruhga qo‘shgach, reyting paydo bo‘ladi.",
                    "The ranking appears once your teacher puts you in a group.",
                  )}
            </p>
          )}
          <p className="jr-ranking-note">
            {t(
              "Reytingda faqat taxallus (yoki ism) va XP ko‘rinadi.",
              "Only codenames (or first names) and XP are shown.",
            )}
          </p>
        </section>
      </div>
      <Certificate />
      <Badges />
    </div>
  );
}
