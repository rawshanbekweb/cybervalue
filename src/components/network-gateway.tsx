import Link from "next/link";
import { ArrowUpRight, Network } from "lucide-react";
import { getTranslator } from "@/lib/i18n/server";
import "./mission-gateway.css";

export async function NetworkGateway() {
  const t = await getTranslator();
  return (
    <section
      className="mission-gateway"
      aria-labelledby="network-gateway-title"
    >
      <div className="mission-gateway-icon">
        <Network size={32} />
      </div>
      <div>
        <span className="eyebrow">{t("8 LESSONS · NETWORK SIMULATOR")}</span>
        <h2 id="network-gateway-title">{t("IP addressing lab")}</h2>
        <p>
          {t(
            "Learn IP addresses, subnet masks and gateways with clickable bits, a network simulator, automatically checked tasks and a subnet calculator.",
          )}
        </p>
        <div className="mission-gateway-tags">
          <span>{t("Clickable bits")}</span>
          <span>{t("Network simulator")}</span>
          <span>{t("Beginner")}</span>
        </div>
      </div>
      <Link href="/playground/network-basics" className="button button-primary">
        {t("Open IP lab")}
        <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
