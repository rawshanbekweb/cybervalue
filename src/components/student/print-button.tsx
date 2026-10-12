"use client";
import { Printer } from "lucide-react";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="student-button"
      onClick={() => window.print()}
    >
      <Printer size={16} aria-hidden="true" />
      {label}
    </button>
  );
}
