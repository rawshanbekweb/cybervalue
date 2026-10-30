"use client";

import { useState } from "react";
import { MailWarning, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/phishing/curriculum";
import {
  DOMAINS,
  HEADERS,
  headersRight,
  LINKS,
  linksRight,
  ORIGIN_IP,
  registered,
  type Calls,
} from "@/lib/phishing/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./phishing.css";

// Academy Intermediate · Phishing analysis: trace a fake bank email through
// its headers and check six links' real addresses.
export function Phishing() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("BLUE TEAM · MODULE 5")}
      title={t("Phishing analysis.")}
      subtitle={t("The From line is text. The headers are evidence.")}
      description={t(
        "Sort the signs of phishing, read an email’s headers, trace a fake bank email to its first server and its real reply address, interpret SPF, DKIM and DMARC, unmask six links, rank attachments by risk and respond once the verdict is in.",
      )}
      badge={t("MAIL / LAB")}
      icon={<MailWarning size={22} />}
      checkpoints={["phishing-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "headers":
            return <HeadersWidget {...props} />;
          case "links":
            return <LinksWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** The raw headers; name the first hop and where replies really go. */
function HeadersWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [ip, setIp] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const answer = (nextIp: string, nextReply: string | null) => {
    setIp(nextIp);
    setReply(nextReply);
    onSolved(headersRight(nextIp, nextReply));
  };
  return (
    <div className="nl-card cb-card">
      <pre className="al-code ph-headers" tabIndex={0}>
        {HEADERS.join("\n")}
      </pre>
      <label className="cb-field">
        {t("The first server’s IP address")}
        <input
          value={ip}
          maxLength={40}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => answer(e.target.value, reply)}
        />
      </label>
      <fieldset className="br-modes">
        <legend>{t("Replies would go to the domain")}</legend>
        {DOMAINS.map((d) => (
          <label key={d} className={`br-mode${reply === d ? " on" : ""}`}>
            <input
              type="radio"
              name="ph-reply"
              checked={reply === d}
              onChange={() => answer(ip, d)}
            />
            <code>{d}</code>
          </label>
        ))}
      </fieldset>
      {headersRight(ip, reply) ? (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "It started at {ip}, not at the bank, failed SPF and DMARC, and replies go to a free mailbox. Phishing.",
            { ip: ORIGIN_IP },
          )}
        </p>
      ) : (
        ip.trim() &&
        reply && (
          <p className="nl-fail" aria-live="polite">
            {t(
              "Read the bottom Received line for the IP, and the Reply-To line for the domain.",
            )}
          </p>
        )
      )}
    </div>
  );
}

/** Six links: reveal the real address and call each one. */
function LinksWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [shown, setShown] = useState<Record<number, boolean>>({});
  const [calls, setCalls] = useState<Calls>({});
  const call = (i: number, bad: boolean) => {
    const next = { ...calls, [i]: bad };
    setCalls(next);
    onSolved(linksRight(next));
  };
  const right = LINKS.filter((l, i) => calls[i] === l.bad).length;
  return (
    <div className="nl-card cb-card">
      <ol className="ph-links">
        {LINKS.map((l, i) => (
          <li key={l.href} className="ph-link">
            <fieldset>
              <legend>
                <span className="ph-shown">{l.shown}</span>
              </legend>
              <label className="ui-switch">
                <input
                  type="checkbox"
                  checked={!!shown[i]}
                  onChange={(e) =>
                    setShown({ ...shown, [i]: e.target.checked })
                  }
                />
                {t("Show the real address")}
              </label>
              {shown[i] && (
                <p className="ph-href">
                  <code>{l.href}</code>
                  <span className="ph-domain">
                    {t("Domain: {domain}", { domain: registered(l.href) })}
                  </span>
                </p>
              )}
              <div className="br-modes">
                <label className={`br-mode${calls[i] === false ? " on" : ""}`}>
                  <input
                    type="radio"
                    name={`ph-link-${i}`}
                    checked={calls[i] === false}
                    onChange={() => call(i, false)}
                  />
                  {t("Safe")}
                </label>
                <label className={`br-mode${calls[i] === true ? " on" : ""}`}>
                  <input
                    type="radio"
                    name={`ph-link-${i}`}
                    checked={calls[i] === true}
                    onChange={() => call(i, true)}
                  />
                  {t("Suspicious")}
                </label>
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      <p className="cb-label">
        {t("Right calls: {n} of {total}", { n: right, total: LINKS.length })}
      </p>
      {linksRight(calls) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Four traps: a brand as a subdomain, a 1 for an l, a Cyrillic а and a .pdf.exe. Only the post office and the newsletter were real.",
          )}
        </p>
      )}
    </div>
  );
}
