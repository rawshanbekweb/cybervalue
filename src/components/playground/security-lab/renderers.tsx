"use client";

import { useTranslator } from "@/components/locale-provider";
import { Fragment, useEffect, useState, type ComponentType } from "react";
import type { Lesson } from "./lessons.data";
import { QUIZ } from "./lessons.data";
import { apiCall, type ApiResult } from "./api";
import {
  loadJSON,
  saveJSON,
  downloadText,
  NOTES_KEY,
  QUIZ_KEY,
  WORKSHEET_KEY,
} from "./storage";
import { showToast } from "./toast";
import {
  ResponseConsole,
  Field,
  FieldRow,
  ButtonRow,
  Chip,
  PrimaryButton,
  SecondaryButton,
  Callout,
  Feedback,
  CodeBlock,
  Pre,
} from "./ui";

interface RendererProps {
  lesson: Lesson;
}

export function Fallback() {
  const t = useTranslator();
  return (
    <p className="lab-help">
      {t("The practice exercise for this lesson is still being prepared.")}
    </p>
  );
}

const FLOW_STEPS_DB: [string, string, string][] = [
  ["▤", "Browser", "Request is prepared"],
  ["⇄", "HTTP", "Request is sent"],
  ["⌘", "Backend", "Identity & logic"],
  ["▱", "Database", "SQL runs"],
  ["⌘", "Backend", "Result becomes JSON"],
  ["⇄", "HTTP", "Response comes back"],
  ["▤", "Browser", "Result is displayed"],
];
const FLOW_STEPS_DEFAULT: [string, string, string][] = [
  ["▤", "Browser", "Request is prepared"],
  ["⇄", "HTTP", "Request is sent"],
  ["⌘", "Backend", "Identity & permission checked"],
  ["⌘", "Backend", "Business logic runs"],
  ["⇄", "HTTP", "Response comes back"],
  ["▤", "Browser", "Result is displayed"],
];

export function Flow({ lesson }: RendererProps) {
  const t = useTranslator();
  const steps = lesson.db ? FLOW_STEPS_DB : FLOW_STEPS_DEFAULT;
  const [idx, setIdx] = useState(0);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const send = async () => {
    setSending(true);
    const res = lesson.db
      ? await apiCall("GET", "/api/lab/database")
      : await apiCall("POST", "/api/lab/echo", { source: "flow-lesson" });
    setResult(res);
    setSending(false);
    showToast(t("Request sent. Check the Network panel."));
  };
  return (
    <div>
      <div className="lab-flow-board">
        <span className="lab-step-counter">
          {t("STEP")} {idx + 1} / {steps.length}
        </span>
        <div className="lab-flow-nodes">
          {steps.map(([sym, name, note], i) => (
            <Fragment key={i}>
              <div className={`lab-flow-node${i === idx ? " current" : ""}`}>
                <span className="lab-flow-symbol">{sym}</span>
                <strong>{t(name)}</strong>
                <small>{t(note)}</small>
              </div>
              {i < steps.length - 1 && (
                <span className="lab-flow-arrow">→</span>
              )}
            </Fragment>
          ))}
        </div>
        <p className="lab-flow-caption">
          {t(steps[idx][1])}: {t(steps[idx][2])}
        </p>
      </div>
      <ButtonRow>
        <SecondaryButton
          onClick={() => setIdx((v) => Math.max(0, v - 1))}
          disabled={idx === 0}
        >
          {t("← Previous step")}
        </SecondaryButton>
        <PrimaryButton
          onClick={() => setIdx((v) => Math.min(steps.length - 1, v + 1))}
          disabled={idx === steps.length - 1}
        >
          {t("Next step →")}
        </PrimaryButton>
        {lesson.real && (
          <SecondaryButton onClick={send} disabled={sending}>
            {t("Send a real request")}
          </SecondaryButton>
        )}
      </ButtonRow>
      {lesson.real && <ResponseConsole result={result} />}
    </div>
  );
}

const ORDER_STEPS = [
  "The user clicks the “Profile” button",
  "The browser builds an HTTP request (method, URL, headers)",
  "The request travels over the network to the backend",
  "The backend checks identity and permission",
  "The backend queries the database if needed",
  "The backend returns an HTTP response",
  "The browser renders the response on screen",
];

export function Order() {
  const t = useTranslator();
  const [shuffled] = useState(() =>
    ORDER_STEPS.map((text, i) => ({ text, i })).sort(() => Math.random() - 0.5),
  );
  const [picked, setPicked] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const reset = () => {
    setPicked([]);
    setFeedback(null);
  };
  const check = () => {
    if (picked.length !== ORDER_STEPS.length) {
      setFeedback({ ok: false, text: t("Select all the cards first.") });
      return;
    }
    const correct = picked.every((v, i) => v === i);
    setFeedback({
      ok: correct,
      text: correct
        ? t("✓ Correct! This is the entire journey of a single request.")
        : t("✗ Wrong order. Click “Start over” and try again."),
    });
  };
  return (
    <div>
      <p className="lab-help">{t("Click the cards in the correct order.")}</p>
      <ButtonRow>
        {shuffled.map(({ text, i }) => (
          <Chip
            key={i}
            selected={picked.includes(i)}
            disabled={picked.includes(i)}
            onClick={() => setPicked((p) => (p.includes(i) ? p : [...p, i]))}
          >
            {t(text)}
          </Chip>
        ))}
      </ButtonRow>
      <Callout>
        {t("Selected order:")}{" "}
        {picked.length ? picked.map((n) => n + 1).join(" → ") : t("(none yet)")}
      </Callout>
      <ButtonRow>
        <SecondaryButton onClick={reset}>{t("Start over")}</SecondaryButton>
        <PrimaryButton onClick={check}>{t("Check")}</PrimaryButton>
      </ButtonRow>
      <Feedback ok={feedback?.ok ?? null}>{feedback?.text ?? ""}</Feedback>
    </div>
  );
}

