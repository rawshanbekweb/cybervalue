"use client";

// Lessons 7–8: kinds of addresses and reading ipconfig.

import { useId, useState } from "react";
import { Check, X } from "lucide-react";
import {
  classify,
  KIND_LABEL,
  parseIp,
  type Kind,
  type Text,
} from "@/lib/network/ip";
import { useT } from "./use-t";

const KINDS: Kind[] = ["private", "public", "loopback", "link-local"];

export function ClassifyWidget({
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

export function IpconfigWidget({
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
