"use client";

// Lessons 16–17: a page load as packets on a timeline, and hand-built HTTP
// requests against a small server.
import { useId, useState } from "react";
import { Check, Eye, Lock, LockOpen, Send } from "lucide-react";
import type { Text } from "@/lib/network/ip";
import {
  COOKIES,
  formatRequest,
  formatResponse,
  GOALS,
  HOST,
  pageLoad,
  PATHS,
  RESOLVER,
  serve,
  SERVER,
  type HttpRequest,
  type HttpResponse,
  type Method,
  type Packet,
  type Phase,
} from "@/lib/network/web";
import { useT } from "./use-t";

const LANES: Packet["from"][] = ["browser", "resolver", "server"];
const LANE_LABEL: Record<Packet["from"], [Text, string]> = {
  browser: [{ uz: "Brauzer", en: "Browser" }, "192.168.1.10"],
  resolver: [{ uz: "DNS resolver", en: "DNS resolver" }, RESOLVER],
  server: [{ uz: "Server", en: "Server" }, SERVER],
};
const PHASE_LABEL: Record<Phase, string> = {
  dns: "DNS",
  tcp: "TCP",
  tls: "TLS",
  http: "HTTP",
};

// Lesson 16: the packets of one page load, step by step.
export function PageLoadWidget({
  questions,
  onSolved,
}: {
  questions: { ask: Text; options: Text[]; answer: number }[];
  onSolved: (solved: boolean) => void;
}) {
  const { t, text } = useT();
  const name = useId();
  const [https, setHttps] = useState(true);
  const [cached, setCached] = useState(false);
  const [spy, setSpy] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    questions.map(() => null),
  );
  const load = pageLoad({ https, cached });
  const current = load.packets[Math.min(step, load.packets.length - 1)];
  const toggle = (set: (v: boolean) => void, value: boolean) => {
    set(value);
    setStep(0);
  };
  return (
    <div className="nl-card">
      <div className="nl-toggles">
        <label className="nl-switch">
          <input
            type="checkbox"
            checked={https}
            onChange={(e) => toggle(setHttps, e.target.checked)}
          />
          <span>HTTPS</span>
        </label>
        <label className="nl-switch">
          <input
            type="checkbox"
            checked={cached}
            onChange={(e) => toggle(setCached, e.target.checked)}
          />
          <span>{t("DNS cached")}</span>
        </label>
        <label className="nl-switch">
          <input
            type="checkbox"
            checked={spy}
            onChange={(e) => setSpy(e.target.checked)}
          />
          <span>{t("Wi-Fi eavesdropper’s view")}</span>
        </label>
      </div>
      <p className="nl-browser-line">
        {https ? (
          <Lock size={14} aria-hidden="true" />
        ) : (
          <LockOpen size={14} aria-hidden="true" />
        )}
        <code>
          {https ? "https" : "http"}://{HOST}/kitoblar
        </code>
      </p>
      <div
        className="nl-waterfall"
        role="img"
        aria-label={t("Timeline, {total} ms in total", { total: load.total })}
      >
        {load.timings.map((timing) => (
          <div key={timing.phase} className="nl-wf-row">
            <span>{PHASE_LABEL[timing.phase]}</span>
            <div>
              <i
                className={`nl-wf-${timing.phase}`}
                style={{
                  left: `${(timing.start / load.total) * 100}%`,
                  width: `${(timing.ms / load.total) * 100}%`,
                }}
              />
            </div>
            <code>{timing.ms} ms</code>
          </div>
        ))}
        <p className="nl-caption">
          {t("Total")}: {load.total} ms
        </p>
      </div>
      <div className="nl-ladder">
        <div className="nl-ladder-head">
          {LANES.map((lane) => (
            <span key={lane}>
              <strong>{text(LANE_LABEL[lane][0])}</strong>
              <code>{LANE_LABEL[lane][1]}</code>
            </span>
          ))}
        </div>
        <ol>
          {load.packets.map((packet, i) => {
            const a = LANES.indexOf(packet.from);
            const b = LANES.indexOf(packet.to);
            return (
              <li key={`${packet.phase}-${i}`}>
                <button
                  className={`nl-arrow nl-wf-${packet.phase} ${a < b ? "right" : "left"} ${i === step ? "active" : ""}`}
                  style={{
                    gridColumn: `${Math.min(a, b) + 1} / ${Math.max(a, b) + 2}`,
                  }}
                  onClick={() => setStep(i)}
                  aria-pressed={i === step}
                >
                  <span>{packet.summary}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="nl-actions">
        <button
          className="nl-ghost"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          {t("Previous")}
        </button>
        <button
          className="nl-primary"
          onClick={() => setStep(Math.min(load.packets.length - 1, step + 1))}
          disabled={step >= load.packets.length - 1}
        >
          {t("Next packet")}
        </button>
        <span className="nl-caption">
          {Math.min(step, load.packets.length - 1) + 1} / {load.packets.length}
        </span>
      </div>
      <div
        className="nl-frame"
        aria-live="polite"
        key={`${https}${cached}${step}`}
      >
        <p className="nl-frame-title">
          <span
            className={`nl-frame-kind ${current.phase === "dns" || current.phase === "tcp" ? "arp" : "icmp"}`}
          >
            {PHASE_LABEL[current.phase]}
          </span>
          <code>{current.transport}</code>
        </p>
        <table className="nl-headers">
          <tbody>
            {current.fields.map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>
                  <code>{value}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="nl-frame-note">{text(current.note)}</p>
        {spy && (
          <p
            className={`nl-spy ${!https && current.phase === "http" ? "danger" : ""}`}
          >
            <Eye size={15} aria-hidden="true" />
            <span>
              <strong>{t("The eavesdropper sees:")}</strong>{" "}
              {text(current.visible)}
            </span>
          </p>
        )}
      </div>
      <fieldset className="nl-quiz">
        <legend>{t("Questions")}</legend>
        {questions.map((question, q) => (
          <div key={q} className="nl-question">
            <p>{text(question.ask)}</p>
            {question.options.map((option, i) => (
              <label key={i}>
                <input
                  type="radio"
                  name={`${name}-${q}`}
                  checked={answers[q] === i}
                  onChange={() => {
                    const next = answers.map((a, j) => (j === q ? i : a));
                    setAnswers(next);
                    onSolved(next.every((a, j) => a === questions[j].answer));
                  }}
                />
                {text(option)}
              </label>
            ))}
          </div>
        ))}
      </fieldset>
    </div>
  );
}

const METHODS: Method[] = ["GET", "POST", "HEAD", "DELETE"];
const statusClass = (status: number) => `s${Math.floor(status / 100)}xx`;

// Raw HTTP text with the first line and header names picked out.
function Raw({ text: raw, label }: { text: string; label: string }) {
  const [head, ...rest] = raw.split("\n");
  const blank = rest.indexOf("");
  const headers = blank === -1 ? rest : rest.slice(0, blank);
  const body = blank === -1 ? "" : rest.slice(blank + 1).join("\n");
  return (
    <pre className="nl-raw" aria-label={label}>
      <b>{head}</b>
      {headers.map((line, i) => {
        const at = line.indexOf(":");
        return (
          <span key={i}>
            {"\n"}
            <i>{line.slice(0, at + 1)}</i>
            {line.slice(at + 1)}
          </span>
        );
      })}
      {"\n\n"}
      <span className="nl-raw-body">{body}</span>
    </pre>
  );
}

// Lesson 17: build requests, read raw responses, collect status codes.
export function HttpWidget({
  onSolved,
}: {
  onSolved: (solved: boolean) => void;
}) {
  const { t, text } = useT();
  const pathsId = useId();
  const [request, setRequest] = useState<HttpRequest>({
    method: "GET",
    path: "/kitoblar",
    cookie: "",
    body: "login=talaba&parol=",
  });
  const [response, setResponse] = useState<HttpResponse | null>(null);
  const [sent, setSent] = useState<HttpRequest | null>(null);
  const [seen, setSeen] = useState<number[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const set = <K extends keyof HttpRequest>(key: K, value: HttpRequest[K]) =>
    setRequest({ ...request, [key]: value });
  const send = () => {
    const res = serve(request);
    setResponse(res);
    setSent(request);
    const next = seen.includes(res.status) ? seen : [...seen, res.status];
    setSeen(next);
    setHistory(
      [`${request.method} ${request.path} → ${res.status}`, ...history].slice(
        0,
        6,
      ),
    );
    onSolved(GOALS.every((code) => next.includes(code)));
  };
  const setCookie = response?.headers.find(([k]) => k === "Set-Cookie");
  return (
    <div className="nl-card">
      <ul className="nl-goals" aria-label={t("Codes to get")}>
        {GOALS.map((code) => (
          <li
            key={code}
            className={`${statusClass(code)} ${seen.includes(code) ? "done" : ""}`}
          >
            {seen.includes(code) && <Check size={13} aria-hidden="true" />}
            {code}
          </li>
        ))}
      </ul>
      <div className="nl-request-form">
        <label className="nl-field">
          <span>{text({ uz: "Metod", en: "Method" })}</span>
          <select
            value={request.method}
            onChange={(e) => set("method", e.target.value as Method)}
          >
            {METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="nl-field">
          <span>{t("Path")}</span>
          <input
            list={pathsId}
            value={request.path}
            onChange={(e) => set("path", e.target.value || "/")}
            spellCheck={false}
            autoComplete="off"
          />
          <datalist id={pathsId}>
            {PATHS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </label>
        <label className="nl-field">
          <span>Cookie</span>
          <select
            value={request.cookie}
            onChange={(e) =>
              set("cookie", e.target.value as HttpRequest["cookie"])
            }
          >
            <option value="">{t("none")}</option>
            <option value="user">
              {t("regular user")} ({COOKIES.user})
            </option>
            <option value="admin">admin ({COOKIES.admin})</option>
          </select>
        </label>
        {request.method === "POST" && (
          <label className="nl-field nl-wide">
            <span>{t("Body (form)")}</span>
            <input
              value={request.body}
              onChange={(e) => set("body", e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
        )}
      </div>
      <div className="nl-chips">
        {PATHS.map((p) => (
          <button key={p} className="nl-ghost" onClick={() => set("path", p)}>
            {p}
          </button>
        ))}
      </div>
      <div className="nl-actions">
        <button className="nl-primary" onClick={send}>
          <Send size={15} /> {t("Send request")}
        </button>
        {setCookie && request.cookie !== "user" && (
          <button className="nl-ghost" onClick={() => set("cookie", "user")}>
            {t("Use the cookie you got")}
          </button>
        )}
      </div>
      <div className="nl-http" aria-live="polite">
        <Raw text={formatRequest(request)} label={t("Request text")} />
        {response && (
          <div className={`nl-response ${statusClass(response.status)}`}>
            {sent && (
              <p className="nl-row-label">
                {t("Response to:")}{" "}
                <code>
                  {sent.method} {sent.path}
                </code>
              </p>
            )}
            <Raw text={formatResponse(response)} label={t("Response text")} />
            <p>{text(response.explain)}</p>
          </div>
        )}
      </div>
      {history.length > 0 && (
        <ol className="nl-history" aria-label={t("History")}>
          {history.map((line, i) => (
            <li key={i}>
              <code>{line}</code>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
