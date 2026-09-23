import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";
import "./ctf-gateway.css";

export function CtfGateway() {
  return (
    <section
      className="ctf-gateway"
      aria-labelledby="ctf-gateway-title"
      lang="uz"
    >
      <div className="ctf-gateway-time" aria-hidden="true">
        <Radio size={23} />
        <strong>00:17</strong>
        <span>SIGNAL LOST</span>
      </div>
      <div className="ctf-gateway-copy">
        <span>YANGI / HIKOYALI CTF</span>
        <h2 id="ctf-gateway-title">Stansiya jim. Izlar esa gapiradi.</h2>
        <p>
          Besh topshiriq, to‘rtta kalit, bitta so‘nggi signal. Web,
          kriptografiya va loglar orasidan yashirilgan flaglarni toping.
        </p>
      </div>
      <Link href="/playground/ctf">
        Operatsiyani boshlash <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
