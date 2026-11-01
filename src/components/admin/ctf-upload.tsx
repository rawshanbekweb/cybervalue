"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslator } from "@/components/locale-provider";

/** Uploads challenge files one by one to /admin/ctf/upload. */
export function CtfUpload({ challengeId }: { challengeId: string }) {
  const t = useTranslator();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="admin-field">
      <label htmlFor="ctf-file">{t("Add files (up to 4 MiB each)")}</label>
      <input
        id="ctf-file"
        type="file"
        multiple
        disabled={busy}
        className="admin-input"
        onChange={async (event) => {
          const files = [...(event.target.files ?? [])];
          setBusy(true);
          setError("");
          for (const file of files) {
            const response = await fetch(
              `/admin/ctf/upload?challenge=${encodeURIComponent(challengeId)}`,
              {
                method: "POST",
                headers: { "x-file-name": encodeURIComponent(file.name) },
                body: file,
              },
            ).catch(() => null);
            if (!response?.ok) {
              const body = await response?.json().catch(() => null);
              setError(body?.error ?? t("The upload failed."));
              break;
            }
          }
          event.target.value = "";
          setBusy(false);
          router.refresh();
        }}
      />
      {busy && <p className="admin-help">{t("Uploading…")}</p>}
      {error && (
        <p className="admin-error" role="alert">
          {t(error)}
        </p>
      )}
    </div>
  );
}
