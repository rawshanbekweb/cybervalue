"use client";

import { videoHref } from "@/lib/video-lessons";
import { useEffect, useRef, useState } from "react";
import { Check, Globe, Laptop, RefreshCw, Send, Server } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { QuizWidget, useReducedMotion } from "../anim-lab/widgets";
import {
  LESSONS,
  PROGRESS_KEY,
  type NetRow,
  type Widget,
} from "@/lib/http-basics/curriculum";
import {
  answer,
  family,
  FAMILIES,
  METHODS,
  PATHS,
  type Method,
  type Path,
  type Reply,
} from "@/lib/http-basics/server";
import type { Question } from "@/lib/anim-lab/types";
import "./http-basics.css";

// Academy · HTTP basics: how a browser and a server talk, with animated
// messages, a pretend server and a Network panel.
export function HttpBasics() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      checkpoints={["httpbasics-1"]}
      video={videoHref("httpbasics")}
      eyebrow={t("WEB FOUNDATIONS · ANIMATED")}
      title={t("HTTP basics.")}
      subtitle={t("Watch the browser and the server talk.")}
      description={t(
        "Follow requests and responses as they fly, take a message apart, send forms with GET and POST, and meet every family of status codes.",
      )}
      badge={t("HTTP / BASICS")}
      icon={<Globe size={22} />}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "form":
            return <FormWidget {...props} />;
          case "talk":
            return <TalkWidget {...props} />;
          case "netpanel":
            return (
              <NetPanelWidget
                rows={widget.rows}
                questions={widget.questions}
                {...props}
              />
            );
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** A browser and a server with one envelope flying between them. */
function Lane({
  flight,
}: {
  flight: {
    label: string;
    toServer: boolean;
    tone: string;
    key: number;
  } | null;
}) {
  const { t } = useT();
  const reduce = useReducedMotion();
  return (
    <div className="hb-lane">
      <span className="hb-end">
        <Laptop size={20} aria-hidden="true" />
        {t("Browser")}
      </span>
      <div className="hb-track" aria-hidden="true">
        {flight && (
          <span
            key={flight.key}
            className={`al-packet al-${flight.tone} ${reduce ? "" : "al-flying"}`}
            style={
              {
                "--from": flight.toServer ? "8%" : "92%",
                "--to": flight.toServer ? "92%" : "8%",
                "--dur": "900ms",
                left: flight.toServer ? "92%" : "8%",
              } as React.CSSProperties
            }
          >
            {flight.label}
          </span>
        )}
      </div>
      <span className="hb-end">
        <Server size={20} aria-hidden="true" />
        {t("Server")}
      </span>
    </div>
  );
}

/** Sends a search form with GET and a sign-in form with POST. */
function FormWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [query, setQuery] = useState("mushuk");
  const [user, setUser] = useState("ali");
  const [pass, setPass] = useState("Qwerty-2026");
  const [sent, setSent] = useState<{ get?: boolean; post?: boolean }>({});
  const [last, setLast] = useState<"get" | "post" | null>(null);
  const [key, setKey] = useState(0);
  const send = (which: "get" | "post") => {
    const next = { ...sent, [which]: true };
    setSent(next);
    setLast(which);
    setKey(key + 1);
    if (next.get && next.post) onSolved(true);
  };
  const enc = encodeURIComponent;
  const url =
    last === "get"
      ? `shop.uz/search?q=${enc(query)}`
      : last === "post"
        ? "shop.uz/login"
        : "shop.uz";
  return (
    <div className="nl-card hb-forms">
      <div className="hb-browser">
        <div className="hb-address" aria-label={t("Address bar")}>
          <span key={`u-${key}`} className="al-appear">
            {url.split("?")[0]}
            {url.includes("?") && (
              <mark className="hb-query">?{url.split("?")[1]}</mark>
            )}
          </span>
        </div>
        <div className="hb-form-grid">
          <form
            className="hb-form"
            onSubmit={(e) => {
              e.preventDefault();
              send("get");
            }}
          >
            <strong>GET · {t("Search")}</strong>
            <label>
              {t("Search for")}
              <input
                value={query}
                maxLength={30}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <button type="submit" className="nl-primary">
              <Send size={14} aria-hidden="true" /> {t("Send")}
              {sent.get && <Check size={14} aria-label={t("Sent")} />}
            </button>
          </form>
          <form
            className="hb-form"
            onSubmit={(e) => {
              e.preventDefault();
              send("post");
            }}
          >
            <strong>POST · {t("Sign in")}</strong>
            <label>
              {t("Username")}
              <input
                value={user}
                maxLength={20}
                onChange={(e) => setUser(e.target.value)}
              />
            </label>
            <label>
              {t("Password")}
              <input
                type="password"
                value={pass}
                maxLength={30}
                onChange={(e) => setPass(e.target.value)}
              />
            </label>
            <button type="submit" className="nl-primary">
              <Send size={14} aria-hidden="true" /> {t("Send")}
              {sent.post && <Check size={14} aria-label={t("Sent")} />}
            </button>
          </form>
        </div>
      </div>
      <Lane
        flight={
          last
            ? {
                label: last === "get" ? "GET /search" : "POST /login",
                toServer: true,
                tone: "plain",
                key,
              }
            : null
        }
      />
      {last && (
        <pre
          key={`r-${key}`}
          className="al-code hb-request al-appear"
          tabIndex={0}
        >
          {last === "get"
            ? `GET /search?q=${enc(query)} HTTP/1.1\nHost: shop.uz\n\n`
            : `POST /login HTTP/1.1\nHost: shop.uz\nContent-Type: application/x-www-form-urlencoded\n\n`}
          {last === "post" && (
            <mark className="hb-query">{`user=${enc(user)}&pass=${enc(pass)}`}</mark>
          )}
        </pre>
      )}
      <p className="al-counter" aria-live="polite">
        {last === "get"
          ? t("GET: the search words are in the address, visible to everyone.")
          : last === "post"
            ? t(
                "POST: the address stays clean; the data travels in the body — still readable without HTTPS!",
              )
            : t("Send both forms and watch the address bar and the request.")}
      </p>
    </div>
  );
}

