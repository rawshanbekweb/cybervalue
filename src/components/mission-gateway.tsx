import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { ArrowUpRight, Crosshair } from "lucide-react";
import "./mission-gateway.css";

export async function MissionGateway() {
  const t = await getTranslator();
  return (
    <section
      className="mission-gateway"
      aria-labelledby="mission-gateway-title"
    >
      <div className="mission-gateway-icon">
        <Crosshair size={32} />
      </div>
      <div>
        <span className="eyebrow">
          {t("3 CASES · OPEN-ENDED INVESTIGATIONS")}
        </span>
        <h2 id="mission-gateway-title">
          {t("Ready to think like an investigator?")}
        </h2>
        <p>
          {t(
            "Manipulate requests, uncover the failure, and prove your defense. Access control, checkout logic, and webhook replay — with evidence, regression tests, and a report you can keep.",
          )}
        </p>
        <div className="mission-gateway-tags">
          <span>{t("Editable requests")}</span>
          <span>{t("Defense workbench")}</span>
          <span>{t("Verified objectives")}</span>
        </div>
      </div>
      <Link href="/playground/missions" className="button button-primary">
        {t("Open mission control")}
        <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
