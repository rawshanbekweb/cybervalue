"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslator } from "@/components/locale-provider";

/** Sends a competition JSON file to /admin/ctf/import and opens the result. */
export function CtfImport() {
  const t = useTranslator();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="admin-field">
      <label htmlFor="ctf-import">{t("Import a competition (JSON)")}</label>
      <input
        id="ctf-import"
        type="file"
        accept="application/json,.json"
        disabled={busy}
        className="admin-input"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setBusy(true);
          setError("");
          const response = await fetch("/admin/ctf/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: file,
          }).catch(() => null);
          const body = await response?.json().catch(() => null);
          event.target.value = "";
          setBusy(false);
          if (response?.ok && body?.id)
            router.push(
              `/admin/ctf/events/${body.id}?ok=${encodeURIComponent("Imported as an unpublished draft. Add the files and check the times.")}`,
            );
          else setError(body?.error ?? t("The import failed."));
        }}
      />
      <p className="admin-help">
        {t(
          "A file exported here, or written by hand, up to 4 MiB; a hand-written file may carry the challenge files inline. See docs/challenges.md for the format.",
        )}
      </p>
      {busy && <p className="admin-help">{t("Importing…")}</p>}
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
