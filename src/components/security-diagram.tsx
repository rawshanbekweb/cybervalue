import { Fingerprint, Code2, ShieldCheck, ScanLine } from "lucide-react";

export function SecurityDiagram() {
  return (
    <div
      className="security-diagram"
      role="img"
      aria-label="Application security connects thinking like an attacker, building like a developer, and defending like a security engineer."
    >
      <div className="diagram-grid" />
      <div className="diagram-orbit orbit-outer" />
      <div className="diagram-orbit orbit-inner" />
      <div className="diagram-axis axis-horizontal" />
      <div className="diagram-axis axis-vertical" />
      <span className="diagram-cross cross-one">+</span>
      <span className="diagram-cross cross-two">+</span>
      <div className="diagram-core">
        <Fingerprint size={66} strokeWidth={1} />
        <span>
          SECURITY
          <br />
          BY DESIGN
        </span>
      </div>
      <div className="diagram-node node-think">
        <ScanLine size={19} />
        <span>
          THINK<span>Understand the attack</span>
        </span>
        <i />
      </div>
      <div className="diagram-node node-build">
        <Code2 size={19} />
        <span>
          BUILD<span>Engineer the solution</span>
        </span>
        <i />
      </div>
      <div className="diagram-node node-defend">
        <ShieldCheck size={19} />
        <span>
          DEFEND<span>Question the assumptions</span>
        </span>
        <i />
      </div>
      <div className="diagram-caption">
        <span className="status-dot" />A mindset, not a destination
        <span className="diagram-coord">CV / 001</span>
      </div>
    </div>
  );
}
