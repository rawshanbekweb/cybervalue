"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  Lightbulb,
  Network,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import { useHashLessonId } from "../useHashLessonId";
import { useLocalStorageState } from "../useLocalStorageState";
import {
  classify,
  formatIp,
  KIND_LABEL,
  octets,
  parseCidr,
  parseIp,
  parseMask,
  prefixForHosts,
  prefixToMask,
  sameSubnet,
  subnet,
  type Kind,
  type Text,
} from "@/lib/network/ip";
import {
  fill,
  INTERNET_IP,
  networkWorks,
  ping,
  PRINTER_IP,
  ROUTER_IP,
  type Node,
  type PcConfig,
  type PingResult,
  type Target,
} from "@/lib/network/sim";
import {
  LESSONS,
  PROGRESS_KEY,
  restoreProgress,
  type Lesson,
  type Widget,
} from "@/lib/network/curriculum";
import { useT } from "./use-t";
import { DhcpWidget, DnsWidget, NatWidget } from "./origins";
import "./network-lab.css";

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

export function NetworkLab() {
  const { t, text } = useT();
  const [id, setId] = useHashLessonId(LESSONS.length);
  const [calculator, setCalculator] = useState(false);
  const [raw, setProgress] = useLocalStorageState<unknown>(PROGRESS_KEY, {});
  const progress = restoreProgress(raw);
  const done = Object.keys(progress).length;
  const lesson = LESSONS[id - 1];
  return (
    <div className="network-lab">
      <Link className="nl-back" href="/playground">
        <ArrowLeft size={15} /> {t("Laboratoriyalar", "Playground")}
      </Link>
      <header className="nl-hero">
        <div>
          <span className="eyebrow">
            <span className="status-dot" />{" "}
            {t("AMALIY TARMOQ KURSI", "HANDS-ON NETWORKING COURSE")}
          </span>
          <h1>
            {t("IP, mask va gateway.", "IP, mask and gateway.")}
            <br />
            <span>
              {t("Ko‘rib, bosib, tushunib.", "See it, click it, get it.")}
            </span>
          </h1>
          <p>
            {t(
              "Bitlarni o‘z qo‘lingiz bilan yoqing, maskni suring, kompyuterni sozlab ping yuboring va paket qayerda to‘xtaganini ko‘ring.",
              "Flip the bits yourself, slide the mask, configure a computer, send a ping and watch where the packet stops.",
            )}
          </p>
        </div>
        <div className="nl-course-card">
          <div>
            <Network size={22} />
            <strong>NETWORK / LAB</strong>
            <span className="nl-live">{t("Brauzerda", "In your browser")}</span>
          </div>
          <p>
            {LESSONS.length} {t("amaliy dars", "practical lessons")}{" "}
            <span>·</span> {t("subnet kalkulyator", "subnet calculator")}
          </p>
          <label htmlFor="nl-progress">
            {t("O‘zlashtirish", "Your progress")}{" "}
            <strong>
              {done}/{LESSONS.length}
            </strong>
          </label>
          <progress id="nl-progress" value={done} max={LESSONS.length} />
          <small>
            {t(
              "Natijalar shu brauzerda saqlanadi. Qurilmalar orasida sinxronlanmaydi.",
              "Progress is saved in this browser and does not sync across devices.",
            )}
          </small>
        </div>
      </header>
      <div className="nl-layout">
        <aside className="nl-sidebar">
          <div className="nl-sidebar-title">
            <BookOpen size={16} />
            <h2>{t("O‘quv yo‘li", "Learning path")}</h2>
          </div>
          <nav aria-label={t("Tarmoq darslari", "Networking lessons")}>
            {LESSONS.map((item, index) => (
              <div key={item.id}>
                {(index === 0 ||
                  item.group.en !== LESSONS[index - 1].group.en) && (
                  <h3>{text(item.group)}</h3>
                )}
                <a
                  href={`#lesson/${item.id}`}
                  className={!calculator && item.id === id ? "active" : ""}
                  aria-current={
                    !calculator && item.id === id ? "step" : undefined
                  }
                  onClick={() => setCalculator(false)}
                >
                  <span className={progress[item.id] ? "nl-done" : "nl-number"}>
                    {progress[item.id] ? (
                      <Check
                        size={14}
                        aria-label={t("Bajarilgan", "Completed")}
                      />
                    ) : (
                      String(item.id).padStart(2, "0")
                    )}
                  </span>
                  <span>{text(item.title)}</span>
                </a>
              </div>
            ))}
          </nav>
          <button
            className={`nl-tool ${calculator ? "active" : ""}`}
            onClick={() => setCalculator(true)}
          >
            <Calculator size={17} />
            {t("Subnet kalkulyator", "Subnet calculator")}
            <ArrowRight size={15} />
          </button>
        </aside>
        {calculator ? (
          <SubnetCalculator />
        ) : (
          <Workspace
            key={lesson.id}
            lesson={lesson}
            completed={!!progress[lesson.id]}
            onComplete={() => setProgress({ ...progress, [lesson.id]: true })}
            onNext={() => setId(Math.min(lesson.id + 1, LESSONS.length))}
          />
        )}
      </div>
    </div>
  );
}

