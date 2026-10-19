"use client";
import type { Translator } from "@/lib/i18n/core";

import { useId, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  CIPHER_ANSWER,
  CIPHER_TEXT,
  CTF_BASE64,
  CTF_FLAGS,
  CTF_PAGE_SOURCE,
  CTF_REVERSED,
  ETHICS,
  FOOTPRINT,
  FOOTPRINT_POST,
  PASSWORD_TRIES,
  PHISHING,
  PHISHING_PASS,
  type Flag,
} from "@/lib/junior/content";
import {
  STRONG_SECONDS,
  base64Decode,
  caesar,
  estimateStrength,
  humanize,
  normalizeAnswer,
  type Duration,
  type StrengthIssue,
} from "@/lib/junior/logic";

type PanelProps = { done: boolean; onComplete: () => void };

function Finish({
  ready,
  done,
  onComplete,
}: {
  ready: boolean;
  done: boolean;
  onComplete: () => void;
}) {
  const { t } = useT();
  if (done)
    return (
      <p className="jr-done" role="status">
        <CheckCircle2 size={18} aria-hidden="true" />
        {t("Mission complete!")}
      </p>
    );
  return (
    <button
      type="button"
      className="button button-primary"
      disabled={!ready}
      onClick={onComplete}
    >
      {t("Finish the mission")}
    </button>
  );
}

function Verdict({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <p className={ok ? "jr-verdict jr-ok" : "jr-verdict jr-bad"}>
      {ok ? (
        <CheckCircle2 size={16} aria-hidden="true" />
      ) : (
        <XCircle size={16} aria-hidden="true" />
      )}
      <span>{children}</span>
    </p>
  );
}

// Two-option answer shared by the phishing and ethics missions.
function Pick({
  name,
  legend,
  value,
  options,
  disabled,
  onChange,
}: {
  name: string;
  legend: string;
  value: boolean | undefined;
  options: [string, string];
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <fieldset className="jr-pick" disabled={disabled}>
      <legend className="visually-hidden">{legend}</legend>
      {([true, false] as const).map((option, index) => (
        <label key={String(option)} className={value === option ? "on" : ""}>
          <input
            type="radio"
            name={name}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          {options[index]}
        </label>
      ))}
    </fieldset>
  );
}

// 1 · Passwords --------------------------------------------------------------

function durationText(duration: Duration, t: Translator) {
  const { unit, value } = duration;
  switch (unit) {
    case "instant":
      return t("instantly");
    case "seconds":
      return t("{value} seconds", { value });
    case "minutes":
      return t("{value} minutes", { value });
    case "hours":
      return t("{value} hours", { value });
    case "days":
      return t("{value} days", { value });
    case "years":
      return t("{value} years", { value });
    case "millennia":
      return t("{value} thousand+ years", { value });
  }
}

