"use client";

import { useState } from "react";
import { Radar, ShieldCheck, Skull } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/traffic/curriculum";
import {
  CAPTURE,
  decodeBasic,
  filterSolved,
  gaps,
  HOSTS,
  isBeacon,
  parseFilter,
  PASSWORD,
  STREAM,
  type FilterError,
} from "@/lib/traffic/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./traffic.css";

// Academy Intermediate · Traffic analysis: display filters over a capture,
// a password in a plain-HTTP stream and a beaconing host.
export function Traffic() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("NETWORK SECURITY · MODULE 2")}
      title={t("Traffic analysis.")}
      subtitle={t("Every packet is a clue.")}
      description={t(
        "Read a capture line by line, write Wireshark display filters that pick out a port scan, pull a password out of a plain-HTTP stream, and find the infected host by its regular check-ins.",
      )}
      badge={t("PCAP / LAB")}
      icon={<Radar size={22} />}
      checkpoints={["traffic-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "filter":
            return <FilterWidget {...props} />;
          case "stream":
            return <StreamWidget {...props} />;
          case "beacon":
            return <BeaconWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

function FilterProblem({ error }: { error: FilterError }) {
  const { t } = useT();
  const name = error.name ?? "";
  switch (error.code) {
    case "char":
      return <>{t("Unexpected character “{name}”", { name })}</>;
    case "unfinished":
      return <>{t("The filter is not finished")}</>;
    case "paren":
      return <>{t("A “)” is missing")}</>;
    case "field":
      return <>{t("A field name was expected here")}</>;
    case "value":
      return <>{t("A value was expected after the operator")}</>;
    case "unknown":
      return <>{t("Unknown field “{name}”", { name })}</>;
    case "end":
      return <>{t("Unexpected text at the end; join with && or ||")}</>;
  }
}

/** A Wireshark-style filter bar over the recorded capture. */
function FilterWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [filter, setFilter] = useState("");
  const parsed = parseFilter(filter);
  const rows = parsed.ok ? CAPTURE.filter(parsed.match) : CAPTURE;
  const solved = filterSolved(filter);
  return (
    <div className="nl-card cb-card">
      <label className="cb-field">
        {t("Display filter")}
        <input
          className={`tr-filter${filter.trim() ? (parsed.ok ? " ok" : " bad") : ""}`}
          value={filter}
          maxLength={200}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          placeholder="ip.src == 10.0.0.66"
          onChange={(e) => {
            setFilter(e.target.value);
            onSolved(filterSolved(e.target.value));
          }}
        />
      </label>
      <p className={`cb-out${solved ? " ok" : ""}`} aria-live="polite">
        {parsed.ok ? (
          solved ? (
            t("Exactly the scanner’s SYNs: ports 21, 22, 23 and 80.")
          ) : (
            t("Displayed: {shown} of {total}", {
              shown: rows.length,
              total: CAPTURE.length,
            })
          )
        ) : (
          <FilterProblem error={parsed.error} />
        )}
      </p>
      <div
        className="tr-scroll"
        tabIndex={0}
        role="region"
        aria-label={t("Packet list")}
      >
        <table className="ui-cases tr-packets">
          <thead>
            <tr>
              <th scope="col">{t("No.")}</th>
              <th scope="col">{t("Time (s)")}</th>
              <th scope="col">{t("Source")}</th>
              <th scope="col">{t("Destination")}</th>
              <th scope="col">{t("Protocol")}</th>
              <th scope="col">{t("Info")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.no}>
                <td>{p.no}</td>
                <td>{p.time}</td>
                <td>
                  <code>{p.src}</code>
                </td>
                <td>
                  <code>{p.dst}</code>
                </td>
                <td>{(p.app ?? p.proto).toUpperCase()}</td>
                <td>
                  <code>
                    {p.sport !== undefined && `${p.sport} → ${p.dport} `}
                    {p.info}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Follow the stream, decode the Base64, type the password. */
function StreamWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [encoded, setEncoded] = useState("");
  const [password, setPassword] = useState("");
  const decoded = encoded.trim() ? decodeBasic(encoded) : null;
  const right = password === PASSWORD;
  return (
    <div className="nl-card cb-card">
      <button
        type="button"
        className="nl-primary"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {t("Follow TCP stream")} (10.0.0.7 ⇄ 10.0.0.1:80)
      </button>
      {open && (
        <pre className="al-code tr-stream" tabIndex={0}>
          {STREAM.map((line, i) => (
            <span key={i} className={`al-line${i < 4 ? " tr-out" : " tr-in"}`}>
              {line}
              {"\n"}
            </span>
          ))}
        </pre>
      )}
      <div className="cb-grid">
        <label className="cb-field">
          {t("Base64 decoder")}
          <input
            value={encoded}
            maxLength={200}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            onChange={(e) => setEncoded(e.target.value)}
          />
        </label>
        <label className="cb-field">
          {t("The password")}
          <input
            value={password}
            maxLength={60}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            onChange={(e) => {
              setPassword(e.target.value);
              onSolved(e.target.value === PASSWORD);
            }}
          />
        </label>
      </div>
      <p className="cb-out" aria-live="polite">
        {encoded.trim()
          ? decoded
            ? t("Decoded: {user}:{password}", decoded)
            : t("This is not Basic credentials in Base64.")
          : t("Paste the text after “Basic ” to decode it.")}
      </p>
      {right && (
        <p className="nl-fail">
          <Skull size={15} aria-hidden="true" />{" "}
          {t(
            "Anyone on the network has the router’s admin password. Serve the panel over HTTPS only.",
          )}
        </p>
      )}
    </div>
  );
}

const WINDOW = 600;

/** Ten minutes of outbound connections per host; pick the beacon. */
function BeaconWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [picked, setPicked] = useState<string | null>(null);
  const host = HOSTS.find((h) => h.id === picked);
  return (
    <div className="nl-card cb-card">
      <fieldset className="tr-hosts">
        <legend>{t("Outbound connections over ten minutes")}</legend>
        {HOSTS.map((h) => (
          <label
            key={h.id}
            className={`tr-host${picked === h.id ? " on" : ""}`}
          >
            <input
              type="radio"
              name="tr-host"
              checked={picked === h.id}
              onChange={() => {
                setPicked(h.id);
                onSolved(isBeacon(h));
              }}
            />
            <span className="tr-host-name">
              <code>{h.name}</code>
              <small>
                → {h.dst} ·{" "}
                {t("{count} connections", { count: h.times.length })}
              </small>
            </span>
            <span className="tr-line" aria-hidden="true">
              {h.times.map((s, i) => (
                <i key={i} style={{ left: `${(s / WINDOW) * 100}%` }} />
              ))}
            </span>
          </label>
        ))}
      </fieldset>
      {host && (
        <div
          aria-live="polite"
          className={`ac-reply ${isBeacon(host) ? "ok" : "bad"}`}
        >
          <strong>
            {t("Gaps in seconds: {gaps}", {
              gaps: gaps(host.times).join(", "),
            })}
          </strong>
          {isBeacon(host) ? (
            <p className="nl-pass">
              <ShieldCheck size={15} aria-hidden="true" />{" "}
              {t(
                "Every 60 seconds to an IP nobody knows: a beacon. The host is isolated for investigation.",
              )}
            </p>
          ) : (
            <p className="nl-fail">
              <Skull size={15} aria-hidden="true" />{" "}
              {t(
                "Irregular, or too few connections to say. A person or an update, not a metronome; the beacon keeps calling home.",
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
