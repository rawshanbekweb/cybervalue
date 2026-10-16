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
            "New to cybersecurity? Start here. Missions, a mystery to solve, a cipher room from Caesar to Enigma, homework and ranks. Members sign in with the code from their teacher.",
          )}
        </p>
        <div className="junior-gateway-tags">
          <span>{t("6 short missions")}</span>
          <span>{t("10 historic ciphers")}</span>
          <span>{t("Sign in with an access code")}</span>
        </div>
      </div>
      <Link href="/playground/junior" className="button button-primary">
        {t("Enter the academy")}
        <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
