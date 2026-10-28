"use client";

import { useState } from "react";
import { Check, Fingerprint, ShieldCheck, Skull, X } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/hashes/curriculum";
import {
  COSTS,
  costOutcome,
  costRight,
  duration,
  leak,
  SHA_SPEED,
  webhook,
  type Choice,
} from "@/lib/hashes/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./hashes.css";

// Academy Intermediate · Hashes and passwords: real SHA-256 and HMAC on a
// leaked table, a bcrypt cost against a graphics card, and a signed webhook.
export function Hashes() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("CRYPTOGRAPHY · MODULE 3")}
      title={t("Hashes and passwords.")}
      subtitle={t("Store them so a leak gives nothing away.")}
      description={t(
        "Crack a leaked password table with a ready-made list and stop it with a salt, pick a bcrypt cost that slows a graphics card for years but not a user, and stop a forged payment webhook with HMAC.",
      )}
      badge={t("HASH / LAB")}
      icon={<Fingerprint size={22} />}
      checkpoints={["hashes-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "salt":
            return <SaltWidget {...props} />;
          case "cost":
            return <CostWidget {...props} />;
          case "hmac":
            return <HmacWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** A leaked user table, with plain SHA-256 or salted. */
function SaltWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [salted, setSalted] = useState(false);
  const r = leak(salted);
  return (
    <div className="nl-card cb-card">
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={salted}
          onChange={(e) => {
            setSalted(e.target.checked);
            onSolved(e.target.checked);
          }}
        />
        {t("A salt for each user")}
      </label>
      <table className="ui-cases">
        <thead>
          <tr>
            <th scope="col">{t("User")}</th>
            <th scope="col">{t("Stored hash")}</th>
            <th scope="col">{t("From the attacker’s table")}</th>
          </tr>
        </thead>
        <tbody>
          {r.rows.map((row) => (
            <tr key={row.name} className={row.cracked ? "bad" : "ok"}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>
                <code className="hs-hash">{row.hash.slice(0, 16)}…</code>
              </td>
              <td>{row.cracked ? <code>{row.cracked}</code> : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p aria-live="polite" className={r.cracked ? "nl-fail" : "nl-pass"}>
        {r.cracked ? (
          <Skull size={15} aria-hidden="true" />
        ) : (
          <ShieldCheck size={15} aria-hidden="true" />
        )}{" "}
        {r.cracked
          ? t(
              "{cracked} passwords found in the table at once; {shared} users share a hash with someone.",
              { cracked: r.cracked, shared: r.shared },
            )
          : t(
              "The table matches nothing, and equal passwords no longer look equal.",
            )}
      </p>
    </div>
  );
}

/** SHA-256 or bcrypt at a cost, against a graphics card and a sign-in. */
function CostWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [choice, setChoice] = useState<Choice>({ algo: "sha256" });
  const o = costOutcome(choice);
  const crack = duration(o.seconds);
  const choose = (c: Choice) => {
    setChoice(c);
    onSolved(costRight(c));
  };
  const cost = choice.algo === "bcrypt" ? choice.cost : 10;
  return (
    <div className="nl-card cb-card">
      <fieldset className="br-modes">
        <legend>{t("How the password is stored")}</legend>
        <label className={`br-mode${choice.algo === "sha256" ? " on" : ""}`}>
          <input
            type="radio"
            name="hs-algo"
            checked={choice.algo === "sha256"}
            onChange={() => choose({ algo: "sha256" })}
          />
          <code>SHA-256 + salt</code>
        </label>
        <label className={`br-mode${choice.algo === "bcrypt" ? " on" : ""}`}>
          <input
            type="radio"
            name="hs-algo"
            checked={choice.algo === "bcrypt"}
            onChange={() => choose({ algo: "bcrypt", cost })}
          />
          <code>bcrypt</code>
        </label>
      </fieldset>
      {choice.algo === "bcrypt" && (
        <label className="cb-field">
          {t("Cost: {n}", { n: choice.cost })}
          <input
            type="range"
            min={0}
            max={COSTS.length - 1}
            value={COSTS.indexOf(choice.cost as (typeof COSTS)[number])}
            onChange={(e) =>
              choose({ algo: "bcrypt", cost: COSTS[Number(e.target.value)] })
            }
          />
        </label>
      )}
      <table className="ui-cases" aria-live="polite">
        <tbody>
          <tr className={o.years >= 1 ? "ok" : "bad"}>
            <th scope="row">{t("Attacker with one graphics card")}</th>
            <td>
              {t("{n} guesses a second", {
                n: Math.round(o.speed).toLocaleString("en").replace(/,/g, " "),
              })}
              <br />
              {t("Every 8-character password: {n} {unit}", {
                n: crack.n,
                unit: text(crack.unit),
              })}{" "}
              {o.years >= 1 ? (
                <Check size={14} aria-label={t("As it should be")} />
              ) : (
                <X size={14} aria-label={t("Not as it should be")} />
              )}
            </td>
          </tr>
          <tr className={o.loginMs <= 1000 ? "ok" : "bad"}>
            <th scope="row">{t("A user signing in")}</th>
            <td>
              {t("The server works {n} ms", {
                n: o.loginMs < 1 ? "<1" : Math.round(o.loginMs),
              })}{" "}
              {o.loginMs <= 1000 ? (
                <Check size={14} aria-label={t("As it should be")} />
              ) : (
                <X size={14} aria-label={t("Not as it should be")} />
              )}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="cb-out">
        {t("For comparison, SHA-256: {n} guesses a second.", {
          n: SHA_SPEED.toLocaleString("en").replace(/,/g, " "),
        })}
      </p>
    </div>
  );
}

/** A payment webhook signed with a plain hash or with HMAC. */
function HmacWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [useHmac, setUseHmac] = useState(false);
  const r = webhook(useHmac);
  return (
    <div className="nl-card cb-card">
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={useHmac}
          onChange={(e) => {
            setUseHmac(e.target.checked);
            onSolved(e.target.checked);
          }}
        />
        {t("Sign with HMAC (a secret key)")}
      </label>
      <pre className="ui-query" tabIndex={0}>
        {useHmac
          ? "signature = HMAC-SHA256(secret, body)"
          : "signature = SHA-256(body)"}
      </pre>
      <div className="br-attempts" aria-live="polite">
        {(["genuine", "forged"] as const).map((k) => {
          const m = r[k];
          const good = m.accepted === (k === "genuine");
          return (
            <div key={k} className={`br-attempt ${good ? "ok" : "bad"}`}>
              <strong>
                {k === "genuine" ? (
                  <ShieldCheck size={16} aria-hidden="true" />
                ) : (
                  <Skull size={16} aria-hidden="true" />
                )}{" "}
                {k === "genuine"
                  ? t("From the payment service")
                  : t("From the attacker, amount changed")}
              </strong>
              <code>{m.body}</code>
              <code className="hs-hash">
                {t("Signature")}: {m.signature.slice(0, 24)}…
              </code>
              <strong>
                {m.accepted
                  ? t("The shop marks the order paid.")
                  : t("The shop refuses: the signature does not match.")}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