export function PasswordMission({ done, onComplete }: PanelProps) {
  const { t, text } = useT();
  const id = useId();
  const [value, setValue] = useState("");
  const strength = estimateStrength(value);
  const duration = humanize(strength.seconds);
  const strong = value !== "" && strength.seconds >= STRONG_SECONDS;
  const share = Math.min(
    100,
    Math.max(
      value ? 4 : 0,
      (Math.log10(Math.max(strength.seconds, 1)) / Math.log10(STRONG_SECONDS)) *
        100,
    ),
  );
  const tips: Record<StrengthIssue, string> = {
    common: t(
      "This one is on the lists everybody knows: an attacker tries it first.",
    ),
    short: t("Too short. Length is what matters most."),
    sequence: t("Runs like abc, 123 or qwe are easy to guess."),
    repeats: t("Repeated characters add almost no strength."),
    "one-class": t("Only lowercase letters: make it longer or add more words."),
  };
  return (
    <div className="jr-panel">
      <p className="jr-lead">
        {t(
          "Type a password below and see how long a computer would need to crack it. The estimate assumes an attack of 10 billion guesses per second.",
        )}
      </p>
      <p className="jr-note">
        {t(
          "Never type your real password! Use made-up ones here. What you type is never sent or stored.",
        )}
      </p>
      <label htmlFor={id} className="jr-label">
        {t("Test password")}
      </label>
      <input
        id={id}
        className="jr-input jr-plain"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoComplete="off"
        spellCheck={false}
        placeholder={t("e.g. apple-cloud-blue-rock")}
      />
      <div className="jr-meter" aria-hidden="true">
        <span
          style={{ width: `${share}%` }}
          className={strong ? "good" : share > 50 ? "mid" : "low"}
        />
      </div>
      <p className="jr-result" aria-live="polite">
        {value
          ? t("Time to crack: {durationText}", {
              durationText: durationText(duration, t),
            })
          : t("Start typing a password.")}
      </p>
      {value && strength.issues.length > 0 && (
        <ul className="jr-tips">
          {strength.issues.map((issue) => (
            <li key={issue}>{tips[issue]}</li>
          ))}
        </ul>
      )}
      <h3 className="jr-sub">{t("Try these")}</h3>
      <div className="jr-chips">
        {PASSWORD_TRIES.map((item) => (
          <button
            key={item.value}
            type="button"
            className="jr-chip"
            onClick={() => setValue(item.value)}
            title={text(item.note)}
          >
            {item.value}
          </button>
        ))}
      </div>
      <p className="jr-note">
        {t(
          "Tip: 5 or more random words, or 14+ mixed characters. A different password for every site, and turn on two-step verification where you can.",
        )}
      </p>
      <Finish ready={strong} done={done} onComplete={onComplete} />
    </div>
  );
}

// 2 · Phishing ---------------------------------------------------------------

export function PhishingMission({ done, onComplete }: PanelProps) {
  const { t, text } = useT();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);
  const score = PHISHING.filter(
    (item) => answers[item.id] === item.phishing,
  ).length;
  const passed = checked && score >= PHISHING_PASS;
  return (
    <div className="jr-panel">
      <p className="jr-lead">
        {t("Read each message and decide: is it phishing (a scam) or safe?")}
      </p>
      <ol className="jr-cards">
        {PHISHING.map((item) => (
          <li key={item.id} className="jr-card">
            <div className="jr-meta">
              <strong>{item.from}</strong>
              <span>{text(item.channel)}</span>
            </div>
            <p>{text(item.body)}</p>
            {item.link && <code className="jr-link">{item.link}</code>}
            <Pick
              name={`phish-${item.id}`}
              legend={text(item.body)}
              value={answers[item.id]}
              options={[t("Phishing"), t("Safe")]}
              disabled={checked}
              onChange={(value) =>
                setAnswers((current) => ({ ...current, [item.id]: value }))
              }
            />
            {checked && (
              <Verdict ok={answers[item.id] === item.phishing}>
                {text(item.clue)}
              </Verdict>
            )}
          </li>
        ))}
      </ol>
      <div className="jr-actions">
        {!checked ? (
          <button
            type="button"
            className="button button-secondary"
            disabled={Object.keys(answers).length < PHISHING.length}
            onClick={() => setChecked(true)}
          >
            {t("Check my answers")}
          </button>
        ) : (
          <>
            <p className="jr-result" aria-live="polite">
              {t("Score: {score} / {length}", {
                score,
                length: PHISHING.length,
              })}
            </p>
            {!passed && (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setAnswers({});
                  setChecked(false);
                }}
              >
                {t("Try again")}
              </button>
            )}
          </>
        )}
        <Finish ready={passed} done={done} onComplete={onComplete} />
      </div>
    </div>
  );
}

// 3 · Caesar cipher ----------------------------------------------------------

