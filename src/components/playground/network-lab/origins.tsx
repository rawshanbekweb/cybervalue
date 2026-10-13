"use client";

// Lessons 9–11: where addresses come from. DHCP hands them out, DNS turns a
// site's name into one, and NAT hides a home behind one public address.
import { useId, useState, type FormEvent } from "react";
import {
  Cctv,
  Gamepad2,
  Globe,
  Laptop,
  Lock,
  Printer,
  RotateCcw,
  Router,
  Server,
  Smartphone,
  Tablet,
  Trash2,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { fill, PRINTER_IP, ROUTER_IP } from "@/lib/network/sim";
import {
  allConnected,
  connect,
  DEVICES,
  LAN,
  poolAddresses,
  poolProblem,
  type ConnectResult,
  type DhcpConfig,
  type Leases,
} from "@/lib/network/dhcp";
import {
  imitates,
  remember,
  resolve,
  RESOLVER_IP,
  SUGGESTED,
  type CacheEntry,
  type DnsNode,
  type Resolution,
} from "@/lib/network/dns";
import {
  HOME,
  PUBLIC_IP,
  record,
  SITE,
  visit,
  type NatEntry,
  type Visit,
} from "@/lib/network/nat";
import type { Text } from "@/lib/network/ip";
import { useT } from "./use-t";

const ICONS: Record<string, LucideIcon> = {
  laptop: Laptop,
  phone: Smartphone,
  tv: Tv,
  tablet: Tablet,
  console: Gamepad2,
  camera: Cctv,
};

// Lesson 9: devices join the network and lease addresses from the router.
export function DhcpWidget({
  start,
  onSolved,
}: {
  start: DhcpConfig;
  onSolved: (solved: boolean) => void;
}) {
  const { t, text, locale } = useT();
  const [config, setConfig] = useState(start);
  const [leases, setLeases] = useState<Leases>({});
  const [last, setLast] = useState<{
    device: string;
    result: ConnectResult;
  } | null>(null);
  const update = (nextConfig: DhcpConfig, nextLeases: Leases) => {
    setConfig(nextConfig);
    setLeases(nextLeases);
    onSolved(allConnected(nextConfig, nextLeases));
  };
  const problem = poolProblem(config);
  const pool = poolAddresses(config);
  const owner = (ip: string) =>
    DEVICES.find((d) => leases[d.id] === ip) ?? null;
  const join = (id: string) => {
    const device = DEVICES.find((d) => d.id === id)!;
    const result = connect(device, config, leases);
    setLast({ device: id, result });
    const next = { ...leases };
    if (result.ip) next[id] = result.ip;
    update(config, next);
  };
  const leave = (id: string) => {
    const next = { ...leases };
    delete next[id];
    setLast(null);
    update(config, next);
  };
  const setPool = (key: "start" | "end", value: string) =>
    update({ ...config, [key]: Number(value) }, leases);
  return (
    <div className="nl-card">
      <div className="nl-router-panel">
        <div className="nl-router-head">
          <Router size={20} aria-hidden="true" />
          <strong>Router · DHCP server</strong>
          <code>{ROUTER_IP}</code>
        </div>
        <label className="nl-switch">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) =>
              update({ ...config, enabled: e.target.checked }, leases)
            }
          />
          <span>{t("DHCP server yoqilgan", "DHCP server on")}</span>
        </label>
        <div className="nl-pool-inputs">
          <span>{t("Hovuz (pool):", "Pool:")}</span>
          <label>
            <span className="nl-visually-hidden">
              {t("Hovuz boshi", "Pool start")}
            </span>
            <code>{LAN}</code>
            <input
              type="number"
              min={2}
              max={254}
              value={config.start}
              onChange={(e) => setPool("start", e.target.value)}
            />
          </label>
          <span>—</span>
          <label>
            <span className="nl-visually-hidden">
              {t("Hovuz oxiri", "Pool end")}
            </span>
            <code>{LAN}</code>
            <input
              type="number"
              min={2}
              max={254}
              value={config.end}
              onChange={(e) => setPool("end", e.target.value)}
            />
          </label>
        </div>
        {problem ? (
          <p className="nl-fail" role="status">
            {text(problem)}
          </p>
        ) : (
          pool.length <= 40 && (
            <ul
              className="nl-pool"
              aria-label={t("Hovuzdagi manzillar", "Addresses in the pool")}
            >
              {pool.map((ip) => {
                const holder = owner(ip);
                return (
                  <li key={ip} className={holder ? "used" : ""}>
                    <code>.{ip.split(".")[3]}</code>
                    <span>
                      {holder ? text(holder.name) : t("bo‘sh", "free")}
                    </span>
                  </li>
                );
              })}
            </ul>
          )
        )}
      </div>
      <ul className="nl-devices-grid">
        {DEVICES.map((device) => {
          const Icon = ICONS[device.id];
          const ip = leases[device.id];
          const apipa = ip?.startsWith("169.254.");
          return (
            <li
              key={device.id}
              className={`${ip ? (apipa ? "apipa" : "online") : ""} ${last?.device === device.id ? "active" : ""}`}
            >
              <Icon size={22} aria-hidden="true" />
              <strong>{text(device.name)}</strong>
              <code className="nl-mac">{device.mac}</code>
              <code className="nl-device-ip">
                {ip ?? t("IP yo‘q", "no IP")}
              </code>
              {ip ? (
                <button className="nl-ghost" onClick={() => leave(device.id)}>
                  {t("Uzish", "Disconnect")}
                </button>
              ) : (
                <button
                  className="nl-primary"
                  onClick={() => join(device.id)}
                  aria-label={`${t("Ulash", "Connect")}: ${text(device.name)}`}
                >
                  {t("Ulash", "Connect")}
                </button>
              )}
            </li>
          );
        })}
        <li className="online static">
          <Printer size={22} aria-hidden="true" />
          <strong>{t("Printer", "Printer")}</strong>
          <code className="nl-mac">{t("statik manzil", "static address")}</code>
          <code className="nl-device-ip">{PRINTER_IP}</code>
        </li>
      </ul>
      <div aria-live="polite">
        {last && (
          <div className="nl-exchange" key={JSON.stringify(last)}>
            <p className="nl-row-label">
              {text(DEVICES.find((d) => d.id === last.device)!.name)} ·{" "}
              {t("DHCP almashinuvi", "DHCP exchange")}
            </p>
            <ol>
              {last.result.messages.map((message, i) => (
                <li
                  key={i}
                  className={`nl-msg nl-msg-${message.name.toLowerCase()}`}
                  style={{ animationDelay: `${i * 0.35}s` }}
                >
                  <span className="nl-msg-name">{message.name}</span>
                  <code>
                    {message.from} → {message.to}
                  </code>
                  <span>{fill(message, locale)}</span>
                </li>
              ))}
            </ol>
            <p
              className={
                last.result.ip && last.result.kind !== "apipa"
                  ? "nl-pass"
                  : "nl-fail"
              }
            >
              {fill(last.result.note, locale)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const DNS_NODES: { id: DnsNode; label: Text; detail: string }[] = [
  {
    id: "browser",
    label: { uz: "Kompyuter", en: "Computer" },
    detail: "cache",
  },
  {
    id: "resolver",
    label: { uz: "Resolver", en: "Resolver" },
    detail: RESOLVER_IP,
  },
  { id: "root", label: { uz: "Root", en: "Root" }, detail: "." },
  { id: "tld", label: { uz: "TLD", en: "TLD" }, detail: ".example" },
  {
    id: "authoritative",
    label: { uz: "Avtoritativ", en: "Authoritative" },
    detail: "ns1",
  },
  { id: "site", label: { uz: "Sayt", en: "Site" }, detail: ":443" },
];

// Lesson 10: type a name, watch the lookup chain, then read the page's IP.
export function DnsWidget({
  ask,
  onSolved,
}: {
  ask: string[];
  onSolved: (solved: boolean) => void;
}) {
  const { t, text, locale } = useT();
  const addressId = useId();
  const [address, setAddress] = useState("kutubxona.example");
  const [cache, setCache] = useState<CacheEntry[]>([]);
  const [result, setResult] = useState<Resolution | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const expected = Object.fromEntries(
    ask.map((name) => [name, resolve(name, []).ip]),
  );
  const open = (name: string) => {
    setAddress(name);
    const next = resolve(name, cache);
    setResult(next);
    setCache(remember(cache, next));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    open(address);
  };
  const answer = (name: string, value: string) => {
    const next = { ...answers, [name]: value };
    setAnswers(next);
    onSolved(ask.every((n) => next[n]?.trim() === expected[n]));
  };
  const reached = new Set(result?.steps.map((s) => s.node));
  const stop = result && !result.ip ? result.steps.at(-1)?.node : null;
  const fake = result?.ip ? imitates(result.name) : null;
  return (
    <div className="nl-card">
      <form className="nl-browser" onSubmit={submit}>
        <span className="nl-browser-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <label htmlFor={addressId} className="nl-visually-hidden">
          {t("Sayt manzili", "Site address")}
        </label>
        <input
          id={addressId}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
        <button className="nl-primary" type="submit">
          {t("Ochish", "Open")}
        </button>
      </form>
      <div className="nl-chips">
        {SUGGESTED.map((name) => (
          <button key={name} className="nl-ghost" onClick={() => open(name)}>
            {name}
          </button>
        ))}
      </div>
      <ol
        className="nl-chain"
        aria-label={t("DNS so‘rovi yo‘li", "Path of the DNS lookup")}
      >
        {DNS_NODES.map((node) => (
          <li
            key={node.id}
            className={
              node.id === stop
                ? "stop"
                : reached.has(node.id)
                  ? result?.ip
                    ? "ok"
                    : "reached"
                  : ""
            }
          >
            <strong>{text(node.label)}</strong>
            <code>
              {node.id === "site" && result?.ip
                ? result.ip
                : node.id === "authoritative" && result?.owner
                  ? `ns1.${result.owner}`
                  : node.detail}
            </code>
          </li>
        ))}
      </ol>
      <div aria-live="polite">
        {result && (
          <>
            <ol className="nl-steps" key={JSON.stringify(result)}>
              {result.steps.map((step, i) => (
                <li key={i} style={{ animationDelay: `${i * 0.3}s` }}>
                  {fill(step, locale)}
                </li>
              ))}
            </ol>
            {result.ip && (
              <div className={`nl-page ${fake ? "fake" : ""}`}>
                <p className="nl-page-bar">
                  <Lock size={13} aria-hidden="true" /> {result.name}
                </p>
                <div>
                  <Globe size={28} aria-hidden="true" />
                  <div>
                    <strong>
                      IP: <code>{result.ip}</code>
                      {result.fromCache && (
                        <span className="nl-tag">
                          {t("keshdan", "from cache")}
                        </span>
                      )}
                    </strong>
                    {result.owner && (
                      <p>
                        {t("Domen egasi:", "Domain owner:")}{" "}
                        <code>{result.owner}</code>
                      </p>
                    )}
                    {fake && (
                      <p className="nl-fail">
                        {t(
                          `Ehtiyot bo‘ling: nom ${fake} bilan boshlansa ham, sayt ${result.owner} egasiga tegishli va boshqa serverda.`,
                          `Careful: although the name starts with ${fake}, the site belongs to ${result.owner} and lives on another server.`,
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="nl-cache">
        <p className="nl-row-label">
          {t("Kompyuter DNS keshi", "Computer DNS cache")}
        </p>
        {cache.length ? (
          <table>
            <thead>
              <tr>
                <th>{t("Nom", "Name")}</th>
                <th>IP</th>
                <th>TTL</th>
              </tr>
            </thead>
            <tbody>
              {cache.map((entry) => (
                <tr key={entry.name}>
                  <td>{entry.name}</td>
                  <td>{entry.ip}</td>
                  <td>{entry.ttl}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="nl-caption">
            {t("Kesh bo‘sh.", "The cache is empty.")}
          </p>
        )}
        <button
          className="nl-ghost"
          onClick={() => {
            setCache([]);
            setResult(null);
          }}
        >
          <Trash2 size={14} /> ipconfig /flushdns
        </button>
      </div>
      <fieldset className="nl-answers">
        <legend>{t("Javobingiz", "Your answer")}</legend>
        {ask.map((name) => (
          <label className="nl-field" key={name}>
            <span>
              <code>{name}</code> — IP
            </span>
            <input
              value={answers[name] ?? ""}
              onChange={(e) => answer(name, e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
        ))}
      </fieldset>
    </div>
  );
}

// Lesson 11: devices at home open a site through the router's NAT.
export function NatWidget({
  options,
  answer,
  onSolved,
}: {
  options: Text[];
  answer: number;
  onSolved: (solved: boolean) => void;
}) {
  const { t, text, locale } = useT();
  const name = useId();
  const [table, setTable] = useState<NatEntry[]>([]);
  const [log, setLog] = useState<{ device: string; from: string }[]>([]);
  const [last, setLast] = useState<Visit | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const report = (nextTable: NatEntry[], nextChoice: number | null) =>
    onSolved(nextChoice === answer && nextTable.length >= 2);
  const go = (id: string) => {
    const device = HOME.find((d) => d.id === id)!;
    const v = visit(device, table);
    const next = record(table, v);
    setLast(v);
    setTable(next);
    setLog([...log, { device: id, from: v.after.src }].slice(-6));
    report(next, choice);
  };
  return (
    <div className="nl-card">
      <div className="nl-nat">
        <section aria-label={t("Uy tarmog‘i", "Home network")}>
          <p className="nl-row-label">{t("Uy (private)", "Home (private)")}</p>
          <div className="nl-home">
            {HOME.map((device) => {
              const Icon = ICONS[device.id];
              return (
                <div
                  key={device.id}
                  className={`nl-home-device ${last?.entry.device === device.id ? "active" : ""}`}
                >
                  <Icon size={20} aria-hidden="true" />
                  <div>
                    <strong>{text(device.name)}</strong>
                    <code>{device.ip}</code>
                  </div>
                  <button
                    className="nl-primary"
                    onClick={() => go(device.id)}
                    aria-label={`${text(device.name)}: ${t("saytni ochish", "open the site")}`}
                  >
                    {t("Saytni ochish", "Open site")}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
        <section
          className="nl-nat-router"
          aria-label={t("Router va NAT jadvali", "Router and NAT table")}
        >
          <p className="nl-row-label">Router · NAT</p>
          <p className="nl-public">
            <Router size={18} aria-hidden="true" />
            {t("Public IP", "Public IP")} <code>{PUBLIC_IP}</code>
          </p>
          <table>
            <thead>
              <tr>
                <th>{t("Ichkarida", "Inside")}</th>
                <th>{t("Tashqarida", "Outside")}</th>
              </tr>
            </thead>
            <tbody>
              {table.length ? (
                table.map((entry) => (
                  <tr
                    key={entry.inside}
                    className={
                      last?.entry.inside === entry.inside ? "active" : ""
                    }
                  >
                    <td>{entry.inside}</td>
                    <td>{entry.outside}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2}>{t("Jadval bo‘sh", "Table is empty")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
        <section aria-label={t("Sayt serveri", "Site server")}>
          <p className="nl-row-label">
            {t("Internet: sayt", "Internet: site")}
          </p>
          <p className="nl-public">
            <Server size={18} aria-hidden="true" />
            {SITE.name} <code>{SITE.ip}</code>
          </p>
          <table>
            <thead>
              <tr>
                <th>{t("Sayt jurnali · kimdan", "Site log · from")}</th>
              </tr>
            </thead>
            <tbody>
              {log.length ? (
                log.map((entry, i) => (
                  <tr key={i}>
                    <td>{entry.from}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>{t("Hali tashrif yo‘q", "No visits yet")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
      <div aria-live="polite">
        {last && (
          <div className="nl-packets" key={JSON.stringify(last) + log.length}>
            <div>
              <span>{t("Router oldidan", "Before the router")}</span>
              <code>
                {last.before.src} → {last.before.dst}
              </code>
            </div>
            <div className="after">
              <span>{t("Routerdan keyin", "After the router")}</span>
              <code>
                {last.after.src} → {last.after.dst}
              </code>
            </div>
            <ol className="nl-steps">
              {last.steps.map((step, i) => (
                <li key={i} style={{ animationDelay: `${i * 0.3}s` }}>
                  {fill(step, locale)}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      <fieldset className="nl-quiz">
        <legend>
          {t(
            "Sayt uydagi qurilmalarni qanday IP bilan ko‘radi?",
            "Which IP does the site see for the devices at home?",
          )}
        </legend>
        {options.map((option, i) => (
          <label key={i}>
            <input
              type="radio"
              name={name}
              checked={choice === i}
              onChange={() => {
                setChoice(i);
                report(table, i);
              }}
            />
            {text(option)}
          </label>
        ))}
      </fieldset>
      <button
        className="nl-ghost"
        onClick={() => {
          setTable([]);
          setLog([]);
          setLast(null);
          report([], choice);
        }}
      >
        <RotateCcw size={14} /> {t("Boshidan", "Reset")}
      </button>
    </div>
  );
}
