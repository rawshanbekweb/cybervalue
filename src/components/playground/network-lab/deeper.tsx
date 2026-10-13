"use client";

// Lessons 12–15: subnetting, traceroute, ports and IPv6.
import { useId, useState } from "react";
import { Check, Flame, Send, ShieldCheck, X } from "lucide-react";
import { fill } from "@/lib/network/sim";
import { formatIp, parseIp } from "@/lib/network/ip";
import {
  DESTINATION,
  MAX_TTL,
  probe,
  ROUTE,
  slowestLink,
  type Probe,
} from "@/lib/network/traceroute";
import {
  attempt,
  SERVER_IP,
  SERVICES,
  type Attempt,
  type PortState,
} from "@/lib/network/ports";
import {
  compress,
  expand,
  isCanonical,
  parseIpv6,
  review,
  type Check as Ipv6Check,
} from "@/lib/network/ipv6";
import { useT } from "./use-t";

const Mark = ({ ok }: { ok: boolean }) =>
  ok ? (
    <Check size={15} className="nl-mark-ok" aria-hidden="true" />
  ) : (
    <X size={15} className="nl-mark-bad" aria-hidden="true" />
  );

// Lesson 12: split a /24 among departments.
export function SubnettingWidget({
  base,
  departments,
  hosts,
  ask,
  onSolved,
}: {
  base: string;
  departments: number;
  hosts: number;
  ask: number;
  onSolved: (solved: boolean) => void;
}) {
  const { t } = useT();
  const sliderId = useId();
  const [prefix, setPrefix] = useState(24);
  const [answer, setAnswer] = useState("");
  const start = parseIp(base)!;
  const size = 2 ** (32 - prefix);
  const blocks = 2 ** (prefix - 24);
  const room = size - 2;
  const enoughSubnets = blocks >= departments;
  const enoughRoom = room >= hosts;
  const fits = (p: number) =>
    2 ** (p - 24) >= departments && 2 ** (32 - p) - 2 >= hosts;
  const expected = (p: number) => formatIp(start + (ask - 1) * 2 ** (32 - p));
  const report = (p: number, value: string) =>
    onSolved(fits(p) && value.trim() === expected(p));
  return (
    <div className="nl-card">
      <p className="nl-goal">
        {t(
          `${base}/24 tarmog‘ini ${departments} ta bo‘limga bo‘ling. Har bir bo‘limda ${hosts} ta kompyuter bor.`,
          `Split ${base}/24 among ${departments} departments with ${hosts} computers each.`,
        )}
      </p>
      <label htmlFor={sliderId} className="nl-slider-label">
        {t("Yangi mask", "New mask")} <strong>/{prefix}</strong>
      </label>
      <input
        id={sliderId}
        type="range"
        min={24}
        max={30}
        value={prefix}
        onChange={(e) => {
          const next = Number(e.target.value);
          setPrefix(next);
          report(next, answer);
        }}
      />
      <div
        className="nl-subnets"
        role="img"
        aria-label={t(
          `${blocks} ta bo‘lak, har biri ${size} ta manzil`,
          `${blocks} subnets of ${size} addresses each`,
        )}
      >
        {Array.from({ length: blocks }, (_, i) => (
          <span
            key={i}
            className={`${i < departments ? "used" : ""} ${i === ask - 1 ? "asked" : ""}`}
          >
            {blocks <= 16 && (
              <>
                <b>{i < departments ? `${i + 1}` : "·"}</b>
                <code>.{(start + i * size) % 256}</code>
              </>
            )}
          </span>
        ))}
      </div>
      <ul className="nl-checks">
        <li>
          <Mark ok={enoughSubnets} />
          {t(
            `Bo‘laklar: ${blocks} ta (kerak: ${departments})`,
            `Subnets: ${blocks} (needed: ${departments})`,
          )}
        </li>
        <li>
          <Mark ok={enoughRoom} />
          {t(
            `Har bir bo‘lakda joy: ${room} ta (kerak: ${hosts})`,
            `Room in each: ${room} (needed: ${hosts})`,
          )}
        </li>
      </ul>
      <label className="nl-field">
        <span>
          {t(
            `${ask}-bo‘limning tarmoq manzili`,
            `Network address of department ${ask}`,
          )}
        </span>
        <input
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            report(prefix, e.target.value);
          }}
          spellCheck={false}
          autoComplete="off"
        />
      </label>
    </div>
  );
}

