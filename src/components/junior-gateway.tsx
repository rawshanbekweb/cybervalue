import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import "./junior-gateway.css";

export async function JuniorGateway() {
  const t = await getTranslator();
  return (
    <section className="junior-gateway" aria-labelledby="junior-gateway-title">
      <div className="junior-gateway-icon">
        <GraduationCap size={32} />
      </div>
      <div>
        <span className="eyebrow">
          {t("NEW · FIRST STEP · NO EXPERIENCE NEEDED")}
        </span>
        <h2 id="junior-gateway-title">{t("Cybervalue Academy Junior")}</h2>
        <p>
          {t(
            "New to cybersecurity? Start here. Six short missions: crack a password, spot a scam, break a cipher and capture your first flag. No coding needed.",
          )}
        </p>
        <div className="junior-gateway-tags">
          <span>{t("6 short missions")}</span>
          <span>{t("About 30 minutes")}</span>
          <span>{t("No account needed")}</span>
        </div>
      </div>
      <Link href="/playground/junior" className="button button-primary">
        {t("Start your first mission")}
        <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
