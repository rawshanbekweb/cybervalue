"use client";

import { useState } from "react";
import { Check, LogIn, ShieldCheck, TextCursorInput, X } from "lucide-react";
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
} from "@/lib/untrusted-input/curriculum";
import {
  ATTR_TEMPLATE,
  breaksAttribute,
  breaksText,
  checkPattern,
  download,
  escapeHtml,
  escapeTags,
  FILE_ROOT,
  loggedInAs,
  loginQuery,
  PARAM_QUERY,
  runParameterized,
  runSql,
  TEXT_TEMPLATE,
  USERNAME_CASES,
  USERNAME_RULE,
  USERS,
  type SqlResult,
  type User,
} from "@/lib/untrusted-input/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "./untrusted-input.css";

// Academy Intermediate · Untrusted input: injection and its defences on a
// pretend back end that runs in the browser.
export function UntrustedInput() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("WEB APPLICATION SECURITY · MODULE 2")}
      title={t("Untrusted input.")}
      subtitle={t("Keep data from turning into code.")}
      description={t(
        "Break a login query with one quote, fix it with parameters, check file paths, write an allowlist and encode output for its context.",
      )}
      badge={t("INPUT / LAB")}
      icon={<TextCursorInput size={22} />}
      checkpoints={["input-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "sql":
            return <SqlWidget goal={widget.goal} {...props} />;
          case "param":
            return <ParamWidget {...props} />;
          case "path":
            return <PathWidget filter={widget.filter} {...props} />;
          case "regex":
            return <RegexWidget {...props} />;
          case "encode":
            return <EncodeWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

const ADMIN = USERS[0];

function LoginFields({
  name,
  pass,
  setName,
  setPass,
}: {
  name: string;
  pass: string;
  setName: (v: string) => void;
  setPass: (v: string) => void;
}) {
  const { t } = useT();
  return (
    <div className="cb-grid">
      <label className="cb-field">
        {t("Username")}
        <input
          value={name}
          maxLength={60}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="cb-field">
        {t("Password")}
        <input
          value={pass}
          maxLength={60}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          onChange={(e) => setPass(e.target.value)}
        />
      </label>
    </div>
  );
}

function LoginOutcome({ result }: { result: SqlResult | User[] }) {
  const { t } = useT();
  if (!Array.isArray(result) && !result.ok)
    return (
      <p className="nl-fail">
        {t("Database error")}: <code>{result.error}</code>
      </p>
    );
  const user = Array.isArray(result) ? (result[0] ?? null) : loggedInAs(result);
  return user ? (
    <p className={user.role === "admin" ? "nl-fail" : "nl-pass"}>
      <LogIn size={15} aria-hidden="true" />{" "}
      {t("Signed in as {name} ({role})", { name: user.name, role: user.role })}
    </p>
  ) : (
    <p className="cb-out">{t("Wrong username or password.")}</p>
  );
}

/** The login form whose query is glued together from the two fields. */
function SqlWidget({
  goal,
  onSolved,
}: { goal: "error" | "bypass" } & WidgetProps) {
  const { t } = useT();
  const [name, setName] = useState("ali");
  const [pass, setPass] = useState("");
  const [result, setResult] = useState<SqlResult | null>(null);
  const query = loginQuery(name, pass);
  const submit = () => {
    const next = runSql(query);
    setResult(next);
    const user = loggedInAs(next);
    onSolved(
      goal === "error"
        ? !next.ok
        : user?.name === ADMIN.name && pass !== ADMIN.pass,
    );
  };
  return (
    <div className="nl-card cb-card">
      <LoginFields
        name={name}
        pass={pass}
        setName={setName}
        setPass={setPass}
      />
      <div>
        <span className="cb-label">{t("The query the server runs")}</span>
        <pre className="ui-query" tabIndex={0}>
          {query}
        </pre>
      </div>
      <button className="nl-primary" onClick={submit}>
        <LogIn size={16} aria-hidden="true" /> {t("Sign in")}
      </button>
      <div aria-live="polite">{result && <LoginOutcome result={result} />}</div>
    </div>
  );
}

/** The same form, with a switch to a prepared statement. */
function ParamWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [name, setName] = useState("admin'--");
  const [pass, setPass] = useState("");
  const [param, setParam] = useState(false);
  const [result, setResult] = useState<SqlResult | User[] | null>(null);
  const submit = () => {
    const glued = loggedInAs(runSql(loginQuery(name, pass)));
    if (param) {
      const rows = runParameterized(name, pass);
      setResult(rows);
      // The input still breaks the old query, and the new one refuses it.
      onSolved(rows.length === 0 && glued !== null && glued.pass !== pass);
    } else {
      setResult(runSql(loginQuery(name, pass)));
      onSolved(false);
    }
  };
  return (
    <div className="nl-card cb-card">
      <LoginFields
        name={name}
        pass={pass}
        setName={setName}
        setPass={setPass}
      />
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={param}
          onChange={(e) => {
            setParam(e.target.checked);
            setResult(null);
          }}
        />
        {t("Parameterized query")}
      </label>
      <div>
        <span className="cb-label">{t("The query the server runs")}</span>
        <pre className="ui-query" tabIndex={0}>
          {param ? PARAM_QUERY : loginQuery(name, pass)}
        </pre>
        {param && (
          <dl className="ui-params">
            <div>
              <dt>?1</dt>
              <dd>
                <code>{JSON.stringify(name)}</code>
              </dd>
            </div>
            <div>
              <dt>?2</dt>
              <dd>
                <code>{JSON.stringify(pass)}</code>
              </dd>
            </div>
          </dl>
        )}
      </div>
      <button className="nl-primary" onClick={submit}>
        <LogIn size={16} aria-hidden="true" /> {t("Sign in")}
      </button>
      <div aria-live="polite">{result && <LoginOutcome result={result} />}</div>
    </div>
  );
}

/** /download?file=…, with and without the check that fixes it. */
function PathWidget({ filter, onSolved }: { filter: boolean } & WidgetProps) {
  const { t } = useT();
  const [file, setFile] = useState("menu.txt");
  const [sent, setSent] = useState<ReturnType<typeof download> | null>(null);
  const send = () => {
    const next = download(file, filter);
    setSent(next);
    onSolved(next.outside && next.body !== null);
  };
  return (
    <div className="nl-card cb-card">
      <label className="cb-field">
        {t("File name")}
        <input
          value={file}
          maxLength={80}
          spellCheck={false}
          autoCapitalize="off"
          onChange={(e) => setFile(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
      </label>
      <pre className="ui-query" tabIndex={0}>
        GET /download?file={encodeURIComponent(file)}
      </pre>
      <button className="nl-primary" onClick={send}>
        {t("Download")}
      </button>
      <div aria-live="polite">
        {sent && (
          <>
            <dl className="cb-facts">
              {filter && (
                <div>
                  <dt>{t("After the filter")}</dt>
                  <dd className="cb-short">{sent.filtered || "∅"}</dd>
                </div>
              )}
              <div>
                <dt>{t("Resolved path")}</dt>
                <dd className={`cb-short ${sent.outside ? "bad" : "ok"}`}>
                  {sent.path}
                </dd>
              </div>
            </dl>
            <div className="ui-compare">
              <div>
                <span className="cb-label">{t("Without the check")}</span>
                <pre className="cb-hash" tabIndex={0}>
                  {sent.body ?? "404 Not Found"}
                </pre>
              </div>
              <div>
                <span className="cb-label">
                  {t("With the check")}{" "}
                  <code>path.startsWith(&quot;{FILE_ROOT}/&quot;)</code>
                </span>
                <pre
                  className={`cb-hash ${sent.outside ? "cb-official" : ""}`}
                  tabIndex={0}
                >
                  {sent.outside
                    ? `403 Forbidden · ${t("outside the folder")}`
                    : (sent.body ?? "404 Not Found")}
                </pre>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** The student's allowlist regex against the username cases. */
function RegexWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [pattern, setPattern] = useState("[a-z]+");
  const check = checkPattern(pattern);
  const update = (value: string) => {
    setPattern(value);
    const next = checkPattern(value);
    onSolved(
      next.ok && next.results.every((r, i) => r === USERNAME_CASES[i].ok),
    );
  };
  return (
    <div className="nl-card cb-card">
      <p className="cb-label">
        <ShieldCheck size={15} aria-hidden="true" /> {text(USERNAME_RULE)}
      </p>
      <label className="cb-field">
        {t("Regular expression")}
        <input
          value={pattern}
          maxLength={80}
          spellCheck={false}
          autoCapitalize="off"
          onChange={(e) => update(e.target.value)}
        />
      </label>
      {!check.ok && (
        <p className="nl-fail" aria-live="polite">
          {t("Invalid pattern")}: <code>{check.error}</code>
        </p>
      )}
      <table className="ui-cases">
        <thead>
          <tr>
            <th scope="col">{t("Value")}</th>
            <th scope="col">{t("Should be")}</th>
            <th scope="col">{t("Your regex")}</th>
          </tr>
        </thead>
        <tbody>
          {USERNAME_CASES.map((c, i) => {
            const got = check.ok ? check.results[i] : null;
            return (
              <tr key={i} className={got === c.ok ? "ok" : "bad"}>
                <td>
                  <code>{JSON.stringify(c.value)}</code>
                </td>
                <td>{c.ok ? t("Accepted") : t("Refused")}</td>
                <td>
                  {got === null ? "—" : got ? t("Accepted") : t("Refused")}{" "}
                  {got === c.ok ? (
                    <Check size={14} aria-label={t("Matches the rule")} />
                  ) : (
                    <X size={14} aria-label={t("Does not match the rule")} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** One name in two templates, under three kinds of encoding. */
function EncodeWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [name, setName] = useState("Ali");
  const rows = [
    { id: "raw", label: t("No encoding"), encode: (s: string) => s },
    { id: "tags", label: t("Only < and >"), encode: escapeTags },
    { id: "full", label: t("Full HTML encoding"), encode: escapeHtml },
  ];
  return (
    <div className="nl-card cb-card">
      <label className="cb-field">
        {t("Name")}
        <input
          value={name}
          maxLength={60}
          spellCheck={false}
          autoCapitalize="off"
          onChange={(e) => {
            setName(e.target.value);
            onSolved(breaksAttribute(escapeTags(e.target.value)));
          }}
        />
      </label>
      <table className="ui-cases ui-encode">
        <thead>
          <tr>
            <th scope="col">{t("Encoding")}</th>
            <th scope="col">{t("In text")}</th>
            <th scope="col">{t("In an attribute")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const value = row.encode(name);
            const text = breaksText(value);
            const attr = breaksAttribute(value);
            return (
              <tr key={row.id}>
                <th scope="row">{row.label}</th>
                <td className={text ? "bad" : "ok"}>
                  <code>{TEXT_TEMPLATE(value)}</code>
                  <small>{text ? t("New markup") : t("Stays text")}</small>
                </td>
                <td className={attr ? "bad" : "ok"}>
                  <code>{ATTR_TEMPLATE(value)}</code>
                  <small>
                    {attr ? t("Leaves the attribute") : t("Stays a value")}
                  </small>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
