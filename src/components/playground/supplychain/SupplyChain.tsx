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
} from "@/lib/supplychain/curriculum";
import {
  ADVISORIES,
  auditRight,
  INSTALLS,
  LOCK,
  typoRight,
  VULNERABLE,
  type Calls,
} from "@/lib/supplychain/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../securecode/securecode.css";
import "./supplychain.css";

// Academy Intermediate · Dependencies and supply chain: audit a lockfile by
// hand, then spot look-alike packages.
export function SupplyChain() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("APPSEC · MODULE 3")}
      title={t("Dependencies and supply chain.")}
      subtitle={t("Most of your app is other people’s code.")}
      description={t(
        "Tell direct from transitive dependencies, read versions and the lockfile, check a lockfile against advisories by hand, catch look-alike package names, see how good packages get poisoned, use an SBOM and decide what to update, when.",
      )}
      badge={t("DEPENDENCIES / LAB")}
      icon={<Boxes size={22} />}
      checkpoints={["supplychain-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "audit":
            return <AuditWidget {...props} />;
          case "typo":
            return <TypoWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** The lockfile beside the advisories; tick what is affected. */
function AuditWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (name: string, on: boolean) => {
    const next = on ? [...picked, name] : picked.filter((p) => p !== name);
    setPicked(next);
    onSolved(auditRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <p className="cb-label">{t("Advisories")}</p>
      <div className="sc-table" tabIndex={0}>
        <table className="ui-cases sch-table">
          <thead>
            <tr>
              <th scope="col">{t("Package")}</th>
              <th scope="col">{t("Fixed in")}</th>
              <th scope="col">{t("Flaw")}</th>
            </tr>
          </thead>
          <tbody>
            {ADVISORIES.map((a) => (
              <tr key={a.name}>
                <th scope="row">
                  <code>{a.name}</code>
                </th>
                <td>
                  <code>{a.fixed}</code>
                </td>
                <td>{text(a.issue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cb-label">
        <code>package-lock.json</code>
      </p>
      <div className="sc-table" tabIndex={0}>
        <table className="ui-cases sch-table">
          <thead>
            <tr>
              <th scope="col">{t("Package")}</th>
              <th scope="col">{t("Installed")}</th>
              <th scope="col">{t("Kind")}</th>
              <th scope="col">{t("Affected")}</th>
            </tr>
          </thead>
          <tbody>
            {LOCK.map((d) => (
              <tr key={d.name}>
                <th scope="row">
                  <code>{d.name}</code>
                </th>
                <td>
                  <code>{d.version}</code>
                </td>
                <td>
                  <small>{d.direct ? t("direct") : t("transitive")}</small>
                </td>
                <td>
                  <input
                    type="checkbox"
                    aria-label={t("{name} {version} is affected", {
                      name: d.name,
                      version: d.version,
                    })}
                    checked={picked.includes(d.name)}
                    onChange={(e) => toggle(d.name, e.target.checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cb-label">{t("Ticked: {n}", { n: picked.length })}</p>
      {auditRight(picked) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "{n} packages need updating, one of them transitive. express and axios are past their fixes, and qs has no advisory.",
            { n: VULNERABLE.length },
          )}
        </p>
      )}
    </div>
  );
}

/** Six install commands: the real package or a look-alike? */
function TypoWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [calls, setCalls] = useState<Calls>({});
  const call = (i: number, fake: boolean) => {
    const next = { ...calls, [i]: fake };
    setCalls(next);
    onSolved(typoRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {INSTALLS.map((p, i) => {
          const c = calls[i];
          return (
            <li key={p.cmd} className="sc-line">
              <code className="sc-code">$ {p.cmd}</code>
              <fieldset className="sch-choice">
                <legend className="visually-hidden">{p.cmd}</legend>
                <label>
                  <input
                    type="radio"
                    name={`sch-${i}`}
                    checked={c === false}
                    onChange={() => call(i, false)}
                  />{" "}
                  {t("Real package")}
                </label>
                <label>
                  <input
                    type="radio"
                    name={`sch-${i}`}
                    checked={c === true}
                    onChange={() => call(i, true)}
                  />{" "}
                  {t("Look-alike")}
                </label>
              </fieldset>
              {c !== undefined && (
                <span className={c === p.fake ? "sd-ok" : "sd-bad"}>
                  {c === p.fake ? text(p.why) : t("Look again")}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {typoRight(calls) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Three traps caught: one letter too many, a missing hyphen and two swapped letters are all it takes.",
          )}
        </p>
      )}
    </div>
  );
}
