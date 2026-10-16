"use client";
import { Printer } from "lucide-react";

export function ReportPrint({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="button button-secondary report-print"
      onClick={() => window.print()}
    >
      <Printer size={15} aria-hidden="true" />
      {label}
    </button>
  );
}
