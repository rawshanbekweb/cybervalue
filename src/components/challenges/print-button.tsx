"use client";
import { useTranslator } from "@/components/locale-provider";

export function PrintButton() {
  const t = useTranslator();
  return (
    <button type="button" className="ctf-button" onClick={() => window.print()}>
      {t("Print or save as PDF")}
    </button>
  );
}
