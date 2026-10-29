"use client";

import { useState } from "react";
import { Check, ShieldCheck, Skull, Wifi, X } from "lucide-react";
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
} from "@/lib/connections/curriculum";
import {
  CONNECTS,
  LEAKS,
  MODES,
  shouldConnect,
  span,
  sshSolved,
  vpnSafe,
  wifi,
  wifiSafe,
  type Span,
  type VpnSetup,
  type WifiMode,
} from "@/lib/connections/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./connections.css";

// Academy Intermediate · Secure connections: Wi-Fi modes against a recorded
// handshake, VPN tunnels on café Wi-Fi and SSH host keys.
export function Connections() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("NETWORK SECURITY · MODULE 4")}
      title={t("Secure connections.")}
      subtitle={t("Wi-Fi, VPN and SSH, set up so they actually protect.")}
      description={t(
        "See how long a recorded Wi-Fi handshake holds out under WEP, WPA2 and WPA3, close every leak a VPN can have on café Wi-Fi, and decide when an SSH host key fingerprint should stop you.",
      )}
      badge={t("VPN / LAB")}
      icon={<Wifi size={22} />}
      checkpoints={["connections-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "wifi":
            return <WifiWidget {...props} />;
          case "vpn":
            return <VpnWidget {...props} />;
          case "hostkey":
            return <HostKeyWidget {...props} />;
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

function Duration({ value }: { value: Span }) {
  const { t } = useT();
  const n = value.n;
  switch (value.unit) {
    case "s":
      return <>{t("{n} s", { n })}</>;
    case "min":
      return <>{t("{n} min", { n })}</>;
    case "h":
      return <>{t("{n} h", { n })}</>;
    case "d":
      return <>{t("{n} days", { n })}</>;
    case "y":
      return (
        <>{t("{n} years", { n: n.toLocaleString("en").replace(/,/g, " ") })}</>
      );
    case "ages":
      return <>{t("more than a million years")}</>;
  }
}

/** A mode and a passphrase against an attacker with the handshake. */
function WifiWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [mode, setMode] = useState<WifiMode>("wpa2");
  const [pass, setPass] = useState("cafe2024");
  const change = (m: WifiMode, p: string) => {
    setMode(m);
    setPass(p);
    onSolved(wifiSafe(m, p));
  };
  const r = wifi(mode, pass);
  const safe = wifiSafe(mode, pass);
  const label: Record<WifiMode, string> = {
    open: t("Open (no password)"),
    wep: "WEP",
    wpa2: "WPA2-PSK",
    wpa3: "WPA3-SAE",
  };
  return (
    <div className="nl-card cb-card">
      <fieldset className="br-modes">
        <legend>{t("Security mode")}</legend>
        {MODES.map((m) => (
          <label key={m} className={`br-mode${mode === m ? " on" : ""}`}>
            <input
              type="radio"
              name="cn-mode"
              checked={mode === m}
              onChange={() => change(m, pass)}
            />
            {label[m]}
          </label>
        ))}
      </fieldset>
      <label className="cb-field">
        {t("Wi-Fi password")}
        <input
          value={pass}
          maxLength={63}
          disabled={mode === "open"}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          onChange={(e) => change(mode, e.target.value)}
        />
      </label>
      <div aria-live="polite" className={`ac-reply ${safe ? "ok" : "bad"}`}>
        <strong>
          {r.kind === "open" && t("Anyone in range reads every packet.")}
          {r.kind === "wep" &&
            t("The key falls out of the recorded traffic in a few minutes.")}
          {r.kind === "invalid" &&
            t("WPA needs a password of 8 to 63 characters.")}
          {r.kind === "sae" &&
            t(
              "The recorded handshake is useless offline: each guess is a live attempt.",
            )}
          {r.kind === "offline" && (
            <>
              {t("Offline cracking of the recorded handshake:")}{" "}
              <Duration value={span(r.seconds)} />
            </>
          )}
        </strong>
        {safe ? (
          <p className="nl-pass">
            <ShieldCheck size={15} aria-hidden="true" />{" "}
            {t("The recorded handshake gives the attacker nothing usable.")}
          </p>
        ) : (
          <p className="nl-fail">
            <Skull size={15} aria-hidden="true" />{" "}
            {t("The attacker will be on the office network soon.")}
          </p>
        )}
      </div>
    </div>
  );
}

/** No VPN, a split tunnel or a full one, with or without DNS. */
function VpnWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [setup, setSetup] = useState<VpnSetup>({ mode: "none", dns: false });
  const change = (next: VpnSetup) => {
    setSetup(next);
    onSolved(vpnSafe(next));
  };
  const label = {
    none: t("No VPN"),
    split: t("Split tunnel (office only)"),
    full: t("Full tunnel (everything)"),
  } as const;
  return (
    <div className="nl-card cb-card">
      <fieldset className="br-modes">
        <legend>{t("VPN on the laptop")}</legend>
        {(["none", "split", "full"] as const).map((m) => (
          <label key={m} className={`br-mode${setup.mode === m ? " on" : ""}`}>
            <input
              type="radio"
              name="cn-vpn"
              checked={setup.mode === m}
              onChange={() => change({ ...setup, mode: m })}
            />
            {label[m]}
          </label>
        ))}
      </fieldset>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={setup.dns}
          disabled={setup.mode === "none"}
          onChange={(e) => change({ ...setup, dns: e.target.checked })}
        />
        {t("Send DNS queries through the tunnel")}
      </label>
      <table className="ui-cases" aria-live="polite">
        <caption className="cb-label">
          {t("What the attacker on the café Wi-Fi sees")}
        </caption>
        <tbody>
          {LEAKS.map((l) => {
            const seen = l.seen(setup);
            return (
              <tr key={l.id} className={seen ? "bad" : "ok"}>
                <td>{text(l.label)}</td>
                <td>
                  {seen ? t("visible") : t("hidden")} <Mark ok={!seen} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={vpnSafe(setup) ? "nl-pass" : "nl-fail"}>
        {vpnSafe(setup)
          ? t("All the attacker sees is encrypted traffic to vpn.shop.uz.")
          : t("Something still goes past the tunnel.")}
      </p>
    </div>
  );
}

/** Three ssh prompts; go ahead only when the fingerprint is the published one. */
function HostKeyWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [answers, setAnswers] = useState<
    Record<string, "yes" | "no" | undefined>
  >({});
  const answer = (id: string, a: "yes" | "no") => {
    const next = { ...answers, [id]: a };
    setAnswers(next);
    onSolved(sshSolved(next));
  };
  return (
    <div className="nl-card cb-card">
      {CONNECTS.map((c) => {
        const given = answers[c.id];
        const right = given === (shouldConnect(c) ? "yes" : "no");
        return (
          <fieldset key={c.id} className="cn-connect">
            <legend>
              {text(c.where)}: <code>ssh {c.host}</code>
            </legend>
            <pre className="al-code cn-prompt" tabIndex={0}>
              {c.warning === "changed"
                ? "@@@ WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED! @@@\n"
                : `The authenticity of host '${c.host.split("@")[1]}' can't be established.\n`}
              ED25519 key fingerprint is {c.shown}
            </pre>
            <p className="cn-published">
              {t("Published by the admin on the internal wiki:")}{" "}
              <code>{c.published}</code>
            </p>
            <div className="br-modes">
              {(["yes", "no"] as const).map((a) => (
                <label key={a} className={`br-mode${given === a ? " on" : ""}`}>
                  <input
                    type="radio"
                    name={`cn-${c.id}`}
                    checked={given === a}
                    onChange={() => answer(c.id, a)}
                  />
                  {a === "yes" ? t("Connect") : t("Stop")}
                </label>
              ))}
            </div>
            {given && (
              <p className={right ? "nl-pass" : "nl-fail"} aria-live="polite">
                {right
                  ? shouldConnect(c)
                    ? t(
                        "Right: the fingerprints match character for character.",
                      )
                    : t(
                        "Right: the fingerprints differ, so this may be a man in the middle.",
                      )
                  : shouldConnect(c)
                    ? t("The fingerprints match; it is safe to connect.")
                    : t(
                        "Compare the two fingerprints again, to the last character.",
                      )}
              </p>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
