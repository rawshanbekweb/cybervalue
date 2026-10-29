"use client";

import { useState } from "react";
import { Check, Lock, ShieldCheck, Skull, X } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/tls/curriculum";
import type { Text } from "@/lib/anim-lab/types";
import {
  certValid,
  checkCert,
  findings,
  grade,
  HOST,
  NAMES,
  SETTINGS,
  stripping,
  strippingSafe,
  type CertSetup,
  type StripSetup,
  type TlsSetup,
} from "@/lib/tls/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./tls.css";

// Academy Intermediate · TLS and certificates: the browser's certificate
// checks, a TLS setup grade and SSL stripping against HSTS.
export function Tls() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("CRYPTOGRAPHY · MODULE 5")}
      title={t("TLS and certificates.")}
      subtitle={t("The padlock, checked properly.")}
      description={t(
        "Fix a server until the browser trusts its certificate, raise a TLS setup to an A+, and stop SSL stripping on a café Wi-Fi with HSTS and the preload list.",
      )}
      badge={t("TLS / LAB")}
      icon={<Lock size={22} />}
      checkpoints={["tls-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "chain":
            return <ChainWidget {...props} />;
          case "grade":
            return <GradeWidget {...props} />;
          case "hsts":
            return <HstsWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

function Mark({ ok }: { ok: boolean }) {
  const { t } = useT();
  return ok ? (
    <Check size={14} aria-label={t("As it should be")} />
  ) : (
    <X size={14} aria-label={t("Not as it should be")} />
  );
}

/** The server's certificate setup and the browser's four checks. */
function ChainWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [setup, setSetup] = useState<CertSetup>({
    names: ["shop.uz"],
    intermediate: false,
    expired: true,
    issuer: "self",
  });
  const change = (next: CertSetup) => {
    setSetup(next);
    onSolved(certValid(next));
  };
  const checks = checkCert(setup);
  const failed = checks.find((c) => !c.ok);
  return (
    <div className="nl-card cb-card">
      <div className="cb-grid">
        <fieldset className="br-directives">
          <legend>{t("Names on the certificate (SAN)")}</legend>
          {NAMES.map((n) => (
            <label
              key={n}
              className={`br-mode${setup.names.includes(n) ? " on" : ""}`}
            >
              <input
                type="checkbox"
                checked={setup.names.includes(n)}
                onChange={() =>
                  change({
                    ...setup,
                    names: setup.names.includes(n)
                      ? setup.names.filter((x) => x !== n)
                      : [...setup.names, n],
                  })
                }
              />
              <code>{n}</code>
            </label>
          ))}
        </fieldset>
        <fieldset className="br-modes">
          <legend>{t("Signed by")}</legend>
          {(["self", "ca"] as const).map((issuer) => (
            <label
              key={issuer}
              className={`br-mode${setup.issuer === issuer ? " on" : ""}`}
            >
              <input
                type="radio"
                name="tl-issuer"
                checked={setup.issuer === issuer}
                onChange={() => change({ ...setup, issuer })}
              />
              {issuer === "self"
                ? t("The server itself (self-signed)")
                : t("Let’s Encrypt (a public CA)")}
            </label>
          ))}
        </fieldset>
      </div>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={setup.intermediate}
          onChange={(e) => change({ ...setup, intermediate: e.target.checked })}
        />
        {t("Send the intermediate certificate (fullchain.pem)")}
      </label>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={!setup.expired}
          onChange={(e) => change({ ...setup, expired: !e.target.checked })}
        />
        {t("Renew the certificate (valid for 90 days)")}
      </label>
      <table className="ui-cases" aria-live="polite">
        <caption className="cb-label">
          {t("The browser opens https://{host}", { host: HOST })}
        </caption>
        <tbody>
          {checks.map((c) => (
            <tr key={c.id} className={c.ok ? "ok" : "bad"}>
              <td>{text(c.label)}</td>
              <td>
                <Mark ok={c.ok} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {failed ? (
        <p className="nl-fail">
          <Skull size={15} aria-hidden="true" /> {t("Red warning page:")}{" "}
          <code>{failed.error}</code>
        </p>
      ) : (
        <p className="nl-pass">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t("The padlock shows and the page opens.")}
        </p>
      )}
    </div>
  );
}

const SETTING_LABEL: Record<(typeof SETTINGS)[number], Text> = {
  tls10: { uz: "TLS 1.0", en: "TLS 1.0" },
  tls11: { uz: "TLS 1.1", en: "TLS 1.1" },
  tls12: { uz: "TLS 1.2", en: "TLS 1.2" },
  tls13: { uz: "TLS 1.3", en: "TLS 1.3" },
  weakCiphers: { uz: "RC4 / 3DES", en: "RC4 / 3DES" },
  rsaKex: { uz: "RSA kalit almashinuvi", en: "RSA key exchange" },
  key1024: { uz: "1024 bitli RSA kalit", en: "RSA 1024-bit key" },
  hsts: { uz: "HSTS", en: "HSTS" },
};

/** Settings on the left, the grade and its reasons on the right. */
function GradeWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [setup, setSetup] = useState<TlsSetup>({
    tls10: true,
    tls11: true,
    tls12: true,
    tls13: false,
    weakCiphers: true,
    rsaKex: true,
    key1024: false,
    hsts: false,
  });
  const g = grade(setup);
  return (
    <div className="nl-card cb-card">
      <fieldset className="br-directives">
        <legend>{t("What the server allows")}</legend>
        {SETTINGS.map((k) => (
          <label key={k} className={`br-mode${setup[k] ? " on" : ""}`}>
            <input
              type="checkbox"
              checked={setup[k]}
              onChange={(e) => {
                const next = { ...setup, [k]: e.target.checked };
                setSetup(next);
                onSolved(grade(next) === "A+");
              }}
            />
            <code>{text(SETTING_LABEL[k])}</code>
          </label>
        ))}
      </fieldset>
      <div className="tl-grade" aria-live="polite">
        <strong className={`tl-mark g-${g.replace("+", "p")}`}>{g}</strong>
        <ul>
          {findings(setup).map((f, i) => (
            <li key={i}>
              <span className="tl-cap">≤ {f.cap}</span> {text(f.why)}
            </li>
          ))}
          {g === "A+" && <li>{t("Nothing left to fix.")}</li>}
        </ul>
      </div>
    </div>
  );
}

/** A redirect, HSTS and preload against an attacker on the Wi-Fi. */
function HstsWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [setup, setSetup] = useState<StripSetup>({
    redirect: true,
    hsts: false,
    preload: false,
  });
  const r = stripping(setup);
  const change = (next: StripSetup) => {
    const fixed = { ...next, preload: next.preload && next.hsts };
    setSetup(fixed);
    onSolved(strippingSafe(fixed));
  };
  return (
    <div className="nl-card cb-card">
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={setup.redirect}
          onChange={(e) => change({ ...setup, redirect: e.target.checked })}
        />
        {t("Redirect http:// to https://")}
      </label>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={setup.hsts}
          onChange={(e) => change({ ...setup, hsts: e.target.checked })}
        />
        {t("Send Strict-Transport-Security: max-age=31536000")}
      </label>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={setup.preload}
          disabled={!setup.hsts}
          onChange={(e) => change({ ...setup, preload: e.target.checked })}
        />
        {t("Add the site to the HSTS preload list (needs HSTS)")}
      </label>
      <table className="ui-cases" aria-live="polite">
        <tbody>
          {(["first", "later"] as const).map((k) => (
            <tr key={k} className={r[k] ? "ok" : "bad"}>
              <th scope="row">
                {k === "first"
                  ? t("First visit, the user types shop.uz")
                  : t("A later visit")}
              </th>
              <td>
                {r[k]
                  ? t("The browser goes straight to HTTPS.")
                  : t(
                      "The attacker answers the http:// request and strips HTTPS.",
                    )}{" "}
                <Mark ok={r[k]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
