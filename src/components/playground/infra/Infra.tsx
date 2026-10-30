"use client";

import { useState } from "react";
import { Network, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/infra/curriculum";
import {
  CERTS,
  ctRight,
  dnsRight,
  DOMAIN,
  QUESTIONS,
  RECORDS,
  subdomains,
  type Answers,
} from "@/lib/infra/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./infra.css";

// Academy Intermediate · Domains and infrastructure: read DNS records and
// certificate-transparency entries for an invented company.
export function Infra() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("OSINT · MODULE 3")}
      title={t("Domains and infrastructure.")}
      subtitle={t("Map what an organisation shows the internet.")}
      description={t(
        "Read a WHOIS record, sort what DNS records reveal, work out a company’s mail and shop providers and spot a dangling record, turn certificate logs into a subdomain list and flag exposed build servers, use ASNs and passive scanners, respect third-party ownership and assemble the map.",
      )}
      badge={t("DNS / LAB")}
      icon={<Network size={22} />}
      checkpoints={["infra-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "dns":
            return <DnsWidget {...props} />;
          case "ct":
            return <CtWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** The zone's records, and three questions answered from them. */
function DnsWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [answers, setAnswers] = useState<Answers>({});
  return (
    <div className="nl-card cb-card">
      <pre className="al-code in-zone" tabIndex={0}>
        {RECORDS.map((r) => `${r.name}  ${r.type}  ${r.value}`).join("\n")}
      </pre>
      <div className="in-questions">
        {QUESTIONS.map((q) => (
          <label key={q.id} className="cb-field">
            {text(q.ask)}
            <select
              value={answers[q.id] ?? ""}
              onChange={(e) => {
                const next = { ...answers, [q.id]: e.target.value };
                setAnswers(next);
                onSolved(dnsRight(next));
              }}
            >
              <option value="">{t("Choose an answer")}</option>
              {q.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {dnsRight(answers) ? (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Mail is on Google, the shop on Shopify, and blog points at a deleted Ghost site — remove that record before someone claims the name.",
          )}
        </p>
      ) : (
        QUESTIONS.every((q) => answers[q.id]) && (
          <p className="nl-fail" aria-live="polite">
            {t("Read the MX, the SPF and each CNAME again.")}
          </p>
        )
      )}
    </div>
  );
}

/** crt.sh rows; collect names and flag the build and test systems. */
function CtWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [listed, setListed] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const names = subdomains();
  const toggle = (name: string, on: boolean) => {
    const next = on ? [...picked, name] : picked.filter((n) => n !== name);
    setPicked(next);
    onSolved(ctRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <p className="cb-out">
        <code>https://crt.sh/?q=%25.{DOMAIN}</code>
      </p>
      <div className="in-table" tabIndex={0}>
        <table className="ui-cases in-certs">
          <thead>
            <tr>
              <th scope="col">{t("Certificate")}</th>
              <th scope="col">{t("Logged")}</th>
              <th scope="col">{t("Names")}</th>
            </tr>
          </thead>
          <tbody>
            {CERTS.map((c) => (
              <tr key={c.id}>
                <th scope="row">
                  <code>{c.id}</code>
                </th>
                <td>
                  <code>{c.logged}</code>
                </td>
                <td>
                  {c.names.map((n) => (
                    <code key={n} className="in-name">
                      {n}
                    </code>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={listed}
          onChange={(e) => setListed(e.target.checked)}
        />
        {t("Make a list of unique names, without wildcards")}
      </label>
      {listed && (
        <fieldset className="br-directives">
          <legend>
            {t("{n} names — mark the build and test systems", {
              n: names.length,
            })}
          </legend>
          {names.map((n) => (
            <label
              key={n}
              className={`br-mode${picked.includes(n) ? " on" : ""}`}
            >
              <input
                type="checkbox"
                checked={picked.includes(n)}
                onChange={(e) => toggle(n, e.target.checked)}
              />
              <code>{n}</code>
            </label>
          ))}
        </fieldset>
      )}
      {ctRight(picked) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Jenkins, staging and the dev API belong behind the VPN. The certificates gave them away without a single packet sent to the company.",
          )}
        </p>
      )}
    </div>
  );
}