export function CipherMission({ done, onComplete }: PanelProps) {
  const { t } = useT();
  const sliderId = useId();
  const answerId = useId();
  const [shift, setShift] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const solved = normalizeAnswer(answer) === CIPHER_ANSWER;
  return (
    <div className="jr-panel">
      <p className="jr-lead">
        {t(
          "In a Caesar cipher every letter is moved a few steps along the alphabet. With 3 steps, A becomes D. Find the right shift and the message becomes readable.",
        )}
      </p>
      <p className="jr-label">{t("Encrypted message")}</p>
      <code className="jr-code">{CIPHER_TEXT}</code>
      <label htmlFor={sliderId} className="jr-label">
        {t("Shift back by:")} <strong>{shift}</strong>
      </label>
      <input
        id={sliderId}
        className="jr-range"
        type="range"
        min={0}
        max={25}
        value={shift}
        onChange={(event) => setShift(Number(event.target.value))}
      />
      <p className="jr-label">{t("Result")}</p>
      <code className="jr-code jr-live" aria-live="polite">
        {caesar(CIPHER_TEXT, -shift)}
      </code>
      <label htmlFor={answerId} className="jr-label">
        {t("The hidden word in the message:")}
      </label>
      <div className="jr-row">
        <input
          id={answerId}
          className="jr-input jr-plain"
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value);
            setChecked(false);
          }}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className="button button-secondary"
          onClick={() => setChecked(true)}
        >
          {t("Check")}
        </button>
      </div>
      {checked && (
        <Verdict ok={solved}>
          {solved
            ? t(
                "Correct! The shift was 7. A computer breaks this in a second, which is why modern ciphers are far more complex.",
              )
            : t("Not yet. Move the slider until readable text appears.")}
        </Verdict>
      )}
      <Finish ready={solved} done={done} onComplete={onComplete} />
    </div>
  );
}

// 4 · Digital footprint ------------------------------------------------------

export function FootprintMission({ done, onComplete }: PanelProps) {
  const { t, text } = useT();
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);
  const wrong = FOOTPRINT.filter(
    (item) => Boolean(marked[item.id]) !== item.risky,
  ).length;
  const passed = checked && wrong === 0;
  return (
    <div className="jr-panel">
      <p className="jr-lead">
        {t(
          "This post is on a public profile. What could a stranger learn from it? Tick every detail you think is risky.",
        )}
      </p>
      <p className="jr-post">{text(FOOTPRINT_POST)}</p>
      <ul className="jr-checks">
        {FOOTPRINT.map((item) => {
          const right = Boolean(marked[item.id]) === item.risky;
          return (
            <li key={item.id}>
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(marked[item.id])}
                  disabled={passed}
                  onChange={(event) => {
                    setMarked((current) => ({
                      ...current,
                      [item.id]: event.target.checked,
                    }));
                    setChecked(false);
                  }}
                />
                <span>{text(item.text)}</span>
              </label>
              {checked && <Verdict ok={right}>{text(item.why)}</Verdict>}
            </li>
          );
        })}
      </ul>
      <div className="jr-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={() => setChecked(true)}
        >
          {t("Check")}
        </button>
        {checked && (
          <p className="jr-result" aria-live="polite">
            {wrong === 0
              ? t("All correct!")
              : t("{wrong} item(s) marked wrongly.", { wrong })}
          </p>
        )}
        <Finish ready={passed} done={done} onComplete={onComplete} />
      </div>
    </div>
  );
}

// 5 · First CTF --------------------------------------------------------------

function FlagCard({
  flag,
  index,
  solved,
  onSolve,
  children,
}: {
  flag: Flag;
  index: number;
  solved: boolean;
  onSolve: () => void;
  children: React.ReactNode;
}) {
  const { t, text } = useT();
  const id = useId();
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const [hint, setHint] = useState(false);
  const submit = () => {
    if (normalizeAnswer(value) === normalizeAnswer(flag.flag)) {
      setWrong(false);
      onSolve();
    } else setWrong(true);
  };
  return (
    <li className="jr-card">
      <h3 className="jr-sub">
        {index + 1}. {text(flag.title)}
      </h3>
      <p>{text(flag.task)}</p>
      {children}
      {solved ? (
        <Verdict ok>
          {t("Flag accepted:")} <code>{flag.flag}</code>
        </Verdict>
      ) : (
        <>
          <label htmlFor={id} className="jr-label">
            {t("Flag")}
          </label>
          <div className="jr-row">
            <input
              id={id}
              className="jr-input"
              value={value}
              placeholder="CV{...}"
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => {
                setValue(event.target.value);
                setWrong(false);
              }}
              onKeyDown={(event) => event.key === "Enter" && submit()}
            />
            <button
              type="button"
              className="button button-secondary"
              onClick={submit}
            >
              {t("Submit")}
            </button>
          </div>
          {wrong && (
            <Verdict ok={false}>{t("That’s not the flag. Try again.")}</Verdict>
          )}
          <button
            type="button"
            className="jr-linkbtn"
            onClick={() => setHint((open) => !open)}
            aria-expanded={hint}
          >
            {hint ? t("Hide hint") : t("Hint")}
          </button>
          {hint && <p className="jr-note">{text(flag.hint)}</p>}
        </>
      )}
    </li>
  );
}