const TONE: Record<number, string> = {
  2: "ok",
  3: "plain",
  4: "error",
  5: "error",
};

/** Pick a method and a path, send, and collect every family of codes. */
function TalkWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const reduce = useReducedMotion();
  const [method, setMethod] = useState<Method>("GET");
  const [path, setPath] = useState<Path>("/");
  const [phase, setPhase] = useState<"idle" | "out" | "back">("idle");
  const [reply, setReply] = useState<Reply | null>(null);
  const [seen, setSeen] = useState<number[]>([]);
  const [key, setKey] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  // The request in flight, fixed when sent: changing the pickers meanwhile
  // must not change the envelope coming back.
  const [sent, setSent] = useState<{ label: string; status: number } | null>(
    null,
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const wait = reduce ? 0 : 950;
  const send = () => {
    if (phase !== "idle") return;
    const result = answer(method, path);
    setSent({ label: `${method} ${path}`, status: result.status });
    setReply(null);
    setPhase("out");
    setKey(key + 1);
    timer.current = setTimeout(() => {
      setPhase("back");
      setKey((k) => k + 1);
      timer.current = setTimeout(() => {
        setPhase("idle");
        setReply(result);
        setHistory((old) =>
          [`${method} ${path} → ${result.status}`, ...old].slice(0, 6),
        );
        const next = seen.includes(family(result.status))
          ? seen
          : [...seen, family(result.status)];
        setSeen(next);
        if (FAMILIES.every((f) => next.includes(f))) onSolved(true);
      }, wait);
    }, wait);
  };
  const flight =
    sent && phase === "out"
      ? { label: sent.label, toServer: true, tone: "plain", key }
      : sent && phase === "back"
        ? {
            label: `${sent.status}`,
            toServer: false,
            tone: TONE[family(sent.status)],
            key,
          }
        : null;
  return (
    <div className="nl-card hb-talk">
      <div className="hb-picker">
        <label>
          {t("Method")}
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as Method)}
          >
            {METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          {t("Path")}
          <select
            value={path}
            onChange={(e) => setPath(e.target.value as Path)}
          >
            {PATHS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="nl-primary"
          onClick={send}
          disabled={phase !== "idle"}
        >
          <Send size={15} aria-hidden="true" /> {t("Send")}
        </button>
      </div>
      <Lane flight={flight} />
      <div aria-live="polite">
        {reply && (
          <pre
            className={`al-code hb-reply hb-family-${family(reply.status)} al-appear`}
            tabIndex={0}
          >
            {`HTTP/1.1 ${reply.status} ${reply.reason}\n${reply.headers
              .map(([n, v]) => `${n}: ${v}`)
              .join("\n")}\n\n${reply.body}`}
          </pre>
        )}
      </div>
      <ul className="hb-families" aria-label={t("Families collected")}>
        {FAMILIES.map((f) => (
          <li key={f} className={seen.includes(f) ? "got" : ""}>
            {seen.includes(f) && <Check size={13} aria-hidden="true" />}
            {f}xx
            <span className="visually-hidden">
              {seen.includes(f) ? t("collected") : t("not yet")}
            </span>
          </li>
        ))}
      </ul>
      {history.length > 0 && (
        <ol className="hb-history" aria-label={t("Sent requests")}>
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

/** A browser's Network panel: reload, read the rows, answer questions. */
function NetPanelWidget({
  rows,
  questions,
  onSolved,
}: { rows: NetRow[]; questions: Question[] } & WidgetProps) {
  const { t } = useT();
  const [loads, setLoads] = useState(0);
  return (
    <div className="nl-card hb-net">
      <div className="hb-net-bar">
        <strong>Network</strong>
        <button
          type="button"
          className="nl-ghost"
          onClick={() => setLoads(loads + 1)}
        >
          <RefreshCw size={14} aria-hidden="true" /> {t("Reload page")}
        </button>
      </div>
      {loads === 0 ? (
        <p className="al-muted">
          {t("Press “Reload page” to record the requests.")}
        </p>
      ) : (
        <div className="hb-net-wrap" tabIndex={0}>
          <table key={loads} className="hb-net-table">
            <thead>
              <tr>
                <th scope="col">{t("Method")}</th>
                <th scope="col">{t("File")}</th>
                <th scope="col">{t("Status")}</th>
                <th scope="col">{t("Type")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="hb-row"
                  style={{ animationDelay: `${i * 160}ms` }}
                >
                  <td>{row.method}</td>
                  <td>
                    <code>{row.path}</code>
                  </td>
                  <td className={`hb-family-${family(row.status)}`}>
                    {row.status}
                  </td>
                  <td>{row.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {loads > 0 && <QuizWidget questions={questions} onSolved={onSolved} />}
    </div>
  );
}
