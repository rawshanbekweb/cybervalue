"use client";

import { useState } from "react";
import { Check, KeyRound, ShieldCheck, Skull, X } from "lucide-react";
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
} from "@/lib/access-control/curriculum";
import {
  ATTACK_LABEL,
  ATTACKS,
  attempts,
  check,
  checkerSafe,
  decode,
  FACTOR_LABEL,
  FACTORS,
  getOrder,
  ME,
  stops,
  type Checker,
  type Factor,
} from "@/lib/access-control/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "./access-control.css";

/** The lab's clock for token expiry, fixed so the lesson reads the same. */
const NOW = 1_800_000_000;

// Academy Intermediate · Access control: who you are and what you may do,
// on pretend services that answer in the page and send nothing anywhere.
export function AccessControl() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("WEB APPLICATION SECURITY · MODULE 4")}
      title={t("Access control.")}
      subtitle={t("Check who it is, and what they may touch.")}
      description={t(
        "Open someone else’s order by changing a number and close the gap, forge a JWT and set the server up to refuse it, and choose a second factor that stops a fake sign-in page.",
      )}
      badge={t("ACCESS / LAB")}
      icon={<KeyRound size={22} />}
      checkpoints={["access-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "idor":
            return <IdorWidget {...props} />;
          case "jwt":
            return <JwtWidget {...props} />;
          case "mfa":
            return <MfaWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** The orders API, with and without the owner check. */
function IdorWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [id, setId] = useState("1041");
  const [checkOwner, setCheckOwner] = useState(false);
  const [sawLeak, setSawLeak] = useState(false);
  const reply = getOrder(Number(id), ME, checkOwner);
  const update = (nextId: string, nextCheck: boolean) => {
    const r = getOrder(Number(nextId), ME, nextCheck);
    const saw = sawLeak || r.leak;
    setSawLeak(saw);
    // Solved once a leak was seen and the same kind of request, for
    // someone else's order, is now refused.
    const other = getOrder(Number(nextId), ME, false);
    onSolved(saw && nextCheck && other.leak && r.status === 404);
  };
  return (
    <div className="nl-card cb-card">
      <div className="cb-grid">
        <label className="cb-field">
          {t("Order number")}
          <input
            inputMode="numeric"
            value={id}
            maxLength={6}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              setId(v);
              update(v, checkOwner);
            }}
          />
        </label>
        <label className="ui-switch">
          <input
            type="checkbox"
            checked={checkOwner}
            onChange={(e) => {
              setCheckOwner(e.target.checked);
              update(id, e.target.checked);
            }}
          />
          {t("Check the owner on the server")}
        </label>
      </div>
      <pre className="ui-query" tabIndex={0}>
        {`GET /api/orders/${id || "…"}\nCookie: session=… (${ME})\n\n`}
        {checkOwner
          ? "SELECT * FROM orders WHERE id = ? AND owner = ?"
          : "SELECT * FROM orders WHERE id = ?"}
      </pre>
      <div
        aria-live="polite"
        className={`ac-reply ${reply.leak ? "bad" : "ok"}`}
      >
        <strong>
          HTTP {reply.status}{" "}
          {reply.status === 200
            ? "OK"
            : reply.status === 404
              ? "Not Found"
              : "Unauthorized"}
        </strong>
        {reply.order ? (
          <ul>
            <li>
              {t("Order owner")}: <code>{reply.order.owner}</code>
            </li>
            <li>
              {t("Item")}: {text(reply.order.item)}
            </li>
            <li>
              {t("Total")}:{" "}
              {reply.order.total.toLocaleString("en").replace(/,/g, " ")}{" "}
              {t("sum")}
            </li>
          </ul>
        ) : (
          <p>{t("No order is shown.")}</p>
        )}
        {reply.leak && (
          <p className="nl-fail">
            <Skull size={15} aria-hidden="true" />{" "}
            {t(
              "This is another person’s order: the server checked only that you are signed in.",
            )}
          </p>
        )}
        {checkOwner &&
          reply.status === 404 &&
          getOrder(Number(id), ME, false).leak && (
            <p className="nl-pass">
              <ShieldCheck size={15} aria-hidden="true" />{" "}
              {t(
                "Refused: the order is not yours, and the reply does not even say it exists.",
              )}
            </p>
          )}
      </div>
    </div>
  );
}

