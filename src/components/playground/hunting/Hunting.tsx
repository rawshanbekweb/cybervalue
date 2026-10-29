"use client";

import { useState } from "react";
import { Crosshair, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/hunting/curriculum";
import {
  HOST_COUNT,
  layerRight,
  MATRIX,
  OUTLIER_HOST,
  REPORT,
  stacked,
  stackRight,
} from "@/lib/hunting/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./hunting.css";

// Academy Intermediate · Threat hunting: map a report onto ATT&CK and stack
// scheduled tasks to find the odd one out.
export function Hunting() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("BLUE TEAM · MODULE 4")}
      title={t("Threat hunting.")}
      subtitle={t("Assume they are in, then go and look.")}
      description={t(
        "Tell hunting from alert handling, write testable hypotheses, map a threat report onto the ATT&CK matrix, read a technique’s page, stack scheduled tasks across forty computers to find the rogue one, share indicators safely and close a hunt properly.",
      )}
      badge={t("HUNT / LAB")}
      icon={<Crosshair size={22} />}
      checkpoints={["hunting-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "matrix":
            return <MatrixWidget {...props} />;
          case "stack":
            return <StackWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Tick the techniques the report describes. */
function MatrixWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [picked, setPicked] = useState<string[]>([]);
  const report = [
    t("Sends phishing emails with an attached invoice."),
    t("Creates a scheduled task so it survives reboots."),
    t("Moves to other computers over Remote Desktop."),
    t("Uploads stolen files to a cloud storage service."),
  ];
  const toggle = (id: string, on: boolean) => {
    const next = on ? [...picked, id] : picked.filter((p) => p !== id);
    setPicked(next);
    onSolved(layerRight(next));
  };
  const solved = layerRight(picked);
  return (
    <div className="nl-card cb-card">
      <div className="ht-report">
        <p className="cb-label">{t("Threat report: what the group does")}</p>
        <ol>
          {report.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </div>
      <div className="ht-matrix">
        {MATRIX.map((tactic) => (
          <fieldset key={tactic.id} className="ht-tactic">
            <legend>
              {tactic.name} <code>{tactic.id}</code>
            </legend>
            {tactic.techniques.map((tech) => {
              const on = picked.includes(tech.id);
              const mark = solved && REPORT.includes(tech.id);
              return (
                <label
                  key={tech.id}
                  className={`ht-tech${on ? " on" : ""}${mark ? " hit" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) => toggle(tech.id, e.target.checked)}
                  />
                  <span>
                    <code>{tech.id}</code> {tech.name}
                  </span>
                </label>
              );
            })}
          </fieldset>
        ))}
      </div>
      <p className="cb-label">
        {t("Marked: {n} · in the report: {total}", {
          n: picked.length,
          total: REPORT.length,
        })}
      </p>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Four techniques, four hypotheses. Start with T1053.005: it leaves a trace on every infected computer.",
          )}
        </p>
      )}
    </div>
  );
}

/** Scheduled tasks counted across forty computers; pick the rogue one. */
function StackWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [rare, setRare] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const rows = rare ? stacked() : stacked().reverse();
  return (
    <div className="nl-card cb-card">
      <p className="cb-out">
        <code>
          {rare
            ? "| stats dc(host) as hosts by task_name, command | sort hosts"
            : "| stats dc(host) as hosts by task_name, command | sort -hosts"}
        </code>
      </p>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={rare}
          onChange={(e) => setRare(e.target.checked)}
        />
        {t("Rarest first")}
      </label>
      <fieldset className="ht-stack">
        <legend>
          {t("Scheduled tasks on {n} computers", { n: HOST_COUNT })}
        </legend>
        {rows.map((task) => (
          <label
            key={task.name}
            className={`ht-row${pick === task.name ? " on" : ""}`}
          >
            <input
              type="radio"
              name="ht-task"
              checked={pick === task.name}
              onChange={() => {
                setPick(task.name);
                onSolved(stackRight(task.name));
              }}
            />
            <span className="ht-count">
              {task.hosts}/{HOST_COUNT}
            </span>
            <span className="ht-task">
              <code>{task.name}</code>
              <code className="ht-cmd">{task.command}</code>
            </span>
          </label>
        ))}
      </fieldset>
      {pick && (
        <p
          className={stackRight(pick) ? "nl-pass" : "nl-fail"}
          aria-live="polite"
        >
          {stackRight(pick) ? (
            <>
              <ShieldCheck size={15} aria-hidden="true" />{" "}
              {t(
                "Only on {host}, and a fake svchost.exe in the Public folder. Windows never runs svchost from there: open an incident.",
                { host: OUTLIER_HOST },
              )}
            </>
          ) : (
            t(
              "This one is a normal updater found on many machines. Look for what is rare.",
            )
          )}
        </p>
      )}
    </div>
  );
}
