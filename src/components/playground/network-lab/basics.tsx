"use client";

// Lessons 1–4: bits, masks, address blocks and the AND test.

import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  classify,
  formatIp,
  KIND_LABEL,
  octets,
  parseCidr,
  parseIp,
  prefixForHosts,
  prefixToMask,
  sameSubnet,
  subnet,
} from "@/lib/network/ip";
import { useT } from "./use-t";

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

// Lesson 1: four octets of clickable bits.
export function BitsWidget({
  target,
  onSolved,
}: {
  target: string;
  onSolved: (solved: boolean) => void;
}) {
  const { t } = useT();
  const [values, setValues] = useState([0, 0, 0, 0]);
  const update = (next: number[]) => {
    setValues(next);
    onSolved(next.join(".") === target);
  };
  return (
    <div className="nl-card">
      <p className="nl-big-ip" aria-live="polite">
        {values.map((v, i) => (
          <span key={i}>
            {i > 0 && <i>.</i>}
            <b>{v}</b>
          </span>
        ))}
      </p>
      <p className="nl-caption">
        {t("Target:")} <code>{target}</code>
      </p>
      <div className="nl-octets">
        {values.map((value, o) => (
          <div className="nl-octet" key={o}>
            <span className="nl-octet-label">
              {t("Octet")} {o + 1} = <strong>{value}</strong>
            </span>
            <div className="nl-bits">
              {WEIGHTS.map((weight) => {
                const on = (value & weight) !== 0;
                return (
                  <button
                    key={weight}
                    className={on ? "on" : ""}
                    aria-pressed={on}
                    aria-label={`${t("Octet")} ${o + 1}, ${weight}`}
                    onClick={() =>
                      update(values.map((v, i) => (i === o ? v ^ weight : v)))
                    }
                  >
                    <small>{weight}</small>
                    {on ? 1 : 0}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button className="nl-ghost" onClick={() => update([0, 0, 0, 0])}>
        <RotateCcw size={14} /> {t("Clear")}
      </button>
    </div>
  );
}

// 32 cells: network bits in violet, host bits in amber.
export function BitStrip({
  ip,
  prefix,
  label,
}: {
  ip: number;
  prefix: number;
  label: string;
}) {
  const bits = octets(ip)
    .map((o) => o.toString(2).padStart(8, "0"))
    .join("");
  return (
    <div className="nl-strip" role="img" aria-label={label}>
      {Array.from(bits).map((bit, i) => (
        <span
          key={i}
          className={`${i < prefix ? "net" : "host"} ${i % 8 === 7 && i < 31 ? "gap" : ""}`}
        >
          {bit}
        </span>
      ))}
    </div>
  );
}

export function Legend() {
  const { t } = useT();
  return (
    <p className="nl-legend">
      <span className="net">{t("network part")}</span>
      <span className="host">{t("host part")}</span>
    </p>
  );
}

// Lesson 2: slide the prefix and watch the split move.
export function MaskWidget({
  ip,
  hosts,
  onSolved,
}: {
  ip: string;
  hosts: number;
  onSolved: (solved: boolean) => void;
}) {
  const { t } = useT();
  const sliderId = useId();
  const [prefix, setPrefix] = useState(24);
  const address = parseIp(ip)!;
  const s = subnet(address, prefix);
  const fits = s.hosts >= hosts;
  return (
    <div className="nl-card">
      <p className="nl-goal">
        {t(
          "The room has {hosts} devices. What is the smallest network that fits them all?",
          { hosts },
        )}
      </p>
      <label htmlFor={sliderId} className="nl-slider-label">
        {t("Mask length")} <strong>/{prefix}</strong>
      </label>
      <input
        id={sliderId}
        type="range"
        min={8}
        max={30}
        value={prefix}
        onChange={(e) => {
          const next = Number(e.target.value);
          setPrefix(next);
          onSolved(next === prefixForHosts(hosts));
        }}
      />
      <p className="nl-row-label">{t("Mask")}</p>
      <BitStrip
        ip={s.mask}
        prefix={prefix}
        label={`${t("Mask")} ${formatIp(s.mask)}`}
      />
      <p className="nl-row-label">
        IP <code>{ip}</code>
      </p>
      <BitStrip ip={address} prefix={prefix} label={`IP ${ip}`} />
      <Legend />
      <dl className="nl-facts">
        <div>
          <dt>{t("Mask")}</dt>
          <dd>{formatIp(s.mask)}</dd>
        </div>
        <div>
          <dt>{t("Host bits")}</dt>
          <dd>{32 - prefix}</dd>
        </div>
        <div>
          <dt>{t("Room for devices")}</dt>
          <dd>{s.hosts.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt>{t("Network")}</dt>
          <dd>
            {formatIp(s.network)}/{prefix}
          </dd>
        </div>
      </dl>
      <p className={fits ? "nl-pass" : "nl-fail"} aria-live="polite">
        {fits
          ? t("{hosts} computers fit ({hosts2} places).", {
              hosts,
              hosts2: s.hosts,
            })
          : t("{hosts} computers do not fit: only {hosts2} places.", {
              hosts,
              hosts2: s.hosts,
            })}
      </p>
    </div>
  );
}

// The block from network to broadcast, with the address marked.
export function RangeBar({ ip, prefix }: { ip: number; prefix: number }) {
  const { t } = useT();
  const s = subnet(ip, prefix);
  const position = s.size > 1 ? ((ip - s.network) / (s.size - 1)) * 100 : 0;
  const siblings =
    prefix >= 24 && prefix <= 30
      ? Array.from({ length: 256 / s.size }, (_, i) => i * s.size)
      : [];
  const base = s.network - (s.network % 256);
  return (
    <div className="nl-range">
      <div className="nl-range-bar">
        <span className="edge">{t("network")}</span>
        <span className="hosts">
          {t("hosts")} · {s.hosts.toLocaleString("en-US")}
        </span>
        <span className="edge">broadcast</span>
        <i style={{ left: `${position}%` }} aria-hidden="true" />
      </div>
      <div className="nl-range-ends">
        <code>{formatIp(s.network)}</code>
        <code>{formatIp(s.broadcast)}</code>
      </div>
      {siblings.length > 1 && siblings.length <= 64 && (
        <div className="nl-blocks" aria-hidden="true">
          {siblings.map((start) => (
            <span
              key={start}
              className={base + start === s.network ? "active" : ""}
            >
              {siblings.length <= 16 ? `.${start}` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function SubnetFacts({ ip, prefix }: { ip: number; prefix: number }) {
  const { t, text } = useT();
  const s = subnet(ip, prefix);
  const rows: [string, string][] = [
    [t("Address"), `${formatIp(ip)}/${prefix}`],
    [t("Mask"), formatIp(s.mask)],
    [t("Wildcard"), formatIp(s.wildcard)],
    [t("Network address"), formatIp(s.network)],
    [t("First host"), formatIp(s.firstHost)],
    [t("Last host"), formatIp(s.lastHost)],
    ["Broadcast", formatIp(s.broadcast)],
    [t("Usable hosts"), s.hosts.toLocaleString("en-US")],
    [t("Kind"), text(KIND_LABEL[classify(ip)])],
  ];
  return (
    <dl className="nl-facts nl-facts-wide">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Lesson 3: explore any block, then answer for the task's address.
export function RangeWidget({
  cidr,
  network,
  broadcast,
  hosts,
  onSolved,
}: {
  cidr: string;
  network: string;
  broadcast: string;
  hosts: number;
  onSolved: (solved: boolean) => void;
}) {
  const { t } = useT();
  const [example, setExample] = useState("192.168.1.77/26");
  const [answers, setAnswers] = useState({
    network: "",
    broadcast: "",
    hosts: "",
  });
  const parsed = parseCidr(example);
  const set = (key: keyof typeof answers, value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    onSolved(
      next.network.trim() === network &&
        next.broadcast.trim() === broadcast &&
        next.hosts.trim() === String(hosts),
    );
  };
  return (
    <div className="nl-card">
      <label className="nl-field">
        <span>{t("Example address (CIDR)")}</span>
        <input
          value={example}
          onChange={(e) => setExample(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
      </label>
      {parsed ? (
        <>
          <RangeBar ip={parsed.ip} prefix={parsed.prefix} />
          <BitStrip
            ip={parsed.ip}
            prefix={parsed.prefix}
            label={`IP ${example}`}
          />
          <Legend />
        </>
      ) : (
        <p className="nl-fail">
          {t("Write the address like 192.168.1.77/26.")}
        </p>
      )}
      <fieldset className="nl-answers">
        <legend>
          {t("Your answer:")} <code>{cidr}</code>
        </legend>
        <label className="nl-field">
          <span>{t("Network address")}</span>
          <input
            value={answers.network}
            onChange={(e) => set("network", e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
        </label>
        <label className="nl-field">
          <span>Broadcast</span>
          <input
            value={answers.broadcast}
            onChange={(e) => set("broadcast", e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
        </label>
        <label className="nl-field">
          <span>{t("Usable hosts")}</span>
          <input
            inputMode="numeric"
            value={answers.hosts}
            onChange={(e) => set("hosts", e.target.value)}
            autoComplete="off"
          />
        </label>
      </fieldset>
    </div>
  );
}

// Lesson 4: AND each address with the mask and compare the results.
export function CompareWidget({
  pc,
  prefix,
  devices,
  onSolved,
}: {
  pc: string;
  prefix: number;
  devices: string[];
  onSolved: (solved: boolean) => void;
}) {
  const { t } = useT();
  const own = parseIp(pc)!;
  const mask = prefixToMask(prefix);
  const [selected, setSelected] = useState(devices[0]);
  const [ticked, setTicked] = useState<string[]>([]);
  const other = parseIp(selected)!;
  const same = sameSubnet(own, other, prefix);
  const toggle = (device: string) => {
    const next = ticked.includes(device)
      ? ticked.filter((d) => d !== device)
      : [...ticked, device];
    setTicked(next);
    onSolved(
      devices.every(
        (d) => next.includes(d) === sameSubnet(parseIp(d)!, own, prefix),
      ),
    );
  };
  const rows: [string, number][] = [
    [`PC ${pc}`, own],
    [`${t("Mask")} /${prefix}`, mask],
    [`= ${t("network")}`, (own & mask) >>> 0],
    [selected, other],
    [`${t("Mask")} /${prefix}`, mask],
    [`= ${t("network")}`, (other & mask) >>> 0],
  ];
  return (
    <div className="nl-card">
      <div className="nl-and">
        {rows.map(([label, value], i) => (
          <div key={i} className={i % 3 === 2 ? "result" : ""}>
            <span>{label}</span>
            <BitStrip ip={value} prefix={prefix} label={formatIp(value)} />
            <code>{formatIp(value)}</code>
          </div>
        ))}
      </div>
      <p className={same ? "nl-pass" : "nl-fail"} aria-live="polite">
        {same
          ? t("The network addresses match → same network, direct delivery.")
          : t(
              "The network addresses differ → another network, the packet goes through the gateway.",
            )}
      </p>
      <fieldset className="nl-devices">
        <legend>
          {t("Tick the devices on the same network as {pc}/{prefix}", {
            pc,
            prefix,
          })}
        </legend>
        {devices.map((device) => (
          <div key={device} className={device === selected ? "active" : ""}>
            <label>
              <input
                type="checkbox"
                checked={ticked.includes(device)}
                onChange={() => toggle(device)}
              />
              <code>{device}</code>
            </label>
            <button className="nl-ghost" onClick={() => setSelected(device)}>
              {t("Show AND")}
            </button>
          </div>
        ))}
      </fieldset>
    </div>
  );
}
