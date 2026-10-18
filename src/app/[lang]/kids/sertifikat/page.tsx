import Link from "next/link";
import type { Metadata } from "next";
import { Award } from "lucide-react";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { getKidsMember } from "@/lib/kids/session";
import { CERTIFICATE_XP, kidsLevel } from "@/lib/kids/progress";
import { KidsLogin } from "@/components/kids/kids-home";
import { ReportPrint } from "@/components/report/print";
import "@/components/kids/kids.css";

export const metadata: Metadata = {
  title: "Academy Kids certificate",
  robots: { index: false, follow: false },
};

// A printable certificate once a child reaches the "Game hacker" level.
export default async function KidsCertificatePage() {
  const member = await getKidsMember();
  if (!member) return <KidsLogin />;
  const t = await getTranslator();
  const locale = await getLocale();
  if (member.xp < CERTIFICATE_XP)
    return (
      <div className="kids container">
        <p className="kids-cert-card">
          {t(
            "Reach {xp} XP to earn the “Game hacker” certificate. {left} XP to go!",
            { xp: CERTIFICATE_XP, left: CERTIFICATE_XP - member.xp },
          )}{" "}
          <Link href="/kids">{t("All games")}</Link>
        </p>
      </div>
    );
  const date = new Intl.DateTimeFormat(locale === "uz" ? "uz-Latn" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Tashkent",
  }).format(member.lastActiveAt ?? member.updatedAt);
  return (
    <div className="kids container">
      <div className="kids-lab-top kids-no-print">
        <Link className="kids-back" href="/kids">
          ← {t("All games")}
        </Link>
        <ReportPrint label={t("Print or save as PDF")} />
      </div>
      <article className="kids-certificate">
        <Award size={56} aria-hidden="true" />
        <p className="kids-eyebrow">Cybervalue Academy Kids</p>
        <h1>{t("Certificate")}</h1>
        <p>{t("This certifies that")}</p>
        <p className="kids-certificate-name">{member.name}</p>
        <p>
          {t(
            "changed the code of games, found the secret commands and earned the title",
          )}
        </p>
        <p className="kids-certificate-title">
          {kidsLevel(member.xp).level.title[locale]}
        </p>
        <p className="kids-muted">
          {member.xp} XP · {date}
        </p>
      </article>
    </div>
  );
}
