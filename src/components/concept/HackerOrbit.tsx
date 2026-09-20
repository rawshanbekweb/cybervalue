import { Radar, Terminal, ShieldCheck, Fingerprint } from "lucide-react";

export function HackerOrbit() {
  return (
    <div
      className="hk-orbit"
      role="img"
      aria-label="A console watching recon, exploitation, and response as one connected loop."
    >
      <div className="hk-orbit-grid" />
      <div className="hk-orbit-ring hk-orbit-outer" />
      <div className="hk-orbit-ring hk-orbit-inner" />
      <div className="hk-orbit-core">
        <Fingerprint size={48} strokeWidth={1} />
        <span>
          LIVE
          <br />
          CONSOLE
        </span>
      </div>
      <div className="hk-orbit-node node-recon">
        <Radar size={16} />
        <span>
          RECON<span>Mapping the surface</span>
        </span>
        <i />
      </div>
      <div className="hk-orbit-node node-exploit">
        <Terminal size={16} />
        <span>
          EXPLOIT<span>Safe, sandboxed replay</span>
        </span>
        <i />
      </div>
      <div className="hk-orbit-node node-defend">
        <ShieldCheck size={16} />
        <span>
          DEFEND<span>Contained response</span>
        </span>
        <i />
      </div>
      <div className="hk-orbit-caption">
        <span className="hk-orbit-pulse" /> monitoring, not guessing
        <span className="hk-orbit-coord">HK / 01</span>
      </div>
    </div>
  );
}
