"use client";
import { useId, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslator } from "@/components/locale-provider";

export function CopyField({ label, value }: { label: string; value: string }) {
  const t = useTranslator();
  const id = useId();
  const [copied, setCopied] = useState(false);
  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      <div className="admin-copy">
        <input
          id={id}
          className="admin-input"
          readOnly
          value={value}
          onFocus={(event) => event.target.select()}
        />
        <button
          type="button"
          className="button button-secondary"
          onClick={async () => {
            await navigator.clipboard?.writeText(value).catch(() => null);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? (
            <Check size={15} aria-hidden="true" />
          ) : (
            <Copy size={15} aria-hidden="true" />
          )}
          {copied ? t("Copied") : t("Copy")}
        </button>
      </div>
    </div>
  );
}
