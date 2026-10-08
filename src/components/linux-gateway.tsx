import Link from "next/link";
import { ArrowUpRight, Terminal } from "lucide-react";
import { getTranslator } from "@/lib/i18n/server";
import "./mission-gateway.css";

export async function LinuxGateway() {
  const t = await getTranslator();
  return (
    <section className="mission-gateway" aria-labelledby="linux-gateway-title">
      <div className="mission-gateway-icon">
        <Terminal size={32} />
      </div>
      <div>
        <span className="eyebrow">
          {t("16 LESSONS · INTERACTIVE TERMINAL")}
        </span>
        <h2 id="linux-gateway-title">{t("Linux foundations lab")}</h2>
        <p>
          {t(
            "Learn Linux with 16 practical lessons, a browser terminal, virtual files, command explanations and automatically checked tasks.",
          )}
        </p>
        <div className="mission-gateway-tags">
          <span>{t("Virtual filesystem")}</span>
          <span>{t("Automatic task checks")}</span>
          <span>{t("Beginner")}</span>
        </div>
      </div>
      <Link href="/playground/linux-basics" className="button button-primary">
        {t("Open Linux lab")}
        <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