function Workspace({
  lesson,
  completed,
  onComplete,
  onNext,
}: {
  lesson: Lesson;
  completed: boolean;
  onComplete: () => void;
  onNext: () => void;
}) {
  const { t, text } = useT();
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<"pass" | "fail" | null>(null);
  const report = (next: boolean) => {
    setSolved(next);
    setFeedback(null);
  };
  const check = () => {
    setFeedback(solved ? "pass" : "fail");
    if (solved) onComplete();
  };
  const last = lesson.id === LESSONS.length;
  return (
    <div className="nl-workspace">
      <header className="nl-lesson-header">
        <div>
          <span className="eyebrow">
            {t("DARS", "LESSON")} {String(lesson.id).padStart(2, "0")} /{" "}
            {LESSONS.length} · {lesson.minutes} {t("daqiqa", "min")}
          </span>
          <h2>{text(lesson.title)}</h2>
        </div>
        {completed && (
          <span className="nl-complete-badge">
            <Check size={15} />
            {t("Bajarilgan", "Completed")}
          </span>
        )}
      </header>
      <div className="nl-grid">
        <section
          className="nl-instructions"
          aria-label={t("Dars va topshiriq", "Lesson and task")}
        >
          <p className="nl-intro">{text(lesson.intro)}</p>
          <p className="nl-analogy">
            <Lightbulb size={16} aria-hidden="true" />
            <span>{text(lesson.analogy)}</span>
          </p>
          <details className="nl-theory" open>
            <summary>
              <BookOpen size={16} />
              {t("Avval tushunib oling", "Understand first")}
            </summary>
            <div>
              {lesson.theory.map((paragraph, i) => (
                <p key={i}>{text(paragraph)}</p>
              ))}
              {lesson.widget.type === "classify" && (
                <p>
                  {/* A standalone HTML document needs a full navigation, not the Next router. */}
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                  <a
                    className="nl-link"
                    href="/lessons/private-ipv4/index.html"
                  >
                    {t(
                      "Batafsil: Private IPv4 diapazonlari darsi",
                      "More: the private IPv4 ranges lesson",
                    )}
                  </a>
                </p>
              )}
            </div>
          </details>
          <div className="nl-task">
            <span className="eyebrow">{t("TOPSHIRIQ", "TASK")}</span>
            <p>{text(lesson.task)}</p>
            <details className="nl-hint">
              <summary>{t("Yordam kerakmi?", "Need a hint?")}</summary>
              <p>{text(lesson.hint)}</p>
            </details>
            <button className="nl-primary nl-check" onClick={check}>
              <Check size={16} />
              {t("Tekshirish", "Check")}
            </button>
            <div aria-live="polite">
              {feedback === "pass" && (
                <p className="nl-pass">
                  {t("To‘g‘ri! Dars bajarildi.", "Correct! Lesson completed.")}
                </p>
              )}
              {feedback === "fail" && (
                <p className="nl-fail">
                  {t(
                    "Hali emas. Vizualga qarang va yordamni oching.",
                    "Not yet. Look at the visual and open the hint.",
                  )}
                </p>
              )}
            </div>
            {(completed || feedback === "pass") && !last && (
              <button className="nl-next" onClick={onNext}>
                {t("Keyingi dars", "Next lesson")}
                <ArrowRight size={16} />
              </button>
            )}
            {(completed || feedback === "pass") && last && (
              <p className="nl-finish">
                {t(
                  "Barcha darslar tugadi. Endi subnet kalkulyatorida o‘z tarmog‘ingizni hisoblab ko‘ring.",
                  "All lessons done. Try your own network in the subnet calculator.",
                )}
              </p>
            )}
          </div>
        </section>
        <section
          className="nl-visual"
          aria-label={t("Interaktiv mashq", "Interactive exercise")}
        >
          <WidgetView
            widget={lesson.widget}
            checked={feedback !== null}
            onSolved={report}
          />
        </section>
      </div>
    </div>
  );
}