const CLASSIFY_ITEMS: { text: string; answer: "static" | "app" }[] = [
  { text: "The user reads an article — no form, no login.", answer: "static" },
  {
    text: "The user logs in and views their personal order history.",
    answer: "app",
  },
  {
    text: "The user adds a product to the cart and checks out.",
    answer: "app",
  },
];

export function Classify() {
  const t = useTranslator();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const check = () => {
    const correctCount = CLASSIFY_ITEMS.filter(
      (item, i) => answers[i] === item.answer,
    ).length;
    const all = correctCount === CLASSIFY_ITEMS.length;
    setFeedback({
      ok: all,
      text: all
        ? t(
            "✓ All correct: the type of action is determined by the exchange with the server, not by appearance.",
          )
        : t("{correct} / {total} correct. Review and try again.", {
            correct: correctCount,
            total: CLASSIFY_ITEMS.length,
          }),
    });
  };
  return (
    <div>
      {CLASSIFY_ITEMS.map((item, i) => (
        <div
          className="lab-choice-card"
          key={item.text}
          style={{ marginBottom: 10 }}
        >
          <strong>
            {i + 1}. {t(item.text)}
          </strong>
          <ButtonRow>
            <Chip
              selected={answers[i] === "static"}
              onClick={() => setAnswers((a) => ({ ...a, [i]: "static" }))}
            >
              {t("Static page")}
            </Chip>
            <Chip
              selected={answers[i] === "app"}
              onClick={() => setAnswers((a) => ({ ...a, [i]: "app" }))}
            >
              {t("Web application")}
            </Chip>
          </ButtonRow>
        </div>
      ))}
      <PrimaryButton onClick={check}>{t("Check")}</PrimaryButton>
      <Feedback ok={feedback?.ok ?? null}>{feedback?.text ?? ""}</Feedback>
    </div>
  );
}

const MATCH_DATA: Record<
  number,
  { options: string[]; rows: [string, string][] }
> = {
  4: {
    options: ["Frontend", "Backend", "Database"],
    rows: [
      ["Render the user interface", "Frontend"],
      ["Validate login credentials", "Backend"],
      ["Store the users table", "Database"],
      ["Check permission (role) for an action", "Backend"],
    ],
  },
  32: {
    options: ["Frontend", "Backend", "Database", "HTTP / API"],
    rows: [
      ["“What do I show?”", "Frontend"],
      ["“What's allowed?”", "Backend"],
      ["“Where is it stored?”", "Database"],
      ["“How do I connect?”", "HTTP / API"],
    ],
  },
};

export function Match({ lesson }: RendererProps) {
  const t = useTranslator();
  const data = MATCH_DATA[lesson.id] ?? MATCH_DATA[4];
  const [values, setValues] = useState<string[]>(() => data.rows.map(() => ""));
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const check = () => {
    const correct = values.filter((v, i) => v === data.rows[i][1]).length;
    const all = correct === data.rows.length;
    setFeedback({
      ok: all,
      text: all
        ? t("✓ You matched the model correctly.")
        : t("{correct} / {total} correct.", {
            correct,
            total: data.rows.length,
          }),
    });
  };
  return (
    <div>
      {data.rows.map((row, i) => (
        <div className="lab-match-row" key={row[0]}>
          <span>{t(row[0])}</span>
          <select
            value={values[i]}
            onChange={(e) =>
              setValues((v) =>
                v.map((cur, j) => (j === i ? e.target.value : cur)),
              )
            }
          >
            <option value="">{t("— choose —")}</option>
            {data.options.map((o) => (
              <option key={o} value={o}>
                {t(o)}
              </option>
            ))}
          </select>
        </div>
      ))}
      <PrimaryButton onClick={check}>{t("Check")}</PrimaryButton>
      <Feedback ok={feedback?.ok ?? null}>{feedback?.text ?? ""}</Feedback>
    </div>
  );
}

export function FrontendDemo() {
  const t = useTranslator();
  const [title, setTitle] = useState(t("Sign in"));
  const [color, setColor] = useState("#087e78");
  const [note, setNote] = useState("");
  return (
    <div>
      <div className="lab-preview-pane">
        <h4>{t("A small login interface (demo only)")}</h4>
        <Field label={t("Heading")}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label={t("Button color")}>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </Field>
        <h3 style={{ margin: "14px 0" }}>{title}</h3>
        <input placeholder={t("Username")} style={{ marginBottom: 8 }} />
        <input
          placeholder={t("Password")}
          type="password"
          style={{ marginBottom: 8 }}
        />
        <button
          className="lab-primary-button"
          style={{ background: color, borderColor: color }}
          onClick={() => {
            setNote(
              t(
                'Even though the button says "Log in as Admin," no request was sent to any server — this is just what\'s shown in the browser.',
              ),
            );
            showToast(
              t(
                "Only the frontend changed. The server knows nothing about it.",
              ),
            );
          }}
          type="button"
        >
          {t("Log in as Admin")}
        </button>
      </div>
      <p className="lab-help">{note}</p>
    </div>
  );
}

