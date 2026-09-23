import Link from "next/link";
import { ArrowUpRight, Code2 } from "lucide-react";
import "./mission-gateway.css";

export function StudioGateway() {
  return (
    <section className="mission-gateway" aria-labelledby="studio-gateway-title">
      <div className="mission-gateway-icon">
        <Code2 size={32} />
      </div>
      <div>
        <span className="eyebrow">3 PROJECTS · HTML & CSS</span>
        <h2 id="studio-gateway-title">
          Turn the lesson into something useful.
        </h2>
        <p>
          Build an incident form, a service status page, or a product launch.
          Start with a brief, shape your own design, and check the details.
        </p>
        <div className="mission-gateway-tags">
          <span>Live preview</span>
          <span>Structural feedback</span>
          <span>Export your work</span>
        </div>
      </div>
      <Link href="/playground/studio" className="button button-primary">
        Open project studio <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