/** Two forged tokens against a server whose checks can be switched. */
function JwtWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [role, setRole] = useState("admin");
  const [server, setServer] = useState<Checker>({
    verify: false,
    allowNone: true,
  });
  const change = (next: Checker) => {
    setServer(next);
    onSolved(checkerSafe(next, NOW));
  };
  const LABEL = {
    real: t("Ali’s real token (role: student)"),
    edited: t("Edited role, old signature kept"),
    none: t("Edited role, alg: none and no signature"),
  };
  return (
    <div className="nl-card cb-card">
      <div className="cb-grid">
        <label className="cb-field">
          {t("Role Ali writes in")}
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">admin</option>
            <option value="teacher">teacher</option>
          </select>
        </label>
        <fieldset className="br-directives">
          <legend>{t("The server’s token check")}</legend>
          <label className={`br-mode${server.verify ? " on" : ""}`}>
            <input
              type="checkbox"
              checked={server.verify}
              onChange={(e) => change({ ...server, verify: e.target.checked })}
            />
            {t("Verify the signature")}
          </label>
          <label className={`br-mode${server.allowNone ? " on" : ""}`}>
            <input
              type="checkbox"
              checked={server.allowNone}
              onChange={(e) =>
                change({ ...server, allowNone: e.target.checked })
              }
            />
            {t("Take the algorithm from the token (alg: none too)")}
          </label>
        </fieldset>
      </div>
      <div className="br-attempts" aria-live="polite">
        {attempts(role, NOW).map((a) => {
          const v = check(a.token, server, NOW);
          const d = decode(a.token)!;
          const good = v.accepted === (a.id === "real");
          return (
            <div key={a.id} className={`br-attempt ${good ? "ok" : "bad"}`}>
              <strong>
                {a.id === "real" ? (
                  <KeyRound size={16} aria-hidden="true" />
                ) : (
                  <Skull size={16} aria-hidden="true" />
                )}{" "}
                {LABEL[a.id]}
              </strong>
              <code className="ac-token">{a.token || "—"}</code>
              <ul>
                <li>
                  <code>{JSON.stringify(d.header)}</code>
                </li>
                <li>
                  <code>{JSON.stringify(d.payload)}</code>
                </li>
                <li>
                  {t("Signature")}: {d.signature ? t("present") : t("none")}
                </li>
                <li>
                  <strong>{v.accepted ? t("Accepted.") : t("Refused.")}</strong>{" "}
                  {text(v.why)}{" "}
                  {good ? (
                    <Check size={14} aria-label={t("As it should be")} />
                  ) : (
                    <X size={14} aria-label={t("Not as it should be")} />
                  )}
                </li>
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** A way of signing in, weighed against four attacks. */
function MfaWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [factor, setFactor] = useState<Factor>("password");
  return (
    <div className="nl-card cb-card">
      <fieldset className="br-modes">
        <legend>{t("How the employee signs in")}</legend>
        {FACTORS.map((f) => (
          <label key={f} className={`br-mode${factor === f ? " on" : ""}`}>
            <input
              type="radio"
              name="ac-factor"
              checked={factor === f}
              onChange={() => {
                setFactor(f);
                onSolved(ATTACKS.every((a) => stops(f, a)));
              }}
            />
            {text(FACTOR_LABEL[f])}
          </label>
        ))}
      </fieldset>
      <table className="ui-cases" aria-live="polite">
        <thead>
          <tr>
            <th scope="col">{t("Attack")}</th>
            <th scope="col">{t("Result")}</th>
          </tr>
        </thead>
        <tbody>
          {ATTACKS.map((a) => {
            const stopped = stops(factor, a);
            return (
              <tr key={a} className={stopped ? "ok" : "bad"}>
                <td>{text(ATTACK_LABEL[a])}</td>
                <td>
                  {stopped ? (
                    <>
                      <Check size={14} aria-hidden="true" /> {t("Stopped")}
                    </>
                  ) : (
                    <>
                      <X size={14} aria-hidden="true" /> {t("Gets in")}
                    </>
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