const AUTH_PASSWORDS: Record<string, string> = {
  ali: "ali123",
  vali: "vali123",
  admin: "admin123",
};

export function AuthConsole({ lesson }: RendererProps) {
  const t = useTranslator();
  const [username, setUsername] = useState("ali");
  const [password, setPassword] = useState("ali123");
  const [log, setLog] = useState<{ label: string; result: ApiResult }[]>([]);
  const pushLog = (label: string, result: ApiResult) =>
    setLog((l) => [{ label, result }, ...l].slice(0, 6));
  const login = async (name: string, pass: string) => {
    const res = await apiCall("POST", "/api/lab/login", {
      username: name,
      password: pass,
    });
    pushLog(`Login: ${name}`, res);
    showToast(
      res.ok ? t("Logged in as {name}.", { name }) : t("Login failed."),
    );
  };
  return (
    <div>
      {lesson.id === 6 && (
        <>
          <Callout>
            {t(
              "The “Admin panel (UI only)” button below doesn't send any request — it's just a button that's visible.",
            )}
          </Callout>
          <ButtonRow>
            <SecondaryButton
              onClick={() =>
                showToast(
                  t("This is just a frontend button — no API was called."),
                )
              }
            >
              {t("Admin panel (UI only)")}
            </SecondaryButton>
          </ButtonRow>
        </>
      )}
      <FieldRow>
        <Field label={t("Username")}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>
        <Field label={t("Password")}>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
      </FieldRow>
      <ButtonRow>
        <SecondaryButton onClick={() => login("ali", AUTH_PASSWORDS.ali)}>
          {t("Log in as Ali")}
        </SecondaryButton>
        <SecondaryButton onClick={() => login("vali", AUTH_PASSWORDS.vali)}>
          {t("Log in as Vali")}
        </SecondaryButton>
        <SecondaryButton onClick={() => login("admin", AUTH_PASSWORDS.admin)}>
          {t("Log in as Admin")}
        </SecondaryButton>
        <SecondaryButton onClick={() => login(username, password)}>
          {t("Log in with the credentials above")}
        </SecondaryButton>
        <SecondaryButton
          onClick={async () =>
            pushLog(t("Logout"), await apiCall("POST", "/api/lab/logout"))
          }
        >
          {t("Log out")}
        </SecondaryButton>
      </ButtonRow>
      <ButtonRow>
        <PrimaryButton
          onClick={async () =>
            pushLog(
              "GET /api/profile",
              await apiCall("GET", "/api/lab/profile"),
            )
          }
        >
          {t("Call /api/profile")}
        </PrimaryButton>
        <PrimaryButton
          onClick={async () =>
            pushLog("GET /api/admin", await apiCall("GET", "/api/lab/admin"))
          }
        >
          {t("Call /api/admin")}
        </PrimaryButton>
      </ButtonRow>
      <div>
        {log.map((entry, i) => (
          <div key={i}>
            <div className="lab-result-header">
              <span>{entry.label}</span>
              <span
                className={`lab-status-pill${entry.result.status >= 400 ? " error" : ""}`}
              >
                {entry.result.status}
              </span>
            </div>
            <CodeBlock>
              <Pre data={entry.result.data} />
            </CodeBlock>
          </div>
        ))}
      </div>
    </div>
  );
}

const METHODS_WITH_BODY = ["POST", "PUT", "PATCH"];

export function RequestConsole({ lesson }: RendererProps) {
  const t = useTranslator();
  const [method, setMethod] = useState<string>(lesson.method ?? "GET");
  const [endpoint, setEndpoint] = useState(lesson.endpoint ?? "/api/lab/echo");
  const [headerKey, setHeaderKey] = useState("");
  const [headerVal, setHeaderVal] = useState("");
  const [bodyText, setBodyText] = useState(
    JSON.stringify(lesson.body ?? {}, null, 2),
  );
  const [result, setResult] = useState<ApiResult | null>(null);
  const send = async () => {
    const extraHeaders = headerKey.trim()
      ? { [headerKey.trim()]: headerVal }
      : undefined;
    let body: unknown;
    if (METHODS_WITH_BODY.includes(method)) {
      try {
        body = JSON.parse(bodyText || "{}");
      } catch (err) {
        setResult({
          ok: false,
          status: 0,
          statusText: t("JSON error"),
          headers: {},
          data: {
            error:
              t("Body isn't valid JSON: ") +
              (err instanceof Error ? err.message : String(err)),
          },
          ms: 0,
        });
        return;
      }
    }
    setResult(await apiCall(method, endpoint, body, extraHeaders));
  };
  return (
    <div>
      <FieldRow>
        <Field label={t("Method")}>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="Endpoint">
          <input
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label={t("Extra header name (optional)")}>
          <input
            placeholder="X-Lesson"
            value={headerKey}
            onChange={(e) => setHeaderKey(e.target.value)}
          />
        </Field>
        <Field label={t("Header value")}>
          <input
            placeholder={String(lesson.id)}
            value={headerVal}
            onChange={(e) => setHeaderVal(e.target.value)}
          />
        </Field>
      </FieldRow>
      <Field label={t("JSON body")}>
        <textarea
          disabled={!METHODS_WITH_BODY.includes(method)}
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
        />
      </Field>
      <ButtonRow>
        <PrimaryButton onClick={send}>{t("Send request")}</PrimaryButton>
      </ButtonRow>
      <ResponseConsole result={result} />
    </div>
  );
}

