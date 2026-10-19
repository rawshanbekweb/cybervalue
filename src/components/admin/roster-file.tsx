"use client";
import { useId, useState } from "react";
import { useTranslator } from "@/components/locale-provider";
import { rosterFromCsv } from "@/lib/csv";

const MAX_BYTES = 512 * 1024;

// Fills a roster textarea from a CSV file. Nothing is uploaded: the file is
// read in the browser and the lines can be checked before creating codes.
export function RosterFile({ onLoad }: { onLoad: (roster: string) => void }) {
  const t = useTranslator();
  const id = useId();
  const [message, setMessage] = useState<{ error: boolean; text: string }>();
  return (
    <div className="admin-field">
      <label htmlFor={id}>
        {t("Or load a CSV file (from Excel or Google Sheets)")}
      </label>
      <input
        id={id}
        type="file"
        accept=".csv,.txt,text/csv,text/plain"
        className="admin-input"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (file.size > MAX_BYTES) {
            setMessage({
              error: true,
              text: t("The file is too large (up to 512 KB)."),
            });
            return;
          }
          const roster = rosterFromCsv(await file.text());
          if (!roster) {
            setMessage({
              error: true,
              text: t("No names found in this file."),
            });
            return;
          }
          onLoad(roster);
          setMessage({
            error: false,
            text: t(
              "{count} names loaded. Check the list, then create the codes.",
              {
                count: roster.split("\n").length,
              },
            ),
          });
        }}
      />
      <span className="admin-help">
        {t(
          "Columns: Name (or First name and Last name) and Group. In Excel use File → Save as → CSV.",
        )}
      </span>
      {message && (
        <span
          className={message.error ? "admin-error" : undefined}
          role={message.error ? "alert" : "status"}
        >
          {message.text}
        </span>
      )}
    </div>
  );
}
