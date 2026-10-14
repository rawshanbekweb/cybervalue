import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { ArrowUpRight, ShieldAlert } from "lucide-react";
import { SCENARIOS } from "@/lib/defend/scenarios";
import "./mission-gateway.css";

export async function DefendGateway() {
  const t = await getTranslator();
  return (
    <section className="mission-gateway" aria-labelledby="defend-gateway-title">
      <div className="mission-gateway-icon">
        <ShieldAlert size={32} />
      </div>
      <div>
        <span className="eyebrow">
          {t("{count} SCENARIOS · XSS & REDIRECTS", {
            count: SCENARIOS.length,
          })}
        </span>
        <h2 id="defend-gateway-title">
          {t("Write the code. Then let a bot attack it.")}
        </h2>
        <p>
          {t(
            "Fix a comment wall, a profile card, search results and a sign-in redirect until every real payload fails and every feature still works.",
          )}
        </p>
        <div className="mission-gateway-tags">
          <span>{t("Real payloads")}</span>
          <span>{t("Isolated sandbox")}</span>
          <span>{t("Export your defense")}</span>
        </div>
      </div>
      <Link href="/playground/defend" className="button button-primary">
        {t("Open Build & Defend")}
        <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