const STATUS_CODES = [200, 201, 301, 302, 400, 401, 403, 404, 429, 500];

export function StatusConsole() {
  const [result, setResult] = useState<ApiResult | null>(null);
  return (
    <div>
      <ButtonRow>
        {STATUS_CODES.map((c) => (
          <Chip
            key={c}
            onClick={async () =>
              setResult(await apiCall("GET", `/api/lab/status/${c}`))
            }
          >
            {c}
          </Chip>
        ))}
      </ButtonRow>
      <ResponseConsole result={result} />
    </div>
  );
}

export function Validate() {
  const t = useTranslator();
  const [age, setAge] = useState("25");
  const [result, setResult] = useState<ApiResult | null>(null);
  const send = async () => {
    const trimmed = age.trim();
    const parsed = /^-?\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
    setResult(await apiCall("POST", "/api/lab/validate", { age: parsed }));
  };
  return (
    <div>
      <FieldRow>
        <Field label={t("Age")}>
          <input value={age} onChange={(e) => setAge(e.target.value)} />
        </Field>
      </FieldRow>
      <ButtonRow>
        <Chip onClick={() => setAge("25")}>25</Chip>
        <Chip onClick={() => setAge("-5")}>-5</Chip>
        <Chip onClick={() => setAge("twenty")}>{t('"twenty"')}</Chip>
      </ButtonRow>
      <ButtonRow>
        <PrimaryButton onClick={send}>{t("Submit")}</PrimaryButton>
      </ButtonRow>
      <ResponseConsole result={result} />
    </div>
  );
}

function b64urlDecode(seg: string): string {
  return atob(
    seg.replace(/-/g, "+").replace(/_/g, "/") +
      "=".repeat((4 - (seg.length % 4)) % 4),
  );
}

export function Jwt() {
  const t = useTranslator();
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<{
    header: unknown;
    payload: unknown;
  } | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);
  const login = async () => {
    const res = await apiCall("POST", "/api/lab/login", {
      username: "ali",
      password: "ali123",
    });
    const data = res.data as { token?: string } | null;
    if (res.ok && data?.token) {
      setToken(data.token);
      showToast(t("Token received."));
    } else {
      setResult(res);
    }
  };
  const decode = () => {
    try {
      const [head, payload] = token.split(".");
      setDecoded({
        header: JSON.parse(b64urlDecode(head)),
        payload: JSON.parse(b64urlDecode(payload)),
      });
    } catch {
      showToast(t("Decode failed."));
    }
  };
  return (
    <div>
      <ButtonRow>
        <SecondaryButton onClick={login}>
          {t("Log in as Ali (get a token)")}
        </SecondaryButton>
      </ButtonRow>
      {token && (
        <CodeBlock>
          <Pre data={token} />
        </CodeBlock>
      )}
      <ButtonRow>
        <SecondaryButton onClick={decode} disabled={!token}>
          {t("Decode the payload")}
        </SecondaryButton>
        <PrimaryButton
          onClick={async () =>
            setResult(
              await apiCall("GET", "/api/lab/profile", undefined, {
                Authorization: `Bearer ${token}`,
              }),
            )
          }
          disabled={!token}
        >
          {t("/api/profile with the original token")}
        </PrimaryButton>
        <SecondaryButton
          onClick={async () => {
            const tampered =
              token.slice(0, -1) + (token.slice(-1) === "a" ? "b" : "a");
            setResult(
              await apiCall("GET", "/api/lab/profile", undefined, {
                Authorization: `Bearer ${tampered}`,
              }),
            );
          }}
          disabled={!token}
        >
          {t("/api/profile with the tampered token")}
        </SecondaryButton>
      </ButtonRow>
      {decoded && (
        <CodeBlock>
          <div className="lab-code-label">Header</div>
          <Pre data={decoded.header} />
          <div className="lab-code-label" style={{ marginTop: 10 }}>
            Payload
          </div>
          <Pre data={decoded.payload} />
        </CodeBlock>
      )}
      <ResponseConsole result={result} />
    </div>
  );
}

type CookiesOutput =
  | { kind: "flags"; data: unknown }
  | { kind: "raw"; text: string }
  | { kind: "response"; result: ApiResult }
  | null;