// Lesson 13: send probes with a chosen TTL, then read a full trace.
export function TracerouteWidget({
  onSolved,
}: {
  onSolved: (solved: boolean) => void;
}) {
  const { t, text, locale } = useT();
  const ttlId = useId();
  const [ttl, setTtl] = useState(1);
  const [last, setLast] = useState<Probe | null>(null);
  // Bumped on every send so the steps animate again for the same TTL.
  const [sent, setSent] = useState(0);
  const [traced, setTraced] = useState(false);
  const [answers, setAnswers] = useState({ ttl3: "", slow: "" });
  const expected = { ttl3: ROUTE[2].ip, slow: ROUTE[slowestLink()].ip };
  const answer = (key: keyof typeof answers, value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    onSolved(next.ttl3 === expected.ttl3 && next.slow === expected.slow);
  };
  return (
    <div className="nl-card">
      <ol
        className="nl-route"
        aria-label={t("Saytgacha yo‘l", "Path to the site")}
      >
        <li className="nl-route-me">
          <strong>{t("Siz", "You")}</strong>
          <code>192.168.1.10</code>
        </li>
        {ROUTE.map((hop, i) => {
          const state = !last
            ? ""
            : i < last.hop
              ? "passed"
              : i === last.hop
                ? last.reached
                  ? "reached"
                  : "expired"
                : "";
          return (
            <li key={hop.ip} className={state}>
              <strong>{text(hop.name)}</strong>
              <code>{hop.ip}</code>
              {last && i <= last.hop && (
                <small>
                  TTL {last.ttl - i} → {last.ttl - i - 1}
                </small>
              )}
            </li>
          );
        })}
      </ol>
      <div className="nl-actions">
        <label htmlFor={ttlId} className="nl-ttl">
          TTL
          <input
            id={ttlId}
            type="number"
            min={1}
            max={MAX_TTL}
            value={ttl}
            onChange={(e) =>
              setTtl(
                Math.min(MAX_TTL, Math.max(1, Number(e.target.value) || 1)),
              )
            }
          />
        </label>
        <button
          className="nl-primary"
          onClick={() => {
            setLast(probe(ttl));
            setSent(sent + 1);
          }}
        >
          <Send size={15} />
          {t("Paket yuborish", "Send packet")}
        </button>
        <button className="nl-ghost" onClick={() => setTraced(true)}>
          tracert {DESTINATION.name.en}
        </button>
      </div>
      <div aria-live="polite">
        {last && (
          <ol className="nl-steps" key={sent}>
            {last.steps.map((step, i) => (
              <li key={i} style={{ animationDelay: `${i * 0.25}s` }}>
                {fill(step, locale)}
              </li>
            ))}
          </ol>
        )}
      </div>
      {traced && (
        <pre className="nl-console">
          <span>C:\&gt; tracert kutubxona.example</span>
          {"\n\n"}
          {t(
            "kutubxona.example [203.0.113.10] ga yo‘l, ko‘pi bilan 30 ta hop:",
            "Tracing route to kutubxona.example [203.0.113.10] over a maximum of 30 hops:",
          )}
          {"\n\n"}
          {ROUTE.map(
            (hop, i) =>
              `${String(i + 1).padStart(3)}  ${hop.ms
                .map((ms) => `${String(ms).padStart(4)} ms`)
                .join(" ")}  ${hop.ip}\n`,
          ).join("")}
          {"\n"}
          {t("Iz tugadi.", "Trace complete.")}
        </pre>
      )}
      <fieldset className="nl-answers">
        <legend>{t("Javobingiz", "Your answer")}</legend>
        <label className="nl-field">
          <span>
            {t(
              "TTL=3 bilan yuborilgan paketga kim “time exceeded” qaytaradi?",
              "Who returns “time exceeded” for a packet sent with TTL 3?",
            )}
          </span>
          <select
            value={answers.ttl3}
            onChange={(e) => answer("ttl3", e.target.value)}
          >
            <option value="">{t("Tanlang…", "Choose…")}</option>
            {ROUTE.map((hop) => (
              <option key={hop.ip} value={hop.ip}>
                {hop.ip} — {text(hop.name)}
              </option>
            ))}
          </select>
        </label>
        <label className="nl-field">
          <span>
            {t(
              "Kechikish qaysi hopda keskin oshadi?",
              "At which hop does the delay jump?",
            )}
          </span>
          <select
            value={answers.slow}
            onChange={(e) => answer("slow", e.target.value)}
          >
            <option value="">{t("Tanlang…", "Choose…")}</option>
            {ROUTE.map((hop) => (
              <option key={hop.ip} value={hop.ip}>
                {hop.ip} — {text(hop.name)}
              </option>
            ))}
          </select>
        </label>
      </fieldset>
    </div>
  );
}

