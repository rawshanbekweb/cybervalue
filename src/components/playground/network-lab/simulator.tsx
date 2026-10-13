"use client";

// Lessons 5–6: the LAN diagram, the ping simulator and frame-by-frame packets.

import { useState } from "react";
import { Check, RotateCcw, Send, StepBack, StepForward, X } from "lucide-react";
import { type Text } from "@/lib/network/ip";
import {
  fill,
  INTERNET_IP,
  networkWorks,
  ping,
  PRINTER_IP,
  ROUTER_IP,
  type Node,
  type PcConfig,
  type PingResult,
  type Target,
} from "@/lib/network/sim";
import { useT } from "./use-t";
import { frames, type Frame } from "@/lib/network/packets";

const NODES: Record<Node, { x: number; y: number }> = {
  pc: { x: 70, y: 80 },
  switch: { x: 250, y: 80 },
  printer: { x: 250, y: 200 },
  router: { x: 430, y: 80 },
  internet: { x: 590, y: 80 },
};
const LINKS: [Node, Node][] = [
  ["pc", "switch"],
  ["switch", "printer"],
  ["switch", "router"],
  ["router", "internet"],
];

// Links a packet crossed; router → printer goes back through the switch.
function usedLinks(hops: Node[]) {
  const used = new Set<string>();
  for (let i = 1; i < hops.length; i++) {
    const pair = [hops[i - 1], hops[i]].sort().join("-");
    if (pair === "printer-router") {
      used.add("printer-switch");
      used.add("router-switch");
    } else used.add(pair);
  }
  return used;
}

// Nodes a single frame crosses; LAN devices meet at the switch.
function framePath(frame: Frame): Node[] {
  if (frame.to === "all")
    return ["pc", "switch", "printer", "switch", "router"];
  if (frame.from === frame.to) return [frame.from];
  const pair = [frame.from, frame.to].sort().join("-");
  if (pair === "internet-router") return [frame.from, frame.to];
  return [frame.from, "switch", frame.to];
}