export function Cookies() {
  const t = useTranslator();
  const [out, setOut] = useState<CookiesOutput>(null);
  return (
    <div>
      <ButtonRow>
        <SecondaryButton
          onClick={async () => {
            const res = await apiCall("POST", "/api/lab/login", {
              username: "ali",
              password: "ali123",
            });
            const data = res.data as { cookie_flags?: unknown } | null;
            setOut({ kind: "flags", data: data?.cookie_flags });
          }}
        >
          {t("Log in as Ali")}
        </SecondaryButton>
        <SecondaryButton
          onClick={() =>
            setOut({
              kind: "raw",
              text: `document.cookie = "${document.cookie}"`,
            })
          }
        >
          {t("Read document.cookie")}
        </SecondaryButton>
        <PrimaryButton
          onClick={async () =>
            setOut({
              kind: "response",
              result: await apiCall("GET", "/api/lab/profile"),
            })
          }
        >
          {t("/api/profile with the cookie")}
        </PrimaryButton>
      </ButtonRow>
      {out?.kind === "flags" && (
        <Callout>
          {t("cookie_flags from the login response:")}{" "}
          {JSON.stringify(out.data, null, 2)}
        </Callout>
      )}
      {out?.kind === "raw" && (
        <>
          <CodeBlock>
            <Pre data={out.text} />
          </CodeBlock>
          <p className="lab-help">
            {t(
              "The session cookie is HttpOnly, so it isn't visible here — but the browser still attaches it to the request automatically.",
            )}
          </p>
        </>
      )}
      {out?.kind === "response" && <ResponseConsole result={out.result} />}
    </div>
  );
}

