"use client";

import { useState, type ReactNode } from "react";
import type { ApiResult } from "./api";

export function jsonText(data: unknown): string {
  return typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

export function CodeBlock({ children }: { children: ReactNode }) {
  return <div className="lab-code-block">{children}</div>;
}

export function Pre({ data }: { data: unknown }) {
  return <pre>{jsonText(data)}</pre>;
}

export function StatusPill({ status }: { status: number }) {
  const error = status >= 400 || status === 0;
  return <span className={`lab-status-pill${error ? " error" : ""}`}>{status || "—"}</span>;
}

export function ResponseConsole({ result }: { result: ApiResult | null }) {
  const [active, setActive] = useState<"Status" | "Headers" | "Body">("Body");
  if (!result) return <p className="lab-help">No request sent yet.</p>;
  const body =
    active === "Status"
      ? { status: result.status, statusText: result.statusText, time_ms: result.ms, ...(result.error ? { error: result.error } : {}) }
      : active === "Headers"
        ? result.headers
        : result.data;
  return (
    <div>
      <div className="lab-result-header">
        <div className="lab-response-tabs">
          {(["Status", "Headers", "Body"] as const).map((tab) => (
            <button key={tab} className={tab === active ? "active" : ""} onClick={() => setActive(tab)} type="button">
              {tab}
            </button>
          ))}
        </div>
        <StatusPill status={result.status} />
      </div>
      <CodeBlock>
        <Pre data={body} />
      </CodeBlock>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="lab-field">
      <span>{label}</span>
      {children}
    </div>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="lab-field-row">{children}</div>;
}

export function ButtonRow({ children }: { children: ReactNode }) {
  return <div className="lab-button-row">{children}</div>;
}

export function Chip({
  onClick,
  selected,
  disabled,
  children,
}: {
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`lab-chip${selected ? " selected" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button type="button" className="lab-primary-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button type="button" className="lab-secondary-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return <div className="lab-callout">{children}</div>;
}

export function Feedback({ ok, children }: { ok: boolean | null; children: ReactNode }) {
  if (children === "" || children === null) return <p className="lab-feedback" />;
  return <p className={`lab-feedback${ok === false ? " error" : ""}`}>{children}</p>;
}
