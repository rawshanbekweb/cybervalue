import Link from "next/link";
import { ArrowUpRight, Crosshair } from "lucide-react";
import "./mission-gateway.css";

export function MissionGateway() {
  return (
    <section
      className="mission-gateway"
      aria-labelledby="mission-gateway-title"
    >
      <div className="mission-gateway-icon">
        <Crosshair size={32} />
      </div>
      <div>
        <span className="eyebrow">3 CASES · OPEN-ENDED INVESTIGATIONS</span>
        <h2 id="mission-gateway-title">Ready to think like an investigator?</h2>
        <p>
          Manipulate requests, uncover the failure, and prove your defense.
          Access control, checkout logic, and webhook replay — with evidence,
          regression tests, and a report you can keep.
        </p>
        <div className="mission-gateway-tags">
          <span>Editable requests</span>
          <span>Defense workbench</span>
          <span>Verified objectives</span>
        </div>
      </div>
      <Link href="/playground/missions" className="button button-primary">
        Open mission control <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
