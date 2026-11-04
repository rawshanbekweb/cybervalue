"use client";

import { useState } from "react";
import { AppWindow, ShieldCheck } from "lucide-react";
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
} from "@/lib/permissions/curriculum";
import { REQUESTS, requestsRight } from "@/lib/permissions/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · App permissions and sandboxing: find the four
// permission requests the app doesn’t need.
export function Permissions() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("SOFTWARE · MODULE 3")}
      title={t("App permissions and sandboxing.")}
      subtitle={t("Every app in its own box, with only what its job needs.")}
      description={t(
        "Learn how sandboxes keep apps apart, tell low-risk permissions from near-full control, judge eight permission requests, choose browser extensions carefully, work in a standard account and review permissions regularly.",
      )}
      badge={t("APPS / LAB")}
      icon={<AppWindow size={22} />}
      checkpoints={["permissions-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "requests":
            return <RequestsWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Eight permission requests; tick the ones the app doesn’t need. */
function RequestsWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<number[]>([]);
  const solved = requestsRight(picked);
  const toggle = (i: number, on: boolean) => {
    const next = on ? [...picked, i] : picked.filter((n) => n !== i);
    setPicked(next);
    onSolved(requestsRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {REQUESTS.map((request, i) => (
          <li key={i} className="sc-line">
            <label>
              <input
                type="checkbox"
                aria-label={t("Request {n} is more than the app needs", {
                  n: i + 1,
                })}
                checked={picked.includes(i)}
                onChange={(e) => toggle(i, e.target.checked)}
              />{" "}
              <span className="sc-code">{text(request.app)}</span>
            </label>
            <span>{text(request.asks)}</span>
            {solved && (
              <span className={request.excessive ? "sd-bad" : "sd-ok"}>
                {text(request.why)}
              </span>
            )}
          </li>
        ))}
      </ol>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Four ask for too much: a torch wanting contacts and SMS, a calculator tracking location, a weather widget wanting Accessibility and an extension reading every site.",
          )}
        </p>
      )}
    </div>
  );
}
