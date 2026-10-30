"use client";

import { useState } from "react";
import { FileCode2, ShieldCheck } from "lucide-react";
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
} from "@/lib/securecode/curriculum";
import {
  allowlist,
  bypassRight,
  denylist,
  FIX_NAMES,
  FIXES,
  fixRight,
  INPUTS,
  LINES,
  type Calls,
  type Fix,
} from "@/lib/securecode/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./securecode.css";

// Academy Intermediate · Secure coding: compare a denylist with an
// allowlist, then fix a handler's five mistakes.
export function SecureCode() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("APPSEC · MODULE 2")}
      title={t("Secure coding.")}
      subtitle={t("Small habits that close big holes.")}
      description={t(
        "Decide which inputs to trust, watch a denylist fail where an allowlist holds, fix a handler’s hard-coded key, SQL concatenation, logged password, mass assignment and leaked stack trace, fail closed, keep secrets out of git, log the right things and apply least privilege.",
      )}
      badge={t("CODE / LAB")}
      icon={<FileCode2 size={22} />}
      checkpoints={["securecode-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "filter":
            return <FilterWidget {...props} />;
          case "fix":
            return <FixWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Five name inputs through both filters; tick what beats the denylist. */
function FilterWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (s: string, on: boolean) => {
    const next = on ? [...picked, s] : picked.filter((p) => p !== s);
    setPicked(next);
    onSolved(bypassRight(next));
  };
  const verdict = (ok: boolean) => (ok ? t("accepted") : t("rejected"));
  return (
    <div className="nl-card cb-card">
      <pre className="al-code sc-rules" tabIndex={0}>
        {`// ${t("old")}: if (name.includes("<script>")) reject();\n// ${t("new")}: if (!/^[\\p{L}' -]{1,40}$/u.test(name)) reject();`}
      </pre>
      <div className="sc-table" tabIndex={0}>
        <table className="ui-cases sc-cases">
          <thead>
            <tr>
              <th scope="col">{t("Input")}</th>
              <th scope="col">{t("Denylist")}</th>
              <th scope="col">{t("Allowlist")}</th>
              <th scope="col">{t("Gets past the denylist as an attack")}</th>
            </tr>
          </thead>
          <tbody>
            {INPUTS.map((s) => (
              <tr key={s}>
                <th scope="row">
                  <code>{s}</code>
                </th>
                <td className={denylist(s) ? "ok" : "bad"}>
                  <small>{verdict(denylist(s))}</small>
                </td>
                <td className={allowlist(s) ? "ok" : "bad"}>
                  <small>{verdict(allowlist(s))}</small>
                </td>
                <td>
                  <input
                    type="checkbox"
                    aria-label={t("{input} gets past the denylist", {
                      input: s,
                    })}
                    checked={picked.includes(s)}
                    onChange={(e) => toggle(s, e.target.checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {bypassRight(picked) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Mixed case and an <img> tag walk past the denylist. The allowlist stops all three attacks and still lets O'Brien in.",
          )}
        </p>
      )}
    </div>
  );
}

/** A handler listing; choose the fix for each flagged line. */
function FixWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [calls, setCalls] = useState<Calls>({});
  const right = LINES.filter((l) => calls[l.no] === l.fix).length;
  return (
    <div className="nl-card cb-card">
      <p className="cb-out">
        <code>routes/profile.js</code>
      </p>
      <ol className="sc-lines">
        {LINES.map((l) => {
          const c = calls[l.no];
          return (
            <li key={l.no} className="sc-line">
              <code className="sc-code">
                <span className="sc-no">{l.no}</span> {l.code}
              </code>
              <label className="cb-field">
                {t("Fix for line {no}", { no: l.no })}
                <select
                  value={c ?? ""}
                  onChange={(e) => {
                    const next = { ...calls, [l.no]: e.target.value as Fix };
                    setCalls(next);
                    onSolved(fixRight(next));
                  }}
                >
                  <option value="">{t("Choose a fix")}</option>
                  {FIXES.map((f) => (
                    <option key={f} value={f}>
                      {text(FIX_NAMES[f])}
                    </option>
                  ))}
                </select>
              </label>
              {c && (
                <span className={c === l.fix ? "sd-ok" : "sd-bad"}>
                  {c === l.fix ? t("That’s the fix") : t("Not this one")}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="cb-label">
        {t("Right calls: {n} of {total}", { n: right, total: LINES.length })}
      </p>
      {fixRight(calls) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Five holes closed: the key moved out of the code, the query takes parameters, the password stays out of the log, only allowed fields are saved and the stack trace stays on the server.",
          )}
        </p>
      )}
    </div>
  );
}