const STATE_LABEL: Record<PortState, [string, string]> = {
  open: ["ochiq", "open"],
  closed: ["yopiq", "closed"],
  filtered: ["filtrlangan", "filtered"],
};

// Lesson 14: knock on ports, name the services and close what should not
// face the internet.
export function PortsWidget({
  onSolved,
}: {
  onSolved: (solved: boolean) => void;
}) {
  const { t, text, locale } = useT();
  const [firewall, setFirewall] = useState(false);
  const [results, setResults] = useState<Record<number, Attempt>>({});
  const [last, setLast] = useState<Attempt | null>(null);
  const [names, setNames] = useState<Record<number, string>>({});
  const solved = (nextNames: Record<number, string>, nextFirewall: boolean) =>
    nextFirewall && SERVICES.every((s) => nextNames[s.port] === s.name);
  const knock = (port: number) => {
    const result = attempt(port, firewall);
    setResults({ ...results, [port]: result });
    setLast(result);
  };
  const exposedNow = SERVICES.filter(
    (s) => s.listening && (!firewall || s.public),
  );
  return (
    <div className="nl-card">
      <div className="nl-server">
        <p className="nl-public">
          <ShieldCheck size={18} aria-hidden="true" />
          {t("Server", "Server")} <code>{SERVER_IP}</code>
        </p>
        <label className="nl-switch">
          <input
            type="checkbox"
            checked={firewall}
            onChange={(e) => {
              setFirewall(e.target.checked);
              setResults({});
              setLast(null);
              onSolved(solved(names, e.target.checked));
            }}
          />
          <span>
            {t(
              "Firewall: tashqaridan faqat veb-portlar",
              "Firewall: only web ports from outside",
            )}
          </span>
        </label>
      </div>
      <ul className="nl-ports">
        {SERVICES.map((service) => {
          const result = results[service.port];
          return (
            <li key={service.port} className={result?.state ?? ""}>
              <code className="nl-port">{service.port}</code>
              <label>
                <span className="nl-visually-hidden">
                  {t(
                    `${service.port}-port xizmati`,
                    `Service on port ${service.port}`,
                  )}
                </span>
                <select
                  value={names[service.port] ?? ""}
                  onChange={(e) => {
                    const next = { ...names, [service.port]: e.target.value };
                    setNames(next);
                    onSolved(solved(next, firewall));
                  }}
                >
                  <option value="">{t("Xizmat…", "Service…")}</option>
                  {SERVICES.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} — {text(s.what)}
                    </option>
                  ))}
                </select>
              </label>
              <span className="nl-port-state">
                {result
                  ? t(...STATE_LABEL[result.state])
                  : t("tekshirilmagan", "not probed")}
              </span>
              <button
                className="nl-ghost"
                onClick={() => knock(service.port)}
                aria-label={t(
                  `${service.port}-portga ulanish`,
                  `Connect to port ${service.port}`,
                )}
              >
                <Send size={13} /> SYN
              </button>
            </li>
          );
        })}
      </ul>
      <div aria-live="polite">
        {last && (
          <ol className="nl-steps" key={`${last.port}-${last.state}`}>
            {last.steps.map((step, i) => (
              <li key={i} style={{ animationDelay: `${i * 0.3}s` }}>
                {fill(step, locale)}
              </li>
            ))}
          </ol>
        )}
      </div>
      <p className={firewall ? "nl-pass" : "nl-fail"}>
        {!firewall && <Flame size={15} aria-hidden="true" />}{" "}
        {t(
          "Internetdan ko‘rinadigan ochiq portlar:",
          "Open ports visible from the internet:",
        )}{" "}
        {exposedNow.map((s) => `${s.port} (${s.name})`).join(", ")}
        {!firewall &&
          ` — ${t("22 va 3306 tashqariga ochiq bo‘lmasligi kerak!", "22 and 3306 must not face the internet!")}`}
      </p>
    </div>
  );
}

