import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";
import "./ctf-gateway.css";

export async function CtfGateway() {
  const t = await getTranslator();
  return (
    <section className="ctf-gateway" aria-labelledby="ctf-gateway-title">
      <div className="ctf-gateway-time" aria-hidden="true">
        <Radio size={23} />
        <strong>00:17</strong>
        <span>{t("SIGNAL LOST")}</span>
      </div>
      <div className="ctf-gateway-copy">
        <span>{t("YANGI / HIKOYALI CTF")}</span>
        <h2 id="ctf-gateway-title">{t("Stansiya jim. Izlar esa gapiradi.")}</h2>
        <p>
          {t(
            "Besh topshiriq, to‘rtta kalit, bitta so‘nggi signal. Web, kriptografiya va loglar orasidan yashirilgan flaglarni toping.",
          )}
        </p>
      </div>
      <Link href="/playground/ctf">
        {t("Operatsiyani boshlash")}
        <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