function WidgetView({
  widget,
  checked,
  onSolved,
}: {
  widget: Widget;
  checked: boolean;
  onSolved: (solved: boolean) => void;
}) {
  switch (widget.type) {
    case "bits":
      return <BitsWidget target={widget.target} onSolved={onSolved} />;
    case "mask":
      return <MaskWidget {...widget} onSolved={onSolved} />;
    case "range":
      return <RangeWidget {...widget} onSolved={onSolved} />;
    case "compare":
      return <CompareWidget {...widget} onSolved={onSolved} />;
    case "network":
      return <NetworkWidget start={widget.start} onSolved={onSolved} />;
    case "classify":
      return (
        <ClassifyWidget
          addresses={widget.addresses}
          checked={checked}
          onSolved={onSolved}
        />
      );
    case "ipconfig":
      return <IpconfigWidget {...widget} onSolved={onSolved} />;
    case "dhcp":
      return <DhcpWidget start={widget.start} onSolved={onSolved} />;
    case "dns":
      return <DnsWidget ask={widget.ask} onSolved={onSolved} />;
    case "nat":
      return <NatWidget {...widget} onSolved={onSolved} />;
  }
}

// Lesson 1: four octets of clickable bits.
function BitsWidget({
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
        {t("Maqsad:", "Target:")} <code>{target}</code>
      </p>
      <div className="nl-octets">
        {values.map((value, o) => (
          <div className="nl-octet" key={o}>
            <span className="nl-octet-label">
              {t("Oktet", "Octet")} {o + 1} = <strong>{value}</strong>
            </span>
            <div className="nl-bits">
              {WEIGHTS.map((weight) => {
                const on = (value & weight) !== 0;
                return (
                  <button
                    key={weight}
                    className={on ? "on" : ""}
                    aria-pressed={on}
                    aria-label={`${t("Oktet", "Octet")} ${o + 1}, ${weight}`}
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
        <RotateCcw size={14} /> {t("Tozalash", "Clear")}
      </button>
    </div>
  );
}

// 32 cells: network bits in violet, host bits in amber.
function BitStrip({
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

function Legend() {
  const { t } = useT();
  return (
    <p className="nl-legend">
      <span className="net">{t("tarmoq qismi", "network part")}</span>
      <span className="host">{t("host qismi", "host part")}</span>
    </p>
  );
}

// Lesson 2: slide the prefix and watch the split move.
function MaskWidget({
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
      <label htmlFor={sliderId} className="nl-slider-label">
        {t("Mask uzunligi", "Mask length")} <strong>/{prefix}</strong>
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
      <p className="nl-row-label">{t("Mask", "Mask")}</p>
      <BitStrip
        ip={s.mask}
        prefix={prefix}
        label={`${t("Mask", "Mask")} ${formatIp(s.mask)}`}
      />
      <p className="nl-row-label">
        IP <code>{ip}</code>
      </p>
      <BitStrip ip={address} prefix={prefix} label={`IP ${ip}`} />
      <Legend />
      <dl className="nl-facts">
        <div>
          <dt>{t("Mask", "Mask")}</dt>
          <dd>{formatIp(s.mask)}</dd>
        </div>
        <div>
          <dt>{t("Host bitlari", "Host bits")}</dt>
          <dd>{32 - prefix}</dd>
        </div>
        <div>
          <dt>{t("Qurilmalar uchun joy", "Room for devices")}</dt>
          <dd>{s.hosts.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt>{t("Tarmoq", "Network")}</dt>
          <dd>
            {formatIp(s.network)}/{prefix}
          </dd>
        </div>
      </dl>
      <p className={fits ? "nl-pass" : "nl-fail"} aria-live="polite">
        {fits
          ? t(
              `${hosts} ta kompyuter sig‘adi (${s.hosts} ta joy).`,
              `${hosts} computers fit (${s.hosts} places).`,
            )
          : t(
              `${hosts} ta kompyuter sig‘maydi: atigi ${s.hosts} ta joy.`,
              `${hosts} computers do not fit: only ${s.hosts} places.`,
            )}
      </p>
    </div>
  );
}

// The block from network to broadcast, with the address marked.
function RangeBar({ ip, prefix }: { ip: number; prefix: number }) {
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
        <span className="edge">{t("tarmoq", "network")}</span>
        <span className="hosts">
          {t("hostlar", "hosts")} · {s.hosts.toLocaleString("en-US")}
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

function SubnetFacts({ ip, prefix }: { ip: number; prefix: number }) {
  const { t, text } = useT();
  const s = subnet(ip, prefix);
  const rows: [string, string][] = [
    [t("Manzil", "Address"), `${formatIp(ip)}/${prefix}`],
    [t("Mask", "Mask"), formatIp(s.mask)],
    [t("Wildcard", "Wildcard"), formatIp(s.wildcard)],
    [t("Tarmoq manzili", "Network address"), formatIp(s.network)],
    [t("Birinchi host", "First host"), formatIp(s.firstHost)],
    [t("Oxirgi host", "Last host"), formatIp(s.lastHost)],
    ["Broadcast", formatIp(s.broadcast)],
    [t("Hostlar soni", "Usable hosts"), s.hosts.toLocaleString("en-US")],
    [t("Turi", "Kind"), text(KIND_LABEL[classify(ip)])],
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
function RangeWidget({
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
        <span>{t("Misol manzil (CIDR)", "Example address (CIDR)")}</span>
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
          {t(
            "Manzilni 192.168.1.77/26 ko‘rinishida yozing.",
            "Write the address like 192.168.1.77/26.",
          )}
        </p>
      )}
      <fieldset className="nl-answers">
        <legend>
          {t("Javobingiz:", "Your answer:")} <code>{cidr}</code>
        </legend>
        <label className="nl-field">
          <span>{t("Tarmoq manzili", "Network address")}</span>
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
          <span>{t("Hostlar soni", "Usable hosts")}</span>
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
function CompareWidget({
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
    [`${t("Mask", "Mask")} /${prefix}`, mask],
    [`= ${t("tarmoq", "network")}`, (own & mask) >>> 0],
    [selected, other],
    [`${t("Mask", "Mask")} /${prefix}`, mask],
    [`= ${t("tarmoq", "network")}`, (other & mask) >>> 0],
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
          ? t(
              "Tarmoq manzillari teng → bir tarmoqda, paket to‘g‘ridan-to‘g‘ri boradi.",
              "The network addresses match → same network, direct delivery.",
            )
          : t(
              "Tarmoq manzillari farq qiladi → boshqa tarmoq, paket gateway orqali boradi.",
              "The network addresses differ → another network, the packet goes through the gateway.",
            )}
      </p>
      <fieldset className="nl-devices">
        <legend>
          {t(
            `${pc}/${prefix} bilan bir tarmoqdagilarni belgilang`,
            `Tick the devices on the same network as ${pc}/${prefix}`,
          )}
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
              {t("AND ni ko‘rish", "Show AND")}
            </button>
          </div>
        ))}
      </fieldset>
    </div>
  );
}

const NODES: Record<Node, { x: number; y: number }> = {
  pc: { x: 70, y: 80 },
  switch: { x: 250, y: 80 },
  printer: { x: 250, y: 200 },
  router: { x: 430, y: 80 },
  internet: { x: 590, y: 80 },
};
const LINKS: [Node, Node][] = [
  ["pc", "switch"],
  ["switch", "printer"],
  ["switch", "router"],
  ["router", "internet"],
];

// Links a packet crossed; router → printer goes back through the switch.
function usedLinks(hops: Node[]) {
  const used = new Set<string>();
  for (let i = 1; i < hops.length; i++) {
    const pair = [hops[i - 1], hops[i]].sort().join("-");
    if (pair === "printer-router") {
      used.add("printer-switch");
      used.add("router-switch");
    } else used.add(pair);
  }
  return used;
}

function Topology({
  config,
  result,
}: {
  config: PcConfig;
  result: PingResult | null;
}) {
  const { t } = useT();
  const links = usedLinks(result?.hops ?? []);
  const stop = result && !result.ok ? result.hops.at(-1) : null;
  const labels: Record<Node, [string, string]> = {
    pc: [t("Kompyuter", "Computer"), config.ip || "—"],
    switch: ["Switch", "LAN"],
    printer: [t("Printer", "Printer"), PRINTER_IP],
    router: ["Router", ROUTER_IP],
    internet: ["Internet", INTERNET_IP],
  };
  return (
    <svg
      className="nl-topology"
      viewBox="0 0 660 250"
      role="img"
      aria-label={t(
        "Tarmoq sxemasi: kompyuter va printer switchga, switch routerga, router internetga ulangan.",
        "Network diagram: the computer and printer connect to a switch, the switch to a router, the router to the internet.",
      )}
    >
      <rect className="nl-lan" x="20" y="20" width="490" height="220" rx="16" />
      <text className="nl-lan-label" x="36" y="230">
        LAN 192.168.1.0/24
      </text>
      {LINKS.map(([a, b]) => {
        const key = [a, b].sort().join("-");
        return (
          <line
            key={key}
            className={`nl-wire ${links.has(key) ? (result?.ok ? "ok" : "used") : ""}`}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
          />
        );
      })}
      {(Object.keys(NODES) as Node[]).map((node) => {
        const reached = result?.hops.includes(node);
        const state =
          node === stop
            ? "stop"
            : reached
              ? result?.ok
                ? "ok"
                : "reached"
              : "";
        return (
          <g
            key={node}
            className={`nl-node ${state}`}
            transform={`translate(${NODES[node].x} ${NODES[node].y})`}
          >
            <rect x="-56" y="-26" width="112" height="52" rx="10" />
            <text y="-4">{labels[node][0]}</text>
            <text className="nl-node-ip" y="14">
              {labels[node][1]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Lessons 5 and 6: configure the PC, ping and read the explanation.
function NetworkWidget({
  start,
  onSolved,
}: {
  start: PcConfig;
  onSolved: (solved: boolean) => void;
}) {
  const { t, locale } = useT();
  const [config, setConfig] = useState(start);
  const [run, setRun] = useState<{ target: Target; result: PingResult } | null>(
    null,
  );
  const set = (key: keyof PcConfig, value: string) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    setRun(null);
    onSolved(networkWorks(next));
  };
  const send = (target: Target) =>
    setRun({ target, result: ping(config, target) });
  const fields: [keyof PcConfig, string][] = [
    ["ip", t("IP manzil", "IP address")],
    ["mask", "Subnet mask"],
    ["gateway", "Default gateway"],
  ];
  return (
    <div className="nl-card">
      <div className="nl-topology-frame">
        <Topology config={config} result={run?.result ?? null} />
      </div>
      <div className="nl-config">
        <p className="nl-row-label">
          {t("Kompyuter sozlamalari", "Computer settings")}
        </p>
        {fields.map(([key, label]) => (
          <label className="nl-field" key={key}>
            <span>{label}</span>
            <input
              value={config[key]}
              placeholder={key === "gateway" ? t("bo‘sh", "empty") : ""}
              onChange={(e) => set(key, e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
        ))}
      </div>
      <div className="nl-actions">
        <button className="nl-primary" onClick={() => send("printer")}>
          <Send size={15} /> ping {PRINTER_IP}
        </button>
        <button className="nl-primary" onClick={() => send("internet")}>
          <Send size={15} /> ping {INTERNET_IP}
        </button>
        <button
          className="nl-ghost"
          onClick={() => {
            setConfig(start);
            setRun(null);
            onSolved(false);
          }}
        >
          <RotateCcw size={14} /> {t("Boshidan", "Reset")}
        </button>
      </div>
      <div aria-live="polite">
        {run && (
          <div className={`nl-log ${run.result.ok ? "ok" : "fail"}`}>
            <p>
              {run.result.ok ? <Check size={16} /> : <X size={16} />}
              <strong>
                ping {run.target === "printer" ? PRINTER_IP : INTERNET_IP}:{" "}
                {run.result.ok
                  ? t("javob keldi", "reply received")
                  : t("javob yo‘q", "no reply")}
              </strong>
            </p>
            <ol>
              {run.result.log.map((step, i) => (
                <li key={i}>{fill(step, locale)}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

const KINDS: Kind[] = ["private", "public", "loopback", "link-local"];

function ClassifyWidget({
  addresses,
  checked,
  onSolved,
}: {
  addresses: string[];
  checked: boolean;
  onSolved: (solved: boolean) => void;
}) {
  const { t, text } = useT();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const choose = (address: string, kind: string) => {
    const next = { ...answers, [address]: kind };
    setAnswers(next);
    onSolved(addresses.every((a) => next[a] === classify(parseIp(a)!)));
  };
  return (
    <div className="nl-card">
      <ul className="nl-classify">
        {addresses.map((address) => {
          const right = answers[address] === classify(parseIp(address)!);
          return (
            <li key={address}>
              <code>{address}</code>
              <select
                aria-label={t(`${address} turi`, `Kind of ${address}`)}
                value={answers[address] ?? ""}
                onChange={(e) => choose(address, e.target.value)}
              >
                <option value="" disabled>
                  {t("Tanlang…", "Choose…")}
                </option>
                {KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {text(KIND_LABEL[kind])}
                  </option>
                ))}
              </select>
              {checked &&
                answers[address] &&
                (right ? (
                  <Check
                    size={16}
                    className="nl-mark-ok"
                    aria-label={t("to‘g‘ri", "correct")}
                  />
                ) : (
                  <X
                    size={16}
                    className="nl-mark-bad"
                    aria-label={t("noto‘g‘ri", "wrong")}
                  />
                ))}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function IpconfigWidget({
  output,
  options,
  answer,
  onSolved,
}: {
  output: string;
  options: Text[];
  answer: number;
  onSolved: (solved: boolean) => void;
}) {
  const { t, text } = useT();
  const name = useId();
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <div className="nl-card">
      <pre className="nl-console">
        <span>C:\&gt; ipconfig</span>
        {"\n\n"}
        {output}
      </pre>
      <fieldset className="nl-quiz">
        <legend>{t("Sababi nima?", "What is the cause?")}</legend>
        {options.map((option, i) => (
          <label key={i}>
            <input
              type="radio"
              name={name}
              checked={choice === i}
              onChange={() => {
                setChoice(i);
                onSolved(i === answer);
              }}
            />
            {text(option)}
          </label>
        ))}
      </fieldset>
    </div>
  );
}

// Free tool: any address and mask, with the full breakdown.
function SubnetCalculator() {
  const { t } = useT();
  const [address, setAddress] = useState("192.168.1.10");
  const [mask, setMask] = useState("255.255.255.0");
  const ip = parseIp(address);
  const prefix = parseMask(mask);
  return (
    <div className="nl-workspace">
      <header className="nl-lesson-header">
        <div>
          <span className="eyebrow">
            {t("ERKIN MASHQ", "YOUR OWN EXPERIMENTS")}
          </span>
          <h2>{t("Subnet kalkulyator", "Subnet calculator")}</h2>
        </div>
      </header>
      <div className="nl-card nl-calculator">
        <div className="nl-calc-inputs">
          <label className="nl-field">
            <span>{t("IP manzil", "IP address")}</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <label className="nl-field">
            <span>{t("Mask yoki /prefiks", "Mask or /prefix")}</span>
            <input
              value={mask}
              onChange={(e) => setMask(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
        </div>
        {ip === null || prefix === null ? (
          <p className="nl-fail" role="status">
            {ip === null
              ? t(
                  "IP manzil 4 ta 0–255 sondan iborat bo‘lishi kerak.",
                  "An IP address is four numbers from 0 to 255.",
                )
              : t(
                  "Maskni 255.255.255.0 yoki /24 ko‘rinishida yozing; birlar uzluksiz bo‘lishi kerak.",
                  "Write the mask as 255.255.255.0 or /24; its ones must be unbroken.",
                )}
          </p>
        ) : (
          <>
            <RangeBar ip={ip} prefix={prefix} />
            <p className="nl-row-label">IP</p>
            <BitStrip ip={ip} prefix={prefix} label={formatIp(ip)} />
            <p className="nl-row-label">{t("Mask", "Mask")}</p>
            <BitStrip
              ip={prefixToMask(prefix)}
              prefix={prefix}
              label={formatIp(prefixToMask(prefix))}
            />
            <Legend />
            <SubnetFacts ip={ip} prefix={prefix} />
          </>
        )}
      </div>
    </div>
  );
}
