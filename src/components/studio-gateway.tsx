import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { ArrowUpRight, Code2 } from "lucide-react";
import "./mission-gateway.css";

export async function StudioGateway() {
  const t = await getTranslator();
  return (
    <section className="mission-gateway" aria-labelledby="studio-gateway-title">
      <div className="mission-gateway-icon">
        <Code2 size={32} />
      </div>
      <div>
        <span className="eyebrow">{t("3 PROJECTS · HTML & CSS")}</span>
        <h2 id="studio-gateway-title">
          {t("Turn the lesson into something useful.")}
        </h2>
        <p>
          {t(
            "Build an incident form, a service status page, or a product launch. Start with a brief, shape your own design, and check the details.",
          )}
        </p>
        <div className="mission-gateway-tags">
          <span>{t("Live preview")}</span>
          <span>{t("Structural feedback")}</span>
          <span>{t("Export your work")}</span>
        </div>
      </div>
      <Link href="/playground/studio" className="button button-primary">
        {t("Open project studio")}
        <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
