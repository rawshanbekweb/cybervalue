"use client";

import { useState } from "react";
import { Network, ShieldCheck, Skull } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/tcpip/curriculum";
import {
  BLANKS,
  blankRight,
  CLIENT_ISN,
  dnsSafe,
  FORGED,
  poisonOdds,
  REQUEST_BYTES,
  SERVER_ISN,
  type Blank,
  type DnsSetup,
} from "@/lib/tcpip/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./tcpip.css";

// Academy Intermediate · TCP/IP in depth: handshake numbers, port scans and
// DNS cache poisoning.
export function TcpIp() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("NETWORK SECURITY · MODULE 1")}
      title={t("TCP/IP in depth.")}
      subtitle={t("Read the packets the way attackers do.")}
      description={t(
        "Work out the sequence and acknowledgement numbers of a TCP handshake, read a port scan, see how ICMP and SYN floods work, and push the odds of poisoning a DNS cache below one in a thousand.",
      )}
      badge={t("TCP / LAB")}
      icon={<Network size={22} />}
      checkpoints={["tcpip-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "handshake":
            return <HandshakeWidget {...props} />;
          case "dns":
            return <DnsWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Fill in the ack and seq numbers of a handshake and its first data. */
function HandshakeWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [values, setValues] = useState<Record<Blank, string>>({
    synAckAck: "",
    ackSeq: "",
    ackAck: "",
    dataAck: "",
  });
  const set = (b: Blank, v: string) => {
    const next = { ...values, [b]: v.replace(/\D/g, "").slice(0, 6) };
    setValues(next);
    onSolved(BLANKS.every((k) => blankRight(k, next[k])));
  };
  const blank = (b: Blank, label: string) => (
    <input
      className={`tc-blank${values[b] ? (blankRight(b, values[b]) ? " ok" : " bad") : ""}`}
      inputMode="numeric"
      aria-label={label}
      value={values[b]}
      onChange={(e) => set(b, e.target.value)}
    />
  );
  return (
    <div className="nl-card cb-card">
      <ol className="tc-flow">
        <li>
          <span className="tc-dir">{t("client → server")}</span>
          <code>SYN seq={CLIENT_ISN}</code>
        </li>
        <li>
          <span className="tc-dir">{t("server → client")}</span>
          <code>
            SYN-ACK seq={SERVER_ISN} ack=
            {blank("synAckAck", t("ack in the SYN-ACK"))}
          </code>
        </li>
        <li>
          <span className="tc-dir">{t("client → server")}</span>
          <code>
            ACK seq={blank("ackSeq", t("seq in the ACK"))} ack=
            {blank("ackAck", t("ack in the ACK"))}
          </code>
        </li>
        <li>
          <span className="tc-dir">{t("client → server")}</span>
          <code>
            {t("data")} seq={CLIENT_ISN + 1} len={REQUEST_BYTES} “GET / …”
          </code>
        </li>
        <li>
          <span className="tc-dir">{t("server → client")}</span>
          <code>ACK ack={blank("dataAck", t("ack after the data"))}</code>
        </li>
      </ol>
      <p className="cb-out" aria-live="polite">
        {BLANKS.every((k) => blankRight(k, values[k]))
          ? t("Connection set up and the first 100 bytes acknowledged.")
          : t("A wrong number would make the other side drop the packet.")}
      </p>
    </div>
  );
}

/** Forged answers against a resolver, with and without defences. */
function DnsWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [setup, setSetup] = useState<DnsSetup>({
    forged: FORGED[1],
    randomPort: false,
    dnssec: false,
  });
  const change = (next: DnsSetup) => {
    setSetup(next);
    onSolved(dnsSafe(next));
  };
  const odds = poisonOdds(setup);
  const percent =
    odds === 0
      ? "0"
      : odds >= 0.01
        ? (odds * 100).toFixed(1)
        : (odds * 100).toPrecision(2);
  return (
    <div className="nl-card cb-card">
      <fieldset className="br-modes">
        <legend>{t("Forged answers the attacker gets in first")}</legend>
        {FORGED.map((n) => (
          <label
            key={n}
            className={`br-mode${setup.forged === n ? " on" : ""}`}
          >
            <input
              type="radio"
              name="tc-forged"
              checked={setup.forged === n}
              onChange={() => change({ ...setup, forged: n })}
            />
            {n.toLocaleString("en").replace(/,/g, " ")}
          </label>
        ))}
      </fieldset>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={setup.randomPort}
          onChange={(e) => change({ ...setup, randomPort: e.target.checked })}
        />
        {t("Send each query from a random source port")}
      </label>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={setup.dnssec}
          onChange={(e) => change({ ...setup, dnssec: e.target.checked })}
        />
        {t("Check DNSSEC signatures")}
      </label>
      <div
        aria-live="polite"
        className={`ac-reply ${odds >= 0.001 ? "bad" : "ok"}`}
      >
        <strong>
          {t("Chance this race poisons the cache: {percent}%", { percent })}
        </strong>
        {setup.dnssec ? (
          <p className="nl-pass">
            <ShieldCheck size={15} aria-hidden="true" />{" "}
            {t("Forged answers carry no valid signature and are refused.")}
          </p>
        ) : odds >= 0.001 ? (
          <p className="nl-fail">
            <Skull size={15} aria-hidden="true" />{" "}
            {t(
              "Only the 16-bit ID stands in the way; bank.uz may point to the attacker for everyone.",
            )}
          </p>
        ) : (
          <p className="nl-pass">
            <ShieldCheck size={15} aria-hidden="true" />{" "}
            {t(
              "The ID and the port must both be guessed: about 1.8 billion combinations.",
            )}
          </p>
        )}
      </div>
    </div>
  );
}