function DataTable({ rows }: { rows: Record<string, unknown>[] | undefined }) {
  const t = useTranslator();
  if (!rows || !rows.length) return <p className="lab-help">{t("(empty)")}</p>;
  const cols = Object.keys(rows[0]);
  return (
    <div className="lab-table-scroll">
      <table className="lab-mini-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {cols.map((c) => (
                <td key={c}>{String(r[c])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DatabaseView() {
  const t = useTranslator();
  const [rows, setRows] = useState<Record<string, unknown>[] | undefined>(
    undefined,
  );
  const [raw, setRaw] = useState<unknown>(undefined);
  const load = async () => {
    const res = await apiCall("GET", "/api/lab/database");
    const data = res.data as { rows?: Record<string, unknown>[] } | null;
    if (data?.rows?.length) setRows(data.rows);
    else setRaw(res.data);
  };
  return (
    <div>
      <ButtonRow>
        <PrimaryButton onClick={load}>{t("Fetch the table")}</PrimaryButton>
      </ButtonRow>
      {rows ? (
        <DataTable rows={rows} />
      ) : raw !== undefined ? (
        <Pre data={raw} />
      ) : null}
    </div>
  );
}

const CRUD_OPS = ["SELECT", "INSERT", "UPDATE", "DELETE"] as const;

export function SqlCrud() {
  const t = useTranslator();
  const [data, setData] = useState<{
    query?: string;
    before?: Record<string, unknown>[];
    after?: Record<string, unknown>[];
  } | null>(null);
  return (
    <div>
      <ButtonRow>
        {CRUD_OPS.map((op) => (
          <Chip
            key={op}
            onClick={async () => {
              const res = await apiCall("POST", "/api/lab/sql/crud", {
                operation: op,
              });
              setData((res.data as typeof data) ?? {});
            }}
          >
            {op}
          </Chip>
        ))}
      </ButtonRow>
      {data && (
        <>
          <CodeBlock>
            <div className="lab-code-label">Query</div>
            <Pre data={data.query} />
          </CodeBlock>
          <div className="lab-compare-grid" style={{ marginTop: 12 }}>
            <div>
              <h4 style={{ fontSize: 10, color: "var(--muted)" }}>
                {t("BEFORE")}
              </h4>
              <DataTable rows={data.before} />
            </div>
            <div>
              <h4 style={{ fontSize: 10, color: "var(--muted)" }}>
                {t("AFTER")}
              </h4>
              <DataTable rows={data.after} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function Sql({ lesson }: RendererProps) {
  const t = useTranslator();
  const vulnerable = lesson.mode === "vulnerable";
  const [username, setUsername] = useState("ali");
  const [result, setResult] = useState<ApiResult | null>(null);
  return (
    <div>
      <Field label={t("Username")}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </Field>
      <ButtonRow>
        <Chip onClick={() => setUsername("ali")}>ali</Chip>
        <Chip onClick={() => setUsername("' OR '1'='1")}>
          &apos; OR &apos;1&apos;=&apos;1
        </Chip>
        <Chip onClick={() => setUsername("nobody' --")}>nobody&apos; --</Chip>
      </ButtonRow>
      <ButtonRow>
        <PrimaryButton
          onClick={async () =>
            setResult(
              await apiCall("POST", "/api/lab/sql", {
                username,
                mode: vulnerable ? "vulnerable" : "safe",
              }),
            )
          }
        >
          {t("Send ({mode} mode)", {
            mode: t(vulnerable ? "vulnerable" : "safe"),
          })}
        </PrimaryButton>
      </ButtonRow>
      <ResponseConsole result={result} />
    </div>
  );
}

const XSS_PRESETS = [
  { label: "Plain HTML markup", value: "Hello <b>world</b>" },
  {
    label: "img onerror payload",
    value: `<img src=x onerror="document.body.style.background='crimson'; document.title='XSS!'">`,
  },
  {
    label: "script tag",
    value: "<script>document.title='XSS worked!'</script>",
  },
];

export function Xss() {
  const t = useTranslator();
  const [value, setValue] = useState(t("Hello <b>world</b>"));
  const safeDoc = `<!doctype html><meta charset="utf-8"><style>body{font:12px sans-serif;padding:8px;color:#234}</style><div id="out"></div><script>document.getElementById('out').textContent = ${JSON.stringify(value)};</script>`;
  const vulnDoc = `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="script-src 'unsafe-inline'; default-src 'none'"><style>body{font:12px sans-serif;padding:8px;color:#234}</style><div id="out"></div><script>document.getElementById('out').innerHTML = ${JSON.stringify(value)};</script>`;
  return (
    <div>
      <Field label={t("Text (payload)")}>
        <textarea value={value} onChange={(e) => setValue(e.target.value)} />
      </Field>
      <ButtonRow>
        {XSS_PRESETS.map((p) => (
          <Chip key={p.label} onClick={() => setValue(t(p.value))}>
            {t(p.label)}
          </Chip>
        ))}
      </ButtonRow>
      <div className="lab-compare-grid" style={{ marginTop: 14 }}>
        <div className="lab-preview-pane">
          <h4>{t("Safe render (textContent)")}</h4>
          <iframe
            className="lab-sandbox-frame"
            sandbox="allow-scripts"
            srcDoc={safeDoc}
            title={t("Safe render")}
          />
        </div>
        <div className="lab-preview-pane">
          <h4>{t("Unsafe render (innerHTML) — inside an isolated sandbox")}</h4>
          <iframe
            className="lab-sandbox-frame"
            sandbox="allow-scripts"
            srcDoc={vulnDoc}
            title={t("Unsafe render")}
          />
        </div>
      </div>
      <p className="lab-help">
        {t(
          "Both frames are fully isolated from the main page (a sandboxed iframe, no access to cookies or the DOM) — this is only here to show the difference in rendering.",
        )}
      </p>
    </div>
  );
}

export function Idor() {
  const t = useTranslator();
  const [id, setId] = useState("15");
  const [mode, setMode] = useState<"safe" | "vulnerable">("safe");
  const [result, setResult] = useState<ApiResult | null>(null);
  return (
    <div>
      <ButtonRow>
        <SecondaryButton
          onClick={async () => {
            await apiCall("POST", "/api/lab/login", {
              username: "ali",
              password: "ali123",
            });
            showToast(t("Logged in as Ali."));
          }}
        >
          {t("Log in as Ali")}
        </SecondaryButton>
      </ButtonRow>
      <FieldRow>
        <Field label={t("User ID")}>
          <input value={id} onChange={(e) => setId(e.target.value)} />
        </Field>
        <Field label={t("Mode")}>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "safe" | "vulnerable")}
          >
            <option value="safe">{t("Safe")}</option>
            <option value="vulnerable">{t("Vulnerable")}</option>
          </select>
        </Field>
      </FieldRow>
      <ButtonRow>
        <PrimaryButton
          onClick={async () => {
            const path = `/api/lab/users/${encodeURIComponent(id.trim())}${mode === "vulnerable" ? "?mode=vulnerable" : ""}`;
            setResult(await apiCall("GET", path));
          }}
        >
          {t("Call /api/users/:id")}
        </PrimaryButton>
      </ButtonRow>
      <ResponseConsole result={result} />
    </div>
  );
}

const SURFACE_CARDS = [
  {
    title: "Comment",
    chain:
      "Input → stored in server memory → rendered in the browser. Problem: XSS if rendered as HTML. Defense: textContent, or context-appropriate sanitization.",
  },
  {
    title: "Resource ID (URL)",
    chain:
      "Input → backend query parameter → matches a database row. Problem: IDOR if ownership isn't checked. Defense: an authorization check on every object.",
  },
  {
    title: "Login",
    chain:
      "Input → credentials compared → session/JWT issued. Problem: SQLi if the query is built unsafely. Defense: parameterized queries, rate limiting.",
  },
  {
    title: "Search",
    chain:
      "Input → filter/query → the result gets rendered. Problem: reflected XSS or SQLi. Defense: parameterization plus context-appropriate output encoding.",
  },
];

export function Surface() {
  const t = useTranslator();
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  return (
    <div className="lab-choice-grid">
      {SURFACE_CARDS.map((c, i) => (
        <button
          key={c.title}
          type="button"
          className={`lab-choice-card${revealed.has(i) ? " selected" : ""}`}
          style={{ cursor: "pointer", width: "100%" }}
          onClick={() => setRevealed((s) => new Set(s).add(i))}
        >
          <strong>{t(c.title)}</strong>
          <small>
            {t(revealed.has(i) ? c.chain : "Click to reveal the chain →")}
          </small>
        </button>
      ))}
    </div>
  );
}

const INVESTIGATE_ITEMS = [
  {
    title: "Login",
    options: [
      "Can the password be decrypted?",
      "How much information leaks on a failed login, and how many attempts are allowed?",
    ],
    correct: 1,
    why: "The error message and rate limiting reveal real trust mistakes; the password hash is never returned.",
  },
  {
    title: "Comment",
    options: [
      "Are HTML tags stored as part of the comment?",
      "How does the comment get rendered when it comes back to the browser?",
    ],
    correct: 1,
    why: "It's the rendering method, not the storage format, that determines XSS risk.",
  },
  {
    title: "Checkout",
    options: [
      "Is the price in the right format?",
      "Who decides the price — the client or the server?",
    ],
    correct: 1,
    why: "Being correctly formatted doesn't mean the price can be trusted.",
  },
];

export function Investigate() {
  const t = useTranslator();
  const [picked, setPicked] = useState<Record<number, number>>({});
  return (
    <div>
      {INVESTIGATE_ITEMS.map((item, i) => (
        <div style={{ marginBottom: 18 }} key={item.title}>
          <strong>{t(item.title)}</strong>
          <div className="lab-quiz-options">
            {item.options.map((opt, j) => {
              const chosen = picked[i];
              const cls =
                chosen === undefined
                  ? ""
                  : j === item.correct
                    ? " correct"
                    : chosen === j
                      ? " wrong"
                      : "";
              return (
                <button
                  key={opt}
                  type="button"
                  className={`lab-quiz-option${cls}`}
                  onClick={() => setPicked((p) => ({ ...p, [i]: j }))}
                >
                  <span>{j + 1}</span>
                  {t(opt)}
                </button>
              );
            })}
          </div>
          <Feedback ok={null}>
            {picked[i] !== undefined ? t(item.why) : ""}
          </Feedback>
        </div>
      ))}
    </div>
  );
}

const TASK_ITEMS = [
  "Network: write down 7 pieces of evidence from a single request.",
  "API: build a list of open and closed endpoints.",
  "Access control: find one example of the 401/403 difference.",
  "Data flow: describe one input's source→sink path.",
];

export function Tasks({ lesson }: RendererProps) {
  const t = useTranslator();
  const key = `task:${lesson.id}`;
  const [checked, setChecked] = useState<Record<number, boolean>>(
    () =>
      loadJSON(NOTES_KEY, {} as Record<string, Record<number, boolean>>)[key] ??
      {},
  );
  const toggle = (i: number) => {
    const next = { ...checked, [i]: !checked[i] };
    setChecked(next);
    const notes = loadJSON(NOTES_KEY, {} as Record<string, unknown>);
    notes[key] = next;
    saveJSON(NOTES_KEY, notes);
  };
  return (
    <div>
      {TASK_ITEMS.map((text, i) => (
        <label className="lab-check-row" key={text}>
          <input
            type="checkbox"
            checked={!!checked[i]}
            onChange={() => toggle(i)}
          />{" "}
          {t(text)}
        </label>
      ))}
    </div>
  );
}

export function Quiz() {
  const t = useTranslator();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const finished = index >= QUIZ.length;
  useEffect(() => {
    if (finished)
      saveJSON(QUIZ_KEY, { score, total: QUIZ.length, at: Date.now() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);
  if (finished) {
    return (
      <div>
        <div className="lab-assessment-score">
          {score} / {QUIZ.length}
        </div>
        <p className="lab-help">{t("Your score is saved in this browser.")}</p>
        <SecondaryButton
          onClick={() => {
            setIndex(0);
            setScore(0);
            setChosen(null);
          }}
        >
          {t("Restart")}
        </SecondaryButton>
      </div>
    );
  }
  const q = QUIZ[index];
  return (
    <div>
      <span className="lab-step-counter">
        {t("QUESTION")} {index + 1} / {QUIZ.length}
      </span>
      <h3 style={{ fontSize: 14, margin: "10px 0" }}>{t(q.q)}</h3>
      <div className="lab-quiz-options">
        {q.a.map((opt, j) => {
          const cls =
            chosen === null
              ? ""
              : j === q.correct
                ? " correct"
                : chosen === j
                  ? " wrong"
                  : "";
          return (
            <button
              key={opt}
              type="button"
              className={`lab-quiz-option${cls}`}
              disabled={chosen !== null}
              onClick={() => {
                setChosen(j);
                if (j === q.correct) setScore((s) => s + 1);
              }}
            >
              <span>{j + 1}</span>
              {t(opt)}
            </button>
          );
        })}
      </div>
      <Feedback ok={null}>{chosen !== null ? t(q.why) : ""}</Feedback>
      {chosen !== null && (
        <PrimaryButton
          onClick={() => {
            setIndex((i) => i + 1);
            setChosen(null);
          }}
        >
          {t("Next question →")}
        </PrimaryButton>
      )}
    </div>
  );
}

export function Checkout() {
  const t = useTranslator();
  const [qty, setQty] = useState("2");
  const [price, setPrice] = useState("1");
  const [result, setResult] = useState<ApiResult | null>(null);
  return (
    <div>
      <FieldRow>
        <Field label={t("Quantity")}>
          <input value={qty} onChange={(e) => setQty(e.target.value)} />
        </Field>
        <Field label={t("Client-side price — the server ignores this")}>
          <input value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
      </FieldRow>
      <ButtonRow>
        <Chip
          onClick={() => {
            setQty("2");
            setPrice("1");
          }}
        >
          price=1
        </Chip>
        <Chip
          onClick={() => {
            setQty("-2");
            setPrice("50000");
          }}
        >
          quantity=-2
        </Chip>
      </ButtonRow>
      <ButtonRow>
        <PrimaryButton
          onClick={async () =>
            setResult(
              await apiCall("POST", "/api/lab/checkout", {
                quantity: Number(qty),
                price: Number(price),
              }),
            )
          }
        >
          {t("Submit checkout")}
        </PrimaryButton>
      </ButtonRow>
      <ResponseConsole result={result} />
    </div>
  );
}

const FINAL_DEFENSES = [
  "Parameterized query / prepared statement",
  "Context-appropriate output encoding (e.g. textContent)",
  "An object-level authorization check on every request",
];
const FINAL_ROWS: [string, string][] = [
  ["SQL Injection", FINAL_DEFENSES[0]],
  ["XSS", FINAL_DEFENSES[1]],
  ["IDOR", FINAL_DEFENSES[2]],
];

export function FinalQuiz() {
  const t = useTranslator();
  const [values, setValues] = useState<string[]>(() =>
    FINAL_ROWS.map(() => ""),
  );
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const check = () => {
    const correct = values.filter((v, i) => v === FINAL_ROWS[i][1]).length;
    const all = correct === FINAL_ROWS.length;
    setFeedback({
      ok: all,
      text: all
        ? t("✓ You matched the correct defense to every vulnerability.")
        : t("{correct} / {total} correct.", {
            correct,
            total: FINAL_ROWS.length,
          }),
    });
  };
  return (
    <div>
      {FINAL_ROWS.map((row, i) => (
        <div className="lab-match-row" key={row[0]}>
          <span>{row[0]}</span>
          <select
            value={values[i]}
            onChange={(e) =>
              setValues((v) =>
                v.map((cur, j) => (j === i ? e.target.value : cur)),
              )
            }
          >
            <option value="">{t("— choose —")}</option>
            {FINAL_DEFENSES.map((d) => (
              <option key={d} value={d}>
                {t(d)}
              </option>
            ))}
          </select>
        </div>
      ))}
      <PrimaryButton onClick={check}>{t("Check")}</PrimaryButton>
      <Feedback ok={feedback?.ok ?? null}>{feedback?.text ?? ""}</Feedback>
    </div>
  );
}

const WORKSHEET_FIELDS = [
  "Frontend",
  "Backend",
  "API",
  "Database",
  "Auth",
  "Request",
  "Response",
  "Attack surface",
];

export function Worksheet() {
  const t = useTranslator();
  const [data, setData] = useState<Record<string, string>>(() =>
    loadJSON(WORKSHEET_KEY, {}),
  );
  return (
    <div>
      {WORKSHEET_FIELDS.map((f) => (
        <Field label={t(f)} key={f}>
          <textarea
            placeholder={t("Note an observed fact, or mark it 'unknown'")}
            value={data[f] ?? ""}
            onChange={(e) => {
              const next = { ...data, [f]: e.target.value };
              setData(next);
              saveJSON(WORKSHEET_KEY, next);
            }}
          />
        </Field>
      ))}
      <ButtonRow>
        <PrimaryButton
          onClick={() => {
            const md =
              t("# Architecture report\n\n") +
              WORKSHEET_FIELDS.map(
                (f) => `## ${t(f)}\n\n${data[f] || t("(not written)")}\n`,
              ).join("\n");
            downloadText("security-lab-report.md", md);
          }}
        >
          {t("Download as Markdown ↓")}
        </PrimaryButton>
      </ButtonRow>
    </div>
  );
}

const TEACHBACK_ITEMS = [
  "I explained the browser → backend → database flow.",
  "I explained the difference between authentication and authorization.",
  "I explained the root cause of one vulnerability.",
];

export function Teachback() {
  const t = useTranslator();
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const start = () => {
    setRunning(true);
    setRemaining(60);
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timer);
          setRunning(false);
          showToast(t("Time's up."));
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };
  return (
    <div>
      <div className="lab-assessment-score">{remaining}s</div>
      <ButtonRow>
        <PrimaryButton onClick={start} disabled={running}>
          {t("Start the timer")}
        </PrimaryButton>
      </ButtonRow>
      {TEACHBACK_ITEMS.map((item) => (
        <label className="lab-check-row" key={item}>
          <input type="checkbox" /> {t(item)}
        </label>
      ))}
    </div>
  );
}

export const PRACTICE_RENDERERS: Record<
  string,
  ComponentType<RendererProps>
> = {
  flow: Flow,
  order: Order,
  classify: Classify,
  match: Match,
  frontend: FrontendDemo,
  auth: AuthConsole,
  request: RequestConsole,
  status: StatusConsole,
  validate: Validate,
  jwt: Jwt,
  cookies: Cookies,
  database: DatabaseView,
  sqlcrud: SqlCrud,
  sql: Sql,
  xss: Xss,
  idor: Idor,
  surface: Surface,
  investigate: Investigate,
  tasks: Tasks,
  quiz: Quiz,
  checkout: Checkout,
  finalquiz: FinalQuiz,
  worksheet: Worksheet,
  teachback: Teachback,
};
