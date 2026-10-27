"use client";

import { useState } from "react";
import { Check, Globe, Landmark, ShieldCheck, Skull, X } from "lucide-react";
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
} from "@/lib/browser-risks/curriculum";
import {
  applyPolicy,
  bankSafe,
  dangers,
  DIRECTIVES,
  PAGE,
  policyRight,
  readMarkup,
  transfer,
  type BankSetup,
  type SameSite,
} from "@/lib/browser-risks/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "./browser-risks.css";

// Academy Intermediate · Browser-side risks: XSS, CSP and CSRF on a
// pretend browser that describes what would happen and runs nothing.
export function BrowserRisks() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("WEB APPLICATION SECURITY · MODULE 3")}
      title={t("Browser-side risks.")}
      subtitle={t("Keep foreign code and forged requests out.")}
      description={t(
        "See what a comment becomes when it is read as HTML, check link addresses, build a Content-Security-Policy, and stop a foreign site from sending a bank transfer in your name.",
      )}
      badge={t("BROWSER / LAB")}
      icon={<Globe size={22} />}
      checkpoints={["browser-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "markup":
            return <MarkupWidget {...props} />;
          case "csp":
            return <CspWidget {...props} />;
          case "csrf":
            return <CsrfWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** A comment read by innerHTML or by textContent, described, never run. */
function MarkupWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [comment, setComment] = useState("Ajoyib kitob!");
  const [mode, setMode] = useState<"html" | "text">("html");
  const [sawElement, setSawElement] = useState(false);
  const nodes = readMarkup(comment);
  const elements = nodes.filter((n) => n.kind === "element");
  const risky = dangers(nodes);
  const update = (value: string, nextMode = mode) => {
    const made = readMarkup(value).some((n) => n.kind === "element");
    const saw = sawElement || (made && nextMode === "html");
    setSawElement(saw);
    // Solved once the student has seen markup become elements and then
    // looks at the same comment placed as text.
    onSolved(saw && made && nextMode === "text");
  };
  return (
    <div className="nl-card cb-card">
      <label className="cb-field">
        {t("Comment")}
        <input
          value={comment}
          maxLength={120}
          spellCheck={false}
          autoCapitalize="off"
          onChange={(e) => {
            setComment(e.target.value);
            update(e.target.value);
          }}
        />
      </label>
      <fieldset className="br-modes">
        <legend>{t("How the page places it")}</legend>
        {(["html", "text"] as const).map((m) => (
          <label key={m} className={`br-mode${mode === m ? " on" : ""}`}>
            <input
              type="radio"
              name="br-mode"
              checked={mode === m}
              onChange={() => {
                setMode(m);
                update(comment, m);
              }}
            />
            <code>{m === "html" ? "innerHTML" : "textContent"}</code>
          </label>
        ))}
      </fieldset>
      <div aria-live="polite">
        <span className="cb-label">{t("What the browser builds")}</span>
        {mode === "text" ? (
          <ol className="br-tree">
            <li className="br-text">
              {t("Text")}: <code>{JSON.stringify(comment)}</code>
            </li>
          </ol>
        ) : (
          <ol className="br-tree">
            {nodes.map((node, i) =>
              node.kind === "text" ? (
                <li key={i} className="br-text">
                  {t("Text")}: <code>{JSON.stringify(node.text)}</code>
                </li>
              ) : (
                <li key={i} className="br-element">
                  {t("Element (tag)")}: <code>{`<${node.tag}>`}</code>
                  {node.attrs.length > 0 && (
                    <>
                      {" "}
                      {node.attrs.map((a) => (
                        <code key={a.name} className="br-attr">
                          {a.name}
                          {a.value ? `="${a.value}"` : ""}
                        </code>
                      ))}
                    </>
                  )}
                </li>
              ),
            )}
          </ol>
        )}
        {mode === "html" && elements.length > 0 && (
          <p className="nl-fail">
            <X size={15} aria-hidden="true" />{" "}
            {t(
              "The comment became {count} element(s): it is markup, not text.",
              {
                count: elements.length,
              },
            )}
          </p>
        )}
        {mode === "html" &&
          risky.map((d, i) => (
            <p key={i} className="nl-fail br-danger">
              <Skull size={15} aria-hidden="true" /> {text(d.why)}
            </p>
          ))}
        {mode === "text" && (
          <p className="nl-pass">
            <ShieldCheck size={15} aria-hidden="true" />{" "}
            {t(
              "With textContent every character stays text; nothing new is built.",
            )}
          </p>
        )}
      </div>
    </div>
  );
}

/** Pick directives; each resource shows whether it loads. */
function CspWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [chosen, setChosen] = useState<string[]>([]);
  const { verdicts, ignored } = applyPolicy(chosen);
  const toggle = (d: string) => {
    const next = chosen.includes(d)
      ? chosen.filter((x) => x !== d)
      : [...chosen, d];
    setChosen(next);
    onSolved(policyRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <fieldset className="br-directives">
        <legend>{t("Directives in the policy")}</legend>
        {DIRECTIVES.map((d) => (
          <label
            key={d}
            className={`br-mode${chosen.includes(d) ? " on" : ""}`}
          >
            <input
              type="checkbox"
              checked={chosen.includes(d)}
              onChange={() => toggle(d)}
            />
            <code>{d}</code>
          </label>
        ))}
      </fieldset>
      <pre className="ui-query" tabIndex={0}>
        Content-Security-Policy: {chosen.length ? chosen.join("; ") : "—"}
      </pre>
      {ignored.length > 0 && (
        <p className="cb-out">
          {t("Ignored (a directive of that name came first)")}:{" "}
          {ignored.map((d) => (
            <code key={d}>{d} </code>
          ))}
        </p>
      )}
      <table className="ui-cases">
        <thead>
          <tr>
            <th scope="col">{t("Resource")}</th>
            <th scope="col">{t("Needed?")}</th>
            <th scope="col">{t("Browser")}</th>
          </tr>
        </thead>
        <tbody>
          {PAGE.map((r) => {
            const v = verdicts.get(r.id)!;
            return (
              <tr key={r.id} className={v.allowed === r.needed ? "ok" : "bad"}>
                <td>
                  {text(r.label)}
                  <br />
                  <code>{r.code}</code>
                </td>
                <td>{r.needed ? t("Page needs it") : t("Attack")}</td>
                <td>
                  {v.allowed ? t("Loads") : t("Blocked")}
                  {v.by && <small> · {v.by}</small>}{" "}
                  {v.allowed === r.needed ? (
                    <Check size={14} aria-label={t("As it should be")} />
                  ) : (
                    <X size={14} aria-label={t("Not as it should be")} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** The bank's settings, its own transfer and a forged one. */
function CsrfWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [setup, setSetup] = useState<BankSetup>({
    sameSite: "None",
    token: false,
  });
  const change = (next: BankSetup) => {
    setSetup(next);
    onSolved(bankSafe(next));
  };
  const attempts = [transfer(setup, "bank"), transfer(setup, "evil")];
  return (
    <div className="nl-card cb-card">
      <div className="cb-grid">
        <fieldset className="br-modes">
          <legend>
            {t("Session cookie")} <code>SameSite</code>
          </legend>
          {(["None", "Lax", "Strict"] as SameSite[]).map((s) => (
            <label
              key={s}
              className={`br-mode${setup.sameSite === s ? " on" : ""}`}
            >
              <input
                type="radio"
                name="br-samesite"
                checked={setup.sameSite === s}
                onChange={() => change({ ...setup, sameSite: s })}
              />
              <code>{s}</code>
            </label>
          ))}
        </fieldset>
        <label className="ui-switch">
          <input
            type="checkbox"
            checked={setup.token}
            onChange={(e) => change({ ...setup, token: e.target.checked })}
          />
          {t("Check a CSRF token in the form")}
        </label>
      </div>
      <pre className="ui-query" tabIndex={0}>
        Set-Cookie: session=…; Secure; HttpOnly; SameSite={setup.sameSite}
      </pre>
      <div className="br-attempts" aria-live="polite">
        {attempts.map((a) => (
          <div
            key={a.from}
            className={`br-attempt ${a.accepted === (a.from === "bank") ? "ok" : "bad"}`}
          >
            <strong>
              {a.from === "bank" ? (
                <Landmark size={16} aria-hidden="true" />
              ) : (
                <Skull size={16} aria-hidden="true" />
              )}{" "}
              {a.from === "bank"
                ? t("bank.cybervalue.uz: your own transfer")
                : t("evil.example: a hidden form posts a transfer")}
            </strong>
            <code>POST https://bank.cybervalue.uz/transfer</code>
            <ul>
              <li>
                {t("Session cookie")}:{" "}
                {a.cookieSent ? t("sent") : t("not sent")}
              </li>
              {setup.token && (
                <li>
                  {t("CSRF token")}: {a.tokenOk ? t("correct") : t("missing")}
                </li>
              )}
              <li>
                <strong>
                  {a.accepted
                    ? t("The bank sends the money.")
                    : t("The bank refuses.")}
                </strong>
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
