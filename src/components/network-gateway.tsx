import Link from "next/link";
import { ArrowUpRight, Network } from "lucide-react";
import { getTranslator } from "@/lib/i18n/server";
import { LESSONS } from "@/lib/network/curriculum";
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
        <span className="eyebrow">
          {t("{count} LESSONS · NETWORK SIMULATOR", {
            count: LESSONS.length,
          })}
        </span>
        <h2 id="network-gateway-title">{t("IP addressing lab")}</h2>
        <p>
          {t(
            "Learn IP addresses, subnet masks and gateways, then watch DHCP hand out addresses, DNS find a site’s IP and NAT share one public address, with a network simulator and a subnet calculator.",
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
