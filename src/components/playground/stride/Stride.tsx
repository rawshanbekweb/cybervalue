"use client";

import { useState } from "react";
import { ShieldCheck, Workflow } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/stride/curriculum";
import {
  boundaryRight,
  FLOWS,
  NODES,
  STRIDE,
  STRIDE_NAMES,
  strideRight,
  THREATS,
  ZONES,
  type Calls,
  type Letter,
  type Zone,
} from "@/lib/stride/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./stride.css";

// Academy Intermediate · Threat modelling: find the flows that cross a trust
// boundary and sort six threats into STRIDE.
export function Stride() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("APPSEC · MODULE 1")}
      title={t("Threat modelling.")}
      subtitle={t("Find what can go wrong before it is built.")}
      description={t(
        "Learn the four questions, draw a data-flow diagram, find the flows that cross trust boundaries in a school grades app, sort six threats into STRIDE, pick controls and decide what to fix first.",
      )}
      badge={t("STRIDE / LAB")}
      icon={<Workflow size={22} />}
      checkpoints={["stride-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "boundary":
            return <BoundaryWidget {...props} />;
          case "stride":
            return <StrideWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

const ZONE_X: Record<Zone, [number, number]> = {
  internet: [0, 140],
  dmz: [140, 300],
  internal: [300, 580],
};

const nodeOf = (id: string) => NODES.find((n) => n.id === id)!;

/** The DFD with its zones; tick the flows that cross a boundary. */
function BoundaryWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<number[]>([]);
  const zoneName: Record<Zone, string> = {
    internet: t("Public internet"),
    dmz: "DMZ",
    internal: t("Internal network"),
  };
  const toggle = (id: number, on: boolean) => {
    const next = on ? [...picked, id] : picked.filter((p) => p !== id);
    setPicked(next);
    onSolved(boundaryRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <svg
        viewBox="0 0 580 300"
        className="sd-dfd"
        role="img"
        aria-label={t(
          "Data-flow diagram of the grades app in three trust zones",
        )}
      >
        {ZONES.map((z, i) => (
          <g key={z}>
            <rect
              x={ZONE_X[z][0]}
              y="0"
              width={ZONE_X[z][1] - ZONE_X[z][0]}
              height="300"
              className={`sd-zone sd-zone-${i}`}
            />
            <text x={ZONE_X[z][0] + 8} y="18" className="sd-zone-label">
              {zoneName[z]}
            </text>
          </g>
        ))}
        {FLOWS.map((f) => {
          const a = nodeOf(f.from);
          const b = nodeOf(f.to);
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          return (
            <g key={f.id}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={`sd-flow${picked.includes(f.id) ? " on" : ""}`}
              />
              <circle cx={mx} cy={my} r="10" className="sd-flow-dot" />
              <text x={mx} y={my + 4} textAnchor="middle" className="sd-num">
                {f.id}
              </text>
            </g>
          );
        })}
        {NODES.map((n) => (
          <g key={n.id}>
            <rect
              x={n.x - 52}
              y={n.y - 16}
              width="104"
              height="32"
              rx="6"
              className="sd-node"
            />
            <text x={n.x} y={n.y + 4} textAnchor="middle" className="sd-label">
              {text(n.name)}
            </text>
          </g>
        ))}
      </svg>
      <fieldset className="br-directives">
        <legend>{t("Flows that cross a trust boundary")}</legend>
        {FLOWS.map((f) => (
          <label
            key={f.id}
            className={`br-mode${picked.includes(f.id) ? " on" : ""}`}
          >
            <input
              type="checkbox"
              checked={picked.includes(f.id)}
              onChange={(e) => toggle(f.id, e.target.checked)}
            />
            {f.id}. {text(nodeOf(f.from).name)} → {text(nodeOf(f.to).name)}
          </label>
        ))}
      </fieldset>
      {boundaryRight(picked) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Four flows cross: both browsers into the DMZ, the web app into the internal network, and the API out to the SMS gateway. Those get checked first.",
          )}
        </p>
      )}
    </div>
  );
}

/** Six threats; give each a STRIDE letter. */
function StrideWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [calls, setCalls] = useState<Calls>({});
  const right = THREATS.filter((th) => calls[th.id] === th.letter).length;
  return (
    <div className="nl-card cb-card">
      <ol className="sd-threats">
        {THREATS.map((th) => {
          const c = calls[th.id];
          return (
            <li key={th.id} className="sd-threat">
              <label className="cb-field">
                {text(th.text)}
                <select
                  value={c ?? ""}
                  onChange={(e) => {
                    const next = {
                      ...calls,
                      [th.id]: e.target.value as Letter,
                    };
                    setCalls(next);
                    onSolved(strideRight(next));
                  }}
                >
                  <option value="">{t("Choose a letter")}</option>
                  {STRIDE.map((l) => (
                    <option key={l} value={l}>
                      {l} — {STRIDE_NAMES[l]}
                    </option>
                  ))}
                </select>
              </label>
              {c && (
                <span
                  className={c === th.letter ? "sd-ok" : "sd-bad"}
                  aria-live="polite"
                >
                  {c === th.letter ? t("That’s the letter") : t("Not this one")}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="cb-label">
        {t("Right calls: {n} of {total}", { n: right, total: THREATS.length })}
      </p>
      {strideRight(calls) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "S, T, R, I, D, E — one threat for every letter. Next, each gets a control and an owner.",
          )}
        </p>
      )}
    </div>
  );
}