const RULE_TEXT: Record<Ipv6Check["rule"], [string, string]> = {
  valid: ["To‘g‘ri IPv6 yozuvi", "Valid IPv6 notation"],
  same: ["Aynan shu manzil", "The same address"],
  zeros: ["Bosh nollar olib tashlangan", "Leading zeros dropped"],
  run: [
    "Eng uzun nol qatori “::” bilan, bir marta",
    "Longest zero run as “::”, once",
  ],
  case: ["Kichik harflar", "Lowercase"],
};

// Lesson 15: shorten an IPv6 address by the rules, with live feedback.
export function Ipv6Widget({
  address,
  onSolved,
}: {
  address: string;
  onSolved: (solved: boolean) => void;
}) {
  const { t } = useT();
  const inputId = useId();
  const [answer, setAnswer] = useState("");
  const groups = expand(parseIpv6(address)!).split(":");
  const parsed = parseIpv6(answer);
  const checks = answer.trim() ? review(address, answer) : [];
  return (
    <div className="nl-card">
      <p className="nl-row-label">{t("To‘liq manzil", "Full address")}</p>
      <p className="nl-v6" aria-label={address}>
        {groups.map((g, i) => (
          <span key={i} className={i < 4 ? "net" : "host"}>
            {g}
          </span>
        ))}
      </p>
      <p className="nl-legend">
        <span className="net">{t("tarmoq (64 bit)", "network (64 bits)")}</span>
        <span className="host">
          {t("qurilma (64 bit)", "interface (64 bits)")}
        </span>
      </p>
      <label className="nl-field" htmlFor={inputId}>
        <span>{t("Qisqa shakli", "Short form")}</span>
      </label>
      <input
        id={inputId}
        className="nl-v6-input"
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          onSolved(isCanonical(address, e.target.value));
        }}
        spellCheck={false}
        autoComplete="off"
        placeholder="2001:db8::…"
      />
      {checks.length > 0 && (
        <ul className="nl-checks">
          {checks.map((check) => (
            <li key={check.rule}>
              <Mark ok={check.ok} />
              {t(...RULE_TEXT[check.rule])}
            </li>
          ))}
        </ul>
      )}
      {parsed && (
        <p className="nl-caption">
          {t("Siz yozgan manzil to‘liq holda:", "Your address in full:")}{" "}
          <code>{expand(parsed)}</code>
        </p>
      )}
      {isCanonical(address, answer) && (
        <p className="nl-pass">
          {t("Kanonik shakl:", "Canonical form:")}{" "}
          <code>{compress(parseIpv6(address)!)}</code>
        </p>
      )}
    </div>
  );
}
