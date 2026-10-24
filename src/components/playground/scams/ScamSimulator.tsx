"use client";

import { useState } from "react";
import {
  Check,
  MessageSquare,
  Phone,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import {
  LESSONS,
  PROGRESS_KEY,
  type Scenario,
  type Widget,
} from "@/lib/scams/curriculum";
import { checkMessage, type CheckResult } from "@/lib/scams/checker";
import "./scams.css";

// Firibgarlik simulyatori: everyday scams on a pretend phone, then a tool
// that looks for the same signs in a message the visitor pastes.
export function ScamSimulator() {
  const { t } = useT();
  return (
    <>
      <AnimLab
        lessons={LESSONS}
        progressKey={PROGRESS_KEY}
        eyebrow={t("DIGITAL SAFETY · FOR EVERYONE")}
        title={t("Scam simulator.")}
        subtitle={t("Spot the trick before it costs you.")}
        description={t(
          "Eight situations people in Uzbekistan meet every week: a call from “the bank”, a prize, a friend asking for money, a job, an app, a buyer and an investment. Decide what to do, then find every red flag.",
        )}
        badge={t("SCAMS / SIMULATOR")}
        icon={<ShieldAlert size={22} />}
        back={{ href: "/", label: t("Home") }}
        renderWidget={(widget: Widget, props) =>
          widget.type === "scam" ? (
            <ScamWidget scenario={widget.scenario} {...props} />
          ) : (
            <CommonWidgetView widget={widget} {...props} />
          )
        }
      />
      <MessageChecker />
    </>
  );
}

const CHANNEL_ICON = {
  call: Phone,
  sms: MessageSquare,
  telegram: Send,
  market: ShoppingBag,
} as const;

/** One conversation: choose an action, then find the red flags. */
function ScamWidget({
  scenario,
  onSolved,
}: { scenario: Scenario } & WidgetProps) {
  const { t, text } = useT();
  const flagIds = Object.keys(scenario.flags);
  const [choice, setChoice] = useState<number | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [last, setLast] = useState<{ flag?: string } | null>(null);
  const chosen = choice === null ? null : scenario.choices[choice];
  const hunting = Boolean(chosen?.right && scenario.scam);
  const Icon = CHANNEL_ICON[scenario.channel];

  const choose = (index: number) => {
    setChoice(index);
    const right = scenario.choices[index].right;
    onSolved(right && (!scenario.scam || found.length === flagIds.length));
  };
  const tap = (flag?: string) => {
    setLast({ flag });
    if (!flag || found.includes(flag)) return;
    const next = [...found, flag];
    setFound(next);
    onSolved(next.length === flagIds.length);
  };

  return (
    <div className="nl-card sc-card">
      <div className="sc-phone">
        <div className="sc-head">
          <span
            className={`sc-avatar sc-${scenario.channel}`}
            aria-hidden="true"
          >
            <Icon size={18} />
          </span>
          <span>
            <strong>{text(scenario.sender)}</strong>
            <small>{text(scenario.detail)}</small>
          </span>
        </div>
        <ol className="sc-thread" aria-label={t("Conversation")}>
          {scenario.messages.map((message, i) => (
            <li key={i} className={`sc-bubble sc-${message.from}`}>
              {message.parts.map((part, j) =>
                hunting ? (
                  <button
                    key={j}
                    type="button"
                    className={`sc-part${part.flag && found.includes(part.flag) ? " sc-found" : ""}`}
                    onClick={() => tap(part.flag)}
                  >
                    {text(part.text)}
                  </button>
                ) : (
                  <span key={j}>{text(part.text)}</span>
                ),
              )}
            </li>
          ))}
        </ol>
      </div>

      {!hunting && (
        <fieldset className="sc-choices">
          <legend>{t("What do you do?")}</legend>
          {scenario.choices.map((c, i) => (
            <button
              key={i}
              type="button"
              className={`sc-choice${choice === i ? (c.right ? " ok" : " bad") : ""}`}
              aria-pressed={choice === i}
              onClick={() => choose(i)}
            >
              {text(c.label)}
            </button>
          ))}
        </fieldset>
      )}

      <div aria-live="polite">
        {chosen && (
          <p className={chosen.right ? "nl-pass" : "nl-fail"}>
            {chosen.right ? (
              <Check size={15} aria-hidden="true" />
            ) : (
              <X size={15} aria-hidden="true" />
            )}{" "}
            {text(chosen.feedback)}
          </p>
        )}
        {chosen?.right && !scenario.scam && (
          <p className="sc-safe">
            <ShieldCheck size={16} aria-hidden="true" />{" "}
            {t("No link, no request, no pressure: this message is safe.")}
          </p>
        )}
        {hunting && (
          <>
            <p className="sc-count">
              <Search size={15} aria-hidden="true" />{" "}
              {t(
                "Now tap the suspicious parts of the conversation: {found} of {total} red flags found.",
                {
                  found: found.length,
                  total: flagIds.length,
                },
              )}
            </p>
            {last &&
              (last.flag ? (
                <p className="nl-pass sc-explain">
                  <strong>{t("Red flag:")}</strong>{" "}
                  {text(scenario.flags[last.flag])}
                </p>
              ) : (
                <p className="sc-explain">
                  {t("Nothing suspicious in this part. Look again.")}
                </p>
              ))}
          </>
        )}
      </div>
    </div>
  );
}

/** Looks for the common signs in a pasted message, in the browser only. */
function MessageChecker() {
  const { t, text } = useT();
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  return (
    <section className="sc-checker" aria-labelledby="sc-checker-title">
      <span className="eyebrow">
        <span className="status-dot" /> {t("TOOL")}
      </span>
      <h2 id="sc-checker-title">{t("Check a suspicious message")}</h2>
      <p>
        {t(
          "Paste an SMS or chat message you are not sure about. It is checked here, in your browser, and sent nowhere.",
        )}
      </p>
      <label className="cb-label" htmlFor="sc-message">
        {t("Message text")}
      </label>
      <textarea
        id="sc-message"
        className="sc-input"
        rows={5}
        maxLength={4000}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          setResult(null);
        }}
      />
      <div className="nl-task-actions">
        <button
          type="button"
          className="nl-primary"
          disabled={!message.trim()}
          onClick={() => setResult(checkMessage(message))}
        >
          <Search size={16} aria-hidden="true" /> {t("Check")}
        </button>
      </div>
      <div aria-live="polite">
        {result && (
          <div className={`sc-verdict sc-${result.verdict}`}>
            <p>
              <strong>
                {result.verdict === "danger"
                  ? t("Very likely a scam. Do not reply, pay or open links.")
                  : result.verdict === "caution"
                    ? t("Be careful: this message has signs scams use.")
                    : t("No common scam signs found.")}
              </strong>
            </p>
            {result.flags.length > 0 && (
              <ul>
                {result.flags.map((flag) => (
                  <li key={flag.id}>
                    <strong>{text(flag.title)}</strong> — <q>{flag.match}</q>
                    <br />
                    <span>{text(flag.why)}</span>
                  </li>
                ))}
              </ul>
            )}
            <small>
              {t(
                "This check only looks for common signs and can miss new tricks. When in doubt, contact the bank or person yourself through a number you already know.",
              )}
            </small>
          </div>
        )}
      </div>
    </section>
  );
}