function Base64Tool() {
  const { t } = useT();
  const id = useId();
  const [value, setValue] = useState("");
  const decoded = value ? base64Decode(value) : null;
  return (
    <div className="jr-tool">
      <label htmlFor={id} className="jr-label">
        {t("Base64 decoder")}
      </label>
      <input
        id={id}
        className="jr-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      <code className="jr-code jr-live" aria-live="polite">
        {value ? (decoded ?? t("(could not decode)")) : "…"}
      </code>
    </div>
  );
}

export function CtfMission({ done, onComplete }: PanelProps) {
  const { t } = useT();
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const count = CTF_FLAGS.filter((flag) => solved[flag.id]).length;
  const markSolved = (id: string) =>
    setSolved((current) => ({ ...current, [id]: true }));
  const clue: Record<string, React.ReactNode> = {
    source: <pre className="jr-code jr-pre">{CTF_PAGE_SOURCE}</pre>,
    base64: <code className="jr-code">{CTF_BASE64}</code>,
    reverse: <code className="jr-code">{CTF_REVERSED}</code>,
  };
  return (
    <div className="jr-panel">
      <p className="jr-lead">
        {t(
          "In a CTF (Capture The Flag) contest every challenge hides a “flag”. Find it, submit it, score a point. Here are 3 easy challenges.",
        )}
      </p>
      <p className="jr-result" aria-live="polite">
        {t("Flags found: {count} / 3", { count })}
      </p>
      <ol className="jr-cards">
        {CTF_FLAGS.map((flag, index) => (
          <FlagCard
            key={flag.id}
            flag={flag}
            index={index}
            solved={Boolean(solved[flag.id])}
            onSolve={() => markSolved(flag.id)}
          >
            {clue[flag.id]}
            {flag.id === "base64" && <Base64Tool />}
          </FlagCard>
        ))}
      </ol>
      <Finish
        ready={count === CTF_FLAGS.length}
        done={done}
        onComplete={onComplete}
      />
    </div>
  );
}

// 6 · Ethics -----------------------------------------------------------------

export function EthicsMission({ done, onComplete }: PanelProps) {
  const { t, text } = useT();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);
  const wrong = ETHICS.filter(
    (item) => answers[item.id] !== item.allowed,
  ).length;
  const passed = checked && wrong === 0;
  return (
    <div className="jr-panel">
      <p className="jr-lead">
        {t(
          "The ethical hacker’s golden rule: no permission, no touching. In each situation, is it okay or not?",
        )}
      </p>
      <ol className="jr-cards">
        {ETHICS.map((item) => (
          <li key={item.id} className="jr-card">
            <p>{text(item.situation)}</p>
            <Pick
              name={`ethics-${item.id}`}
              legend={text(item.situation)}
              value={answers[item.id]}
              options={[t("Okay"), t("Not okay")]}
              disabled={passed}
              onChange={(value) => {
                setAnswers((current) => ({ ...current, [item.id]: value }));
                setChecked(false);
              }}
            />
            {checked && (
              <Verdict ok={answers[item.id] === item.allowed}>
                {text(item.why)}
              </Verdict>
            )}
          </li>
        ))}
      </ol>
      <div className="jr-actions">
        <button
          type="button"
          className="button button-secondary"
          disabled={Object.keys(answers).length < ETHICS.length}
          onClick={() => setChecked(true)}
        >
          {t("Check my answers")}
        </button>
        <Finish ready={passed} done={done} onComplete={onComplete} />
      </div>
    </div>
  );
}
