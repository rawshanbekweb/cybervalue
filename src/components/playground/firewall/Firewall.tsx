"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BrickWall,
  Check,
  ShieldCheck,
  Skull,
  X,
} from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/firewall/curriculum";
import {
  DST_CHOICES,
  ENDPOINTS,
  INBOUND,
  inbound,
  narrowCheck,
  narrowSolved,
  orderResults,
  orderSolved,
  PORT_CHOICES,
  RULES,
  ruleText,
  SRC_CHOICES,
  START_ORDER,
  stateSolved,
  type Flow,
  type Narrow,
  type StateSetup,
} from "@/lib/firewall/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./firewall.css";

// Academy Intermediate · Firewalls and segmentation: rule order and the
// default policy, stateful filtering and least privilege.
export function Firewall() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("NETWORK SECURITY · MODULE 3")}
      title={t("Firewalls and segmentation.")}
      subtitle={t("Only what is needed, nothing more.")}
      description={t(
        "Read an iptables rule, put a rule list in the right order with a default deny, see why replies need a stateful firewall, narrow a rule to one flow, and split a company network into zones.",
      )}
      badge={t("FW / LAB")}
      icon={<BrickWall size={22} />}
      checkpoints={["firewall-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "order":
            return <OrderWidget {...props} />;
          case "stateful":
            return <StatefulWidget {...props} />;
          case "narrow":
            return <NarrowWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

function Mark({ ok }: { ok: boolean }) {
  const { t } = useT();
  return ok ? (
    <Check size={14} aria-label={t("As it should be")} />
  ) : (
    <X size={14} aria-label={t("Not as it should be")} />
  );
}

function FlowText({ flow }: { flow: Flow }) {
  const { text } = useT();
  return (
    <code>
      {text(ENDPOINTS[flow.from].label)} → {text(ENDPOINTS[flow.to].label)}:
      {flow.port}
    </code>
  );
}

/** Move rules up and down, pick the default, watch the eight cases. */
function OrderWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [order, setOrder] = useState(START_ORDER);
  const [fallback, setFallback] = useState<"allow" | "deny">("allow");
  const change = (nextOrder: string[], nextFallback: "allow" | "deny") => {
    setOrder(nextOrder);
    setFallback(nextFallback);
    onSolved(orderSolved(nextOrder, nextFallback));
  };
  const move = (i: number, by: -1 | 1) => {
    const next = [...order];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    change(next, fallback);
  };
  const results = orderResults(order, fallback);
  const right = results.filter((r) => r.ok).length;
  return (
    <div className="nl-card cb-card">
      <ol className="fw-rules" aria-label={t("Rules, checked from the top")}>
        {order.map((id, i) => {
          const rule = RULES.find((r) => r.id === id)!;
          return (
            <li key={id} className={`fw-rule ${rule.action}`}>
              <span className="fw-id">{id}</span>
              <code>{ruleText(rule)}</code>
              <span className="fw-move">
                <button
                  type="button"
                  disabled={i === 0}
                  aria-label={t("Move rule {id} up", { id })}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={i === order.length - 1}
                  aria-label={t("Move rule {id} down", { id })}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={15} aria-hidden="true" />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <fieldset className="br-modes">
        <legend>{t("When no rule matches (default policy)")}</legend>
        {(["allow", "deny"] as const).map((p) => (
          <label key={p} className={`br-mode${fallback === p ? " on" : ""}`}>
            <input
              type="radio"
              name="fw-default"
              checked={fallback === p}
              onChange={() => change(order, p)}
            />
            <code>{p.toUpperCase()}</code>
          </label>
        ))}
      </fieldset>
      <table className="ui-cases" aria-live="polite">
        <caption className="cb-label">
          {t("{right} of {total} cases as expected", {
            right,
            total: results.length,
          })}
        </caption>
        <tbody>
          {results.map((r, i) => (
            <tr key={i} className={r.ok ? "ok" : "bad"}>
              <td>
                <FlowText flow={r} />
                <small className="fw-why">{text(r.why)}</small>
              </td>
              <td>
                <code>{r.got.toUpperCase()}</code>{" "}
                <small>
                  {r.by ? t("rule {id}", { id: r.by }) : t("default")}
                </small>{" "}
                <Mark ok={r.ok} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Connection tracking against the source-port-443 workaround. */
function StatefulWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [setup, setSetup] = useState<StateSetup>({
    stateful: false,
    fromPort443: true,
  });
  const change = (next: StateSetup) => {
    setSetup(next);
    onSolved(stateSolved(next));
  };
  return (
    <div className="nl-card cb-card">
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={setup.stateful}
          onChange={(e) => change({ ...setup, stateful: e.target.checked })}
        />
        {t("Track connections: let in replies (ESTABLISHED)")}
      </label>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={setup.fromPort443}
          onChange={(e) => change({ ...setup, fromPort443: e.target.checked })}
        />
        {t("Allow anything inbound from source port 443")}
      </label>
      <table className="ui-cases" aria-live="polite">
        <caption className="cb-label">
          {t("Packets arriving from the internet")}
        </caption>
        <tbody>
          {INBOUND.map((p) => {
            const got = inbound(setup, p);
            const ok = got === p.want;
            return (
              <tr key={p.id} className={ok ? "ok" : "bad"}>
                <td>{text(p.label)}</td>
                <td>
                  {got === "allow" ? t("let in") : t("dropped")}{" "}
                  <Mark ok={ok} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {stateSolved(setup) ? (
        <p className="nl-pass">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Only the real reply gets in; a faked source port no longer helps.",
          )}
        </p>
      ) : (
        <p className="nl-fail">
          <Skull size={15} aria-hidden="true" />{" "}
          {t("Either the reply is lost or the attacker’s packet gets in.")}
        </p>
      )}
    </div>
  );
}

const choiceLabel = (v: string | number) =>
  v === "any" ? "any" : typeof v === "number" ? `tcp/${v}` : v;

/** Pick source, destination and port; count what else the rule lets in. */
function NarrowWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [rule, setRule] = useState<Narrow>({
    src: "any",
    dst: "any",
    port: "any",
  });
  const change = (next: Narrow) => {
    setRule(next);
    onSolved(narrowSolved(next));
  };
  const r = narrowCheck(rule);
  return (
    <div className="nl-card cb-card">
      <div className="cb-grid">
        <label className="cb-field">
          {t("Source")}
          <select
            className="fw-select"
            value={rule.src}
            onChange={(e) =>
              change({ ...rule, src: e.target.value as Narrow["src"] })
            }
          >
            {SRC_CHOICES.map((v) => (
              <option key={v} value={v}>
                {choiceLabel(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="cb-field">
          {t("Destination")}
          <select
            className="fw-select"
            value={rule.dst}
            onChange={(e) =>
              change({ ...rule, dst: e.target.value as Narrow["dst"] })
            }
          >
            {DST_CHOICES.map((v) => (
              <option key={v} value={v}>
                {choiceLabel(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="cb-field">
          {t("Port")}
          <select
            className="fw-select"
            value={String(rule.port)}
            onChange={(e) =>
              change({
                ...rule,
                port: e.target.value === "any" ? "any" : 5432,
              })
            }
          >
            {PORT_CHOICES.map((v) => (
              <option key={v} value={String(v)}>
                {choiceLabel(v)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="cb-out">
        <code>{ruleText({ id: "N", action: "allow", ...rule })}</code>
      </p>
      <div
        aria-live="polite"
        className={`ac-reply ${narrowSolved(rule) ? "ok" : "bad"}`}
      >
        <strong>
          {r.needed
            ? t("The web server reaches the database.")
            : t("The web server can’t reach the database.")}{" "}
          {t("Other flows this rule opens: {count}", { count: r.extra.length })}
        </strong>
        {r.extra.length > 0 && (
          <ul className="fw-extra">
            {r.extra.map((f, i) => (
              <li key={i}>
                <FlowText flow={f} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
