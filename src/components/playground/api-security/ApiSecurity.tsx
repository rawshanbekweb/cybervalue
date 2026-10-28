"use client";

import { useState } from "react";
import { Check, Server, ShieldCheck, Skull, X } from "lucide-react";
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
} from "@/lib/api-security/curriculum";
import {
  ACCOUNT,
  FIELD_RISK,
  FIELDS,
  LIMITS,
  limitOutcome,
  NEEDED,
  limitRight,
  patchMe,
  respond,
  responseRight,
  triesProtected,
  type Field,
  type Limit,
  type LimitKey,
} from "@/lib/api-security/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./api-security.css";

// Academy Intermediate · API security: what goes in and out of an API and
// how often, on a pretend API that answers in the page.
export function ApiSecurity() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("WEB APPLICATION SECURITY · MODULE 5")}
      title={t("API security.")}
      subtitle={t("An API has no screen to hide behind.")}
      description={t(
        "Trim a reply that says too much, stop a request that makes itself an admin, check bodies against a schema, set a rate limit that stops a botnet but not a real user, and review an API against a checklist.",
      )}
      badge={t("API / LAB")}
      icon={<Server size={22} />}
      checkpoints={["api-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "fields":
            return <FieldsWidget {...props} />;
          case "mass":
            return <MassWidget {...props} />;
          case "rate":
            return <RateWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Choose which fields GET /api/users/7 sends back. */
function FieldsWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [chosen, setChosen] = useState<Field[]>(FIELDS);
  const toggle = (f: Field) => {
    const next = chosen.includes(f)
      ? chosen.filter((x) => x !== f)
      : [...chosen, f];
    setChosen(next);
    onSolved(responseRight(next));
  };
  const leaks = chosen.flatMap((f) => (FIELD_RISK[f] ? [FIELD_RISK[f]] : []));
  const missing = NEEDED.filter((f) => !chosen.includes(f));
  return (
    <div className="nl-card cb-card">
      <fieldset className="br-directives">
        <legend>{t("Fields in the reply")}</legend>
        {FIELDS.map((f) => (
          <label
            key={f}
            className={`br-mode${chosen.includes(f) ? " on" : ""}`}
          >
            <input
              type="checkbox"
              checked={chosen.includes(f)}
              onChange={() => toggle(f)}
            />
            <code>{f}</code>
          </label>
        ))}
      </fieldset>
      <pre className="ui-query" tabIndex={0}>
        {`GET /api/users/7\n\n200 OK\n${JSON.stringify(respond(chosen), null, 2)}`}
      </pre>
      <div aria-live="polite">
        {leaks.map((why, i) => (
          <p key={i} className="nl-fail">
            <Skull size={15} aria-hidden="true" /> {text(why)}
          </p>
        ))}
        {missing.length > 0 && (
          <p className="nl-fail">
            <X size={15} aria-hidden="true" />{" "}
            {t("The card cannot be drawn without: {fields}", {
              fields: missing.join(", "),
            })}
          </p>
        )}
        {responseRight(chosen) && (
          <p className="nl-pass">
            <ShieldCheck size={15} aria-hidden="true" />{" "}
            {t("The reply carries exactly what the card needs.")}
          </p>
        )}
      </div>
    </div>
  );
}

/** PATCH /api/me, with and without an allowlist. */
function MassWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [body, setBody] = useState('{"name": "Ali", "bio": "Salom!"}');
  const [allowlist, setAllowlist] = useState(false);
  const [sawEscalation, setSawEscalation] = useState(false);
  const result = patchMe(body, allowlist);
  const update = (nextBody: string, nextAllow: boolean) => {
    const r = patchMe(nextBody, nextAllow);
    const saw = sawEscalation || (r.ok && r.escalated);
    setSawEscalation(saw);
    // Solved once an escalation was seen and the allowlist now stops a
    // body that tries the same.
    onSolved(
      saw && nextAllow && triesProtected(nextBody) && r.ok && !r.escalated,
    );
  };
  return (
    <div className="nl-card cb-card">
      <label className="cb-field">
        {t("Request body")} <code>PATCH /api/me</code>
        <textarea
          className="as-body"
          rows={3}
          value={body}
          maxLength={300}
          spellCheck={false}
          autoCapitalize="off"
          onChange={(e) => {
            setBody(e.target.value);
            update(e.target.value, allowlist);
          }}
        />
      </label>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={allowlist}
          onChange={(e) => {
            setAllowlist(e.target.checked);
            update(body, e.target.checked);
          }}
        />
        {t("Read only name and bio (allowlist)")}
      </label>
      <pre className="ui-query" tabIndex={0}>
        {allowlist
          ? "user.name = body.name; user.bio = body.bio;"
          : "Object.assign(user, body);"}
      </pre>
      <div
        aria-live="polite"
        className={`ac-reply ${result.ok && result.escalated ? "bad" : "ok"}`}
      >
        {!result.ok ? (
          <p className="nl-fail">
            <X size={15} aria-hidden="true" /> {text(result.error)}
          </p>
        ) : (
          <>
            <strong>{t("The account after the request")}</strong>
            <ul>
              {(Object.keys(ACCOUNT) as (keyof typeof ACCOUNT)[]).map((k) => (
                <li key={k}>
                  <code>{k}</code>:{" "}
                  <code>{JSON.stringify(result.account[k])}</code>
                  {result.account[k] !== ACCOUNT[k] && (
                    <small> · {t("changed")}</small>
                  )}
                </li>
              ))}
            </ul>
            {result.ignored.length > 0 && (
              <p>
                {t("Ignored")}: <code>{result.ignored.join(", ")}</code>
              </p>
            )}
            {result.escalated && (
              <p className="nl-fail">
                <Skull size={15} aria-hidden="true" />{" "}
                {t("The user changed a field only the server may set.")}
              </p>
            )}
            {allowlist && triesProtected(body) && !result.escalated && (
              <p className="nl-pass">
                <ShieldCheck size={15} aria-hidden="true" />{" "}
                {t("The allowlist kept the protected fields as they were.")}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** A limit on POST /api/login, against a botnet and a real user. */
function RateWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [limit, setLimit] = useState<Limit>(null);
  const [key, setKey] = useState<LimitKey>("ip");
  const o = limitOutcome(limit, key);
  const change = (l: Limit, k: LimitKey) => {
    setLimit(l);
    setKey(k);
    onSolved(limitRight(l, k));
  };
  const time =
    o.hours < 1
      ? t("{n} minutes", { n: Math.round(o.hours * 60) })
      : t("{n} hours", { n: Math.round(o.hours * 10) / 10 });
  return (
    <div className="nl-card cb-card">
      <div className="cb-grid">
        <fieldset className="br-modes">
          <legend>{t("Tries allowed per minute")}</legend>
          {LIMITS.map((l) => (
            <label
              key={String(l)}
              className={`br-mode${limit === l ? " on" : ""}`}
            >
              <input
                type="radio"
                name="as-limit"
                checked={limit === l}
                onChange={() => change(l, key)}
              />
              {l === null ? t("No limit") : l}
            </label>
          ))}
        </fieldset>
        <fieldset className="br-modes">
          <legend>{t("Counted per")}</legend>
          {(["ip", "account"] as const).map((k) => (
            <label key={k} className={`br-mode${key === k ? " on" : ""}`}>
              <input
                type="radio"
                name="as-key"
                checked={key === k}
                onChange={() => change(limit, k)}
              />
              {k === "ip" ? t("IP address") : t("Account")}
            </label>
          ))}
        </fieldset>
      </div>
      <table className="ui-cases" aria-live="polite">
        <tbody>
          <tr className={o.hours >= 24 ? "ok" : "bad"}>
            <th scope="row">{t("Attacker, 50 addresses")}</th>
            <td>
              {t("{n} guesses a minute reach the account", { n: o.perMinute })}
              <br />
              {t("10,000 passwords take {time}", { time })}{" "}
              {o.hours >= 24 ? (
                <Check size={14} aria-label={t("As it should be")} />
              ) : (
                <X size={14} aria-label={t("Not as it should be")} />
              )}
            </td>
          </tr>
          <tr className={o.userBlocked ? "bad" : "ok"}>
            <th scope="row">{t("Real user, 3 tries in a minute")}</th>
            <td>
              {o.userBlocked
                ? t("Blocked: 429 Too Many Requests")
                : t("Signs in")}{" "}
              {o.userBlocked ? (
                <X size={14} aria-label={t("Not as it should be")} />
              ) : (
                <Check size={14} aria-label={t("As it should be")} />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
