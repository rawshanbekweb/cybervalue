"use client";

import { useState } from "react";
import { MonitorDot, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/siem/curriculum";
import {
  allMapped,
  answersRight,
  FIELDS,
  GROUPS,
  mappedRight,
  query,
  RAWS,
  search,
  type Filter,
  type Group,
  type Mapping,
} from "@/lib/siem/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./siem.css";

// Academy Intermediate · Logs and SIEM: map three log formats onto one schema,
// then search across them for a password-spraying attack.
export function Siem() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("BLUE TEAM · MODULE 1")}
      title={t("Logs and SIEM.")}
      subtitle={t("Every source in one place, in one language.")}
      description={t(
        "Match each question to the log that answers it, map sshd, JSON and Windows lines onto one schema, keep clocks and copies straight, search across sources for a password-spraying attack, read a SIEM query, and keep dashboards and sources useful.",
      )}
      badge={t("SOC / LAB")}
      icon={<MonitorDot size={22} />}
      checkpoints={["siem-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "normalise":
            return <NormaliseWidget {...props} />;
          case "search":
            return <SearchWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Pick source.ip and user.name out of three differently written lines. */
function NormaliseWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [maps, setMaps] = useState<Record<string, Mapping>>({});
  const solved = allMapped(maps);
  return (
    <div className="nl-card cb-card">
      {RAWS.map((raw) => {
        const m = maps[raw.id] ?? {};
        const done = mappedRight(raw, m);
        return (
          <fieldset key={raw.id} className="sm-raw">
            <legend>
              <code>{raw.name}</code>
              {done && (
                <ShieldCheck
                  size={14}
                  className="sm-done"
                  aria-label={t("Mapped")}
                />
              )}
            </legend>
            <pre className="al-code sm-line" tabIndex={0}>
              {raw.line}
            </pre>
            <div className="cb-grid">
              {FIELDS.map((f) => (
                <label key={f} className="cb-field">
                  <code>{f}</code>
                  <select
                    value={m[f] ?? ""}
                    onChange={(e) => {
                      const next = {
                        ...maps,
                        [raw.id]: { ...m, [f]: e.target.value },
                      };
                      setMaps(next);
                      onSolved(allMapped(next));
                    }}
                  >
                    <option value="">{t("Choose a value")}</option>
                    {raw.tokens.map((tok) => (
                      <option key={tok} value={tok}>
                        {tok}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Three formats, one schema: all three failures came from the same address, against three different accounts.",
          )}
        </p>
      )}
    </div>
  );
}

/** Filter and group the normalised events, then name the attacker. */
function SearchWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [filter, setFilter] = useState<Filter>("all");
  const [by, setBy] = useState<Group>("user");
  const [ip, setIp] = useState("");
  const [account, setAccount] = useState("");
  const rows = search(filter, by);
  const filters: Record<Filter, string> = {
    all: t("All events"),
    failure: t("Failures"),
    success: t("Successes"),
  };
  const groups: Record<Group, string> = {
    user: "user.name",
    ip: "source.ip",
    source: "event.dataset",
  };
  const answer = (nextIp: string, nextAccount: string) => {
    setIp(nextIp);
    setAccount(nextAccount);
    onSolved(answersRight(nextIp, nextAccount));
  };
  return (
    <div className="nl-card cb-card">
      <fieldset className="br-modes">
        <legend>event.outcome</legend>
        {(["all", "failure", "success"] as const).map((f) => (
          <label key={f} className={`br-mode${filter === f ? " on" : ""}`}>
            <input
              type="radio"
              name="sm-filter"
              checked={filter === f}
              onChange={() => setFilter(f)}
            />
            {filters[f]}
          </label>
        ))}
      </fieldset>
      <fieldset className="br-modes">
        <legend>{t("Group by")}</legend>
        {GROUPS.map((g) => (
          <label key={g} className={`br-mode${by === g ? " on" : ""}`}>
            <input
              type="radio"
              name="sm-by"
              checked={by === g}
              onChange={() => setBy(g)}
            />
            <code>{groups[g]}</code>
          </label>
        ))}
      </fieldset>
      <p className="cb-out">
        <code>{query(filter, by)}</code>
      </p>
      <div className="sm-table" tabIndex={0}>
        <table className="ui-cases sm-cases" aria-live="polite">
          <thead>
            <tr>
              <th scope="col">
                <code>{groups[by]}</code>
              </th>
              <th scope="col">{t("Events")}</th>
              <th scope="col">{t("Sources")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.value}>
                <th scope="row">
                  <code>{r.value}</code>
                </th>
                <td>{r.count}</td>
                <td>{r.sources}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="cb-grid">
        <label className="cb-field">
          {t("The attacker’s IP address")}
          <input
            value={ip}
            maxLength={40}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => answer(e.target.value, account)}
          />
        </label>
        <label className="cb-field">
          {t("The account they got into")}
          <input
            value={account}
            maxLength={40}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            onChange={(e) => answer(ip, e.target.value)}
          />
        </label>
      </div>
      {answersRight(ip, account) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "One address, nine failures on three systems, then dilnoza’s login succeeded. Reset that password and block the address.",
          )}
        </p>
      )}
    </div>
  );
}
