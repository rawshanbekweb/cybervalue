"use client";

import { useState } from "react";
import { Cloud, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/shared/curriculum";
import {
  customerShare,
  LAYERS,
  MODEL_NAMES,
  splitRight,
  type Calls,
  type Model,
  type Owner,
} from "@/lib/shared/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · Shared responsibility: split each layer between
// the provider and the customer, first for IaaS, then for SaaS.
export function Shared() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("CLOUD · MODULE 1")}
      title={t("Shared responsibility.")}
      subtitle={t(
        "The provider secures the cloud; you secure what you put in it.",
      )}
      description={t(
        "Tell IaaS from PaaS from SaaS, find the line between security of and in the cloud, split six layers between provider and customer for IaaS and for SaaS, see why most cloud breaches are configuration mistakes, read provider audits and set up a new account on day one.",
      )}
      badge={t("CLOUD / LAB")}
      icon={<Cloud size={22} />}
      checkpoints={["shared-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "split":
            return <SplitWidget model={widget.model} {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Six layers of a system; give each to the provider or the customer. */
function SplitWidget({ model, onSolved }: WidgetProps & { model: Model }) {
  const { t, text } = useT();
  const [calls, setCalls] = useState<Calls>({});
  const call = (id: string, owner: Owner) => {
    const next = { ...calls, [id]: owner };
    setCalls(next);
    onSolved(splitRight(model, next));
  };
  return (
    <div className="nl-card cb-card">
      <p className="cb-label">{text(MODEL_NAMES[model])}</p>
      <ol className="sc-lines">
        {LAYERS.map((l) => {
          const c = calls[l.id];
          const right = l.owner[model];
          return (
            <li key={l.id} className="sc-line">
              <span>{text(l.name)}</span>
              <fieldset className="sch-choice">
                <legend className="visually-hidden">{text(l.name)}</legend>
                <label>
                  <input
                    type="radio"
                    name={`${model}-${l.id}`}
                    checked={c === "provider"}
                    onChange={() => call(l.id, "provider")}
                  />{" "}
                  {t("Provider")}
                </label>
                <label>
                  <input
                    type="radio"
                    name={`${model}-${l.id}`}
                    checked={c === "customer"}
                    onChange={() => call(l.id, "customer")}
                  />{" "}
                  {t("Customer")}
                </label>
              </fieldset>
              {c && (
                <span className={c === right ? "sd-ok" : "sd-bad"}>
                  {c === right ? t("That’s it") : t("Look again")}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {splitRight(model, calls) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Here the customer looks after {n} of {total} layers — and the data and who reaches it is always one of them.",
            { n: customerShare(model), total: LAYERS.length },
          )}
        </p>
      )}
    </div>
  );
}
