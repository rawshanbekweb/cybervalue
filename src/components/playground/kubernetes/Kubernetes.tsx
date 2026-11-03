"use client";

import { useState } from "react";
import { Boxes, ShieldCheck } from "lucide-react";
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
} from "@/lib/kubernetes/curriculum";
import { SETTINGS, settingsRight, type Calls } from "@/lib/kubernetes/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · Kubernetes basics: call eight cluster settings safe
// or risky.
export function Kubernetes() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("CLOUD · MODULE 5")}
      title={t("Kubernetes basics.")}
      subtitle={t("Restricted pods, least-privilege accounts, default deny.")}
      description={t(
        "Learn how pods, nodes and the API server fit together, apply Pod Security Standards, review eight settings from a real-looking manifest, keep RBAC to least privilege, limit traffic with network policies, protect Secrets and look after the cluster itself.",
      )}
      badge={t("K8S / LAB")}
      icon={<Boxes size={22} />}
      checkpoints={["kubernetes-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "manifest":
            return <ManifestWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Eight settings; safe or risky? */
function ManifestWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [calls, setCalls] = useState<Calls>({});
  const call = (i: number, risky: boolean) => {
    const next = { ...calls, [i]: risky };
    setCalls(next);
    onSolved(settingsRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {SETTINGS.map((s, i) => {
          const c = calls[i];
          return (
            <li key={i} className="sc-line">
              <code className="sc-code">{s.code}</code>
              <fieldset className="sch-choice">
                <legend className="visually-hidden">{s.code}</legend>
                <label>
                  <input
                    type="radio"
                    name={`k8s-${i}`}
                    checked={c === false}
                    onChange={() => call(i, false)}
                  />{" "}
                  {t("Safe")}
                </label>
                <label>
                  <input
                    type="radio"
                    name={`k8s-${i}`}
                    checked={c === true}
                    onChange={() => call(i, true)}
                  />{" "}
                  {t("Risky")}
                </label>
              </fieldset>
              {c !== undefined && (
                <span className={c === s.risky ? "sd-ok" : "sd-bad"}>
                  {c === s.risky ? text(s.why) : t("Look again")}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {settingsRight(calls) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Four risky settings: a privileged pod, the host’s filesystem, cluster-admin for the default account and the host’s network.",
          )}
        </p>
      )}
    </div>
  );
}