function Topology({
  config,
  result,
  frame,
}: {
  config: PcConfig;
  result: PingResult | null;
  frame: Frame | null;
}) {
  const { t } = useT();
  const path = frame ? framePath(frame) : (result?.hops ?? []);
  const links = usedLinks(path);
  const ok = frame ? !frame.stop : !!result?.ok;
  const stop = frame
    ? frame.stop
      ? frame.from
      : null
    : result && !result.ok
      ? result.hops.at(-1)
      : null;
  const labels: Record<Node, [string, string]> = {
    pc: [t("Kompyuter", "Computer"), config.ip || "—"],
    switch: ["Switch", "LAN"],
    printer: [t("Printer", "Printer"), PRINTER_IP],
    router: ["Router", ROUTER_IP],
    internet: ["Internet", INTERNET_IP],
  };
  return (
    <svg
      className="nl-topology"
      viewBox="0 0 660 250"
      role="img"
      aria-label={t(
        "Tarmoq sxemasi: kompyuter va printer switchga, switch routerga, router internetga ulangan.",
        "Network diagram: the computer and printer connect to a switch, the switch to a router, the router to the internet.",
      )}
    >
      <rect className="nl-lan" x="20" y="20" width="490" height="220" rx="16" />
      <text className="nl-lan-label" x="36" y="230">
        LAN 192.168.1.0/24
      </text>
      {LINKS.map(([a, b]) => {
        const key = [a, b].sort().join("-");
        return (
          <line
            key={key}
            className={`nl-wire ${links.has(key) ? (ok ? "ok" : "used") : ""}`}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
          />
        );
      })}
      {(Object.keys(NODES) as Node[]).map((node) => {
        const reached = path.includes(node);
        const state =
          node === stop ? "stop" : reached ? (ok ? "ok" : "reached") : "";
        return (
          <g
            key={node}
            className={`nl-node ${state}`}
            transform={`translate(${NODES[node].x} ${NODES[node].y})`}
          >
            <rect x="-56" y="-26" width="112" height="52" rx="10" />
            <text y="-4">{labels[node][0]}</text>
            <text className="nl-node-ip" y="14">
              {labels[node][1]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Lessons 5 and 6: configure the PC, ping and read the explanation.
export function NetworkWidget({
  start,
  onSolved,
}: {
  start: PcConfig;
  onSolved: (solved: boolean) => void;
}) {
  const { t, locale } = useT();
  const [config, setConfig] = useState(start);
  const [run, setRun] = useState<{
    target: Target;
    result: PingResult;
    frames: Frame[];
  } | null>(null);
  // null shows the whole path; a number steps through single frames.
  const [step, setStep] = useState<number | null>(null);
  const set = (key: keyof PcConfig, value: string) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    setRun(null);
    setStep(null);
    onSolved(networkWorks(next));
  };
  const send = (target: Target) => {
    setRun({
      target,
      result: ping(config, target),
      frames: frames(config, target),
    });
    setStep(null);
  };
  const frame = run && step !== null ? run.frames[step] : null;
  const fields: [keyof PcConfig, string][] = [
    ["ip", t("IP manzil", "IP address")],
    ["mask", "Subnet mask"],
    ["gateway", "Default gateway"],
  ];
  return (
    <div className="nl-card">
      <div className="nl-topology-frame">
        <Topology config={config} result={run?.result ?? null} frame={frame} />
      </div>
      <div className="nl-config">
        <p className="nl-row-label">
          {t("Kompyuter sozlamalari", "Computer settings")}
        </p>
        {fields.map(([key, label]) => (
          <label className="nl-field" key={key}>
            <span>{label}</span>
            <input
              value={config[key]}
              placeholder={key === "gateway" ? t("bo‘sh", "empty") : ""}
              onChange={(e) => set(key, e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
        ))}
      </div>
      <div className="nl-actions">
        <button className="nl-primary" onClick={() => send("printer")}>
          <Send size={15} /> ping {PRINTER_IP}
        </button>
        <button className="nl-primary" onClick={() => send("internet")}>
          <Send size={15} /> ping {INTERNET_IP}
        </button>
        <button
          className="nl-ghost"
          onClick={() => {
            setConfig(start);
            setRun(null);
            setStep(null);
            onSolved(false);
          }}
        >
          <RotateCcw size={14} /> {t("Boshidan", "Reset")}
        </button>
      </div>
      <div aria-live="polite">
        {run && (
          <div className={`nl-log ${run.result.ok ? "ok" : "fail"}`}>
            <p>
              {run.result.ok ? <Check size={16} /> : <X size={16} />}
              <strong>
                ping {run.target === "printer" ? PRINTER_IP : INTERNET_IP}:{" "}
                {run.result.ok
                  ? t("javob keldi", "reply received")
                  : t("javob yo‘q", "no reply")}
              </strong>
            </p>
            <ol>
              {run.result.log.map((line, i) => (
                <li key={i}>{fill(line, locale)}</li>
              ))}
            </ol>
          </div>
        )}
        {run && (
          <FrameStepper frames={run.frames} step={step} onStep={setStep} />
        )}
      </div>
    </div>
  );
}

const NODE_LABEL: Record<Node, Text> = {
  pc: { uz: "Kompyuter", en: "Computer" },
  switch: { uz: "Switch", en: "Switch" },
  printer: { uz: "Printer", en: "Printer" },
  router: { uz: "Router", en: "Router" },
  internet: { uz: "Internet", en: "Internet" },
};

// One frame at a time, with its Ethernet, ARP and IP fields.
function FrameStepper({
  frames: list,
  step,
  onStep,
}: {
  frames: Frame[];
  step: number | null;
  onStep: (step: number | null) => void;
}) {
  const { t, text, locale } = useT();
  if (!list.length)
    return (
      <p className="nl-caption nl-frames-empty">
        {t(
          "Kadrlar yo‘q: xato kompyuterning o‘zida topildi, paket tarmoqqa chiqmadi.",
          "No frames: the error was caught on the computer itself; nothing went on the wire.",
        )}
      </p>
    );
  const frame = step === null ? null : list[step];
  return (
    <section
      className="nl-frames"
      aria-label={t("Paket kadrlari", "Packet frames")}
    >
      <div className="nl-frames-head">
        <strong>
          {t("Kadrma-kadr", "Frame by frame")}
          {step !== null && ` · ${step + 1} / ${list.length}`}
        </strong>
        <div className="nl-actions">
          <button
            className="nl-ghost"
            onClick={() => onStep(step === null ? 0 : Math.max(0, step - 1))}
            disabled={step === 0}
          >
            <StepBack size={14} /> {t("Oldingi", "Previous")}
          </button>
          <button
            className="nl-primary"
            onClick={() =>
              onStep(step === null ? 0 : Math.min(list.length - 1, step + 1))
            }
            disabled={step === list.length - 1}
          >
            {step === null
              ? t("Boshlash", "Start")
              : t("Keyingi qadam", "Next step")}
            <StepForward size={14} />
          </button>
          {step !== null && (
            <button className="nl-ghost" onClick={() => onStep(null)}>
              {t("Butun yo‘l", "Whole path")}
            </button>
          )}
        </div>
      </div>
      {frame && (
        <div
          className={`nl-frame ${frame.stop ? "stop" : ""}`}
          aria-live="polite"
          key={step}
        >
          <p className="nl-frame-title">
            <span className={`nl-frame-kind ${frame.kind.toLowerCase()}`}>
              {frame.kind}
              {frame.arp && ` ${frame.arp.op}`}
              {frame.ip && ` echo ${frame.ip.type}`}
            </span>
            {text(NODE_LABEL[frame.from])} →{" "}
            {frame.to === "all"
              ? t("hammaga (broadcast)", "everyone (broadcast)")
              : text(NODE_LABEL[frame.to])}
          </p>
          <table className="nl-headers">
            <tbody>
              <tr>
                <th rowSpan={2}>Ethernet</th>
                <td>{t("MAC kimdan", "Source MAC")}</td>
                <td>
                  <code>{frame.eth.src}</code>
                </td>
              </tr>
              <tr>
                <td>{t("MAC kimga", "Destination MAC")}</td>
                <td>
                  <code>{frame.eth.dst}</code>
                </td>
              </tr>
              {frame.arp && (
                <tr>
                  <th>ARP</th>
                  <td colSpan={2}>
                    {fill(
                      { text: frame.arp.text, values: frame.arp.values },
                      locale,
                    )}
                  </td>
                </tr>
              )}
              {frame.ip && (
                <>
                  <tr>
                    <th rowSpan={3}>IP</th>
                    <td>{t("IP kimdan", "Source IP")}</td>
                    <td>
                      <code>{frame.ip.src}</code>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("IP kimga", "Destination IP")}</td>
                    <td>
                      <code>{frame.ip.dst}</code>
                    </td>
                  </tr>
                  <tr>
                    <td>TTL</td>
                    <td>
                      <code>{frame.ip.ttl}</code>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
          <p className="nl-frame-note">{fill(frame.note, locale)}</p>
          {frame.stop && (
            <p className="nl-fail">
              {t("Paket shu yerda to‘xtadi.", "The packet stops here.")}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
