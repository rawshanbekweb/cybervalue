"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Check, HardDrive, X } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import {
  LESSONS,
  PROGRESS_KEY,
  type Widget,
} from "@/lib/filesystem/curriculum";
import {
  ACTIONS,
  ARTIFACTS,
  cellRight,
  gridSolved,
  STAMPS,
  START,
  timelineSolved,
  utcClock,
  type Action,
  type Grid,
  type Stamp,
} from "@/lib/filesystem/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "../firewall/firewall.css";
import "./filesystem.css";

// Academy Intermediate · File systems: MACB timestamps and a timeline built
// across time zones.
export function FileSystems() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("DIGITAL FORENSICS · MODULE 2")}
      title={t("File systems.")}
      subtitle={t("The disk remembers more than its owner.")}
      description={t(
        "Read stat output, work out which MACB timestamps an action changes, see why deleted files survive, recognise files by their first bytes, and build an attack timeline from sources in different time zones.",
      )}
      badge={t("FS / LAB")}
      icon={<HardDrive size={22} />}
      checkpoints={["filesystem-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "macb":
            return <MacbWidget {...props} />;
          case "timeline":
            return <TimelineWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Tick the stamps each action changes. */
function MacbWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [grid, setGrid] = useState<Grid>({
    read: [],
    write: [],
    chmod: [],
    rename: [],
  });
  const [checked, setChecked] = useState(false);
  const action: Record<Action, string> = {
    read: t("cat report.xlsx (read it)"),
    write: t("echo >> report.xlsx (write to it)"),
    chmod: "chmod 600 report.xlsx",
    rename: t("mv report.xlsx old.xlsx (rename)"),
  };
  const toggle = (a: Action, s: Stamp, on: boolean) => {
    const next = {
      ...grid,
      [a]: on ? [...grid[a], s] : grid[a].filter((x) => x !== s),
    };
    setGrid(next);
    setChecked(false);
    onSolved(gridSolved(next));
  };
  return (
    <div className="nl-card cb-card">
      <div
        className="fs-scroll"
        tabIndex={0}
        role="region"
        aria-label={t("Timestamp table")}
      >
        <table className="ui-cases fs-grid">
          <thead>
            <tr>
              <th scope="col">{t("The command")}</th>
              {STAMPS.map((s) => (
                <th key={s} scope="col">
                  {s.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ACTIONS.map((a) => (
              <tr key={a}>
                <th scope="row">
                  <code>{action[a]}</code>
                </th>
                {STAMPS.map((s) => (
                  <td
                    key={s}
                    className={
                      checked ? (cellRight(grid, a, s) ? "ok" : "bad") : ""
                    }
                  >
                    <input
                      type="checkbox"
                      className="fs-box"
                      aria-label={t("{stamp} changes after: {action}", {
                        stamp: s.toUpperCase(),
                        action: action[a],
                      })}
                      checked={grid[a].includes(s)}
                      onChange={(e) => toggle(a, s, e.target.checked)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="nl-primary"
        onClick={() => setChecked(true)}
      >
        {t("Show mistakes")}
      </button>
      <p className="cb-out" aria-live="polite">
        {checked &&
          (gridSolved(grid)
            ? t("Every cell is right.")
            : t("Cells in red are wrong. Birth never changes after creation."))}
      </p>
    </div>
  );
}

/** Reorder the artifacts into the real sequence of the attack. */
function TimelineWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [order, setOrder] = useState(START);
  const solved = timelineSolved(order);
  const move = (i: number, by: -1 | 1) => {
    const next = [...order];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    setOrder(next);
    onSolved(timelineSolved(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="fw-rules" aria-label={t("Events, earliest first")}>
        {order.map((id, i) => {
          const a = ARTIFACTS.find((x) => x.id === id)!;
          return (
            <li key={id} className="fw-rule fs-event">
              <span className="fw-id">{i + 1}</span>
              <span className="fs-what">
                <strong>{a.clock}</strong>
                {solved && <span className="fs-utc"> = {utcClock(a)} UTC</span>}
                <small>{text(a.source)}</small>
                <code>{text(a.what)}</code>
              </span>
              <span className="fw-move">
                <button
                  type="button"
                  disabled={i === 0}
                  aria-label={t("Move event {n} up", { n: i + 1 })}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={i === order.length - 1}
                  aria-label={t("Move event {n} down", { n: i + 1 })}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={15} aria-hidden="true" />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <p className={solved ? "nl-pass" : "nl-fail"} aria-live="polite">
        {solved ? (
          <>
            <Check size={15} aria-hidden="true" />{" "}
            {t(
              "Upload, web shell, a command, a miner, then persistence through cron: the attack in six minutes.",
            )}
          </>
        ) : (
          <>
            <X size={15} aria-hidden="true" />{" "}
            {t("Not yet in real order. Are all the clocks in the same zone?")}
          </>
        )}
      </p>
    </div>
  );
}
